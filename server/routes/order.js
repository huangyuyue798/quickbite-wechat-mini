const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok, fail } = require('../utils/response');

const router = express.Router();

// 订单相关接口均需登录
router.use(auth);

// 订单状态流转：
// pending(待付款) -> paid(待接单) -> delivering(配送中) -> completed(已完成)
// pending/paid 可取消 -> cancelled(已取消)

const STATUS_TEXT = {
  pending: '待付款',
  paid: '待接单',
  delivering: '配送中',
  completed: '已完成',
  cancelled: '已取消'
};

/**
 * POST /api/orders 创建订单
 * body: { shopId, addressId, items: [{ goodsId, count }], remark }
 */
router.post('/', async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { shopId, addressId, items, remark = '' } = req.body || {};
    if (!shopId || !addressId || !Array.isArray(items) || !items.length) {
      return fail(res, '下单参数不完整');
    }

    await connection.beginTransaction();

    // 校验收货地址
    const [addrRows] = await connection.query(
      'SELECT id, name, phone, province, city, district, detail FROM address WHERE id = ? AND user_id = ?',
      [addressId, req.user.id]
    );
    if (!addrRows.length) {
      await connection.rollback();
      return fail(res, '收货地址不存在');
    }

    // 校验商品并计算金额
    let goodsAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const [gRows] = await connection.query(
        'SELECT id, name, image, price, stock, unit FROM goods WHERE id = ? AND shop_id = ? AND status = 1',
        [item.goodsId, shopId]
      );
      if (!gRows.length) {
        await connection.rollback();
        return fail(res, '商品不存在或已下架');
      }
      const g = gRows[0];
      const count = Number(item.count) || 1;
      if (count < 1) {
        await connection.rollback();
        return fail(res, '商品数量不合法');
      }
      if (count > g.stock) {
        await connection.rollback();
        return fail(res, `「${g.name}」库存不足`);
      }
      goodsAmount += g.price * count;
      orderItems.push({
        goodsId: g.id, name: g.name, image: g.image, price: g.price, unit: g.unit, count
      });
    }

    // 校验店铺与起送价
    const [shopRows] = await connection.query(
      'SELECT id, name, delivery_fee, min_price FROM shop WHERE id = ? AND status = 1',
      [shopId]
    );
    if (!shopRows.length) {
      await connection.rollback();
      return fail(res, '店铺不存在或已打烊');
    }
    const shop = shopRows[0];
    if (goodsAmount < shop.min_price) {
      await connection.rollback();
      return fail(res, `未达到起送价 ${shop.min_price} 元`);
    }

    const deliveryFee = shop.delivery_fee;
    const totalPrice = goodsAmount + deliveryFee;
    const orderNo = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
      + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const addressSnapshot = JSON.stringify(addrRows[0]);

    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_no, user_id, shop_id, status, goods_amount, delivery_fee, total_price, address_id, address_snapshot, remark)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
      [orderNo, req.user.id, shopId, goodsAmount, deliveryFee, totalPrice, addressId, addressSnapshot, remark]
    );
    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.query(
        'INSERT INTO order_item (order_id, goods_id, goods_name, goods_image, price, unit, count) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, item.goodsId, item.name, item.image, item.price, item.unit, item.count]
      );
      await connection.query('UPDATE goods SET sales = sales + ? WHERE id = ?', [item.count, item.goodsId]);
    }

    // 下单后清空该店铺购物车
    await connection.query('DELETE FROM cart WHERE user_id = ? AND shop_id = ?', [req.user.id, shopId]);

    await connection.commit();
    ok(res, { orderId, orderNo, totalPrice, status: 'pending' }, '下单成功');
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

/**
 * GET /api/orders 订单列表
 * query: status 状态筛选（all 或不传表示全部）
 */
router.get('/', async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;
    const where = ['o.user_id = ?'];
    const params = [req.user.id];

    if (status && status !== 'all' && STATUS_TEXT[status]) {
      where.push('o.status = ?');
      params.push(status);
    }

    const [rows] = await db.query(
      `SELECT o.id, o.order_no, o.status, o.goods_amount, o.delivery_fee, o.total_price, o.created_at, o.remark,
              s.name AS shop_name, s.logo AS shop_logo
       FROM orders o
       LEFT JOIN shop s ON o.shop_id = s.id
       WHERE ${where.join(' AND ')}
       ORDER BY o.created_at DESC`,
      params
    );

    ok(res, rows.map((r) => ({ ...r, statusText: STATUS_TEXT[r.status] || r.status })));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/:id 订单详情（含商品明细）
 */
router.get('/:id', async (req, res, next) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, s.name AS shop_name, s.logo AS shop_logo
       FROM orders o LEFT JOIN shop s ON o.shop_id = s.id
       WHERE o.id = ? AND o.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!orders.length) return fail(res, '订单不存在', 404);

    const [items] = await db.query(
      'SELECT id, goods_id, goods_name, goods_image, price, unit, count FROM order_item WHERE order_id = ?',
      [req.params.id]
    );

    const order = orders[0];
    order.statusText = STATUS_TEXT[order.status] || order.status;
    order.address = order.address_snapshot ? JSON.parse(order.address_snapshot) : null;
    delete order.address_snapshot;
    order.items = items;

    ok(res, order);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/orders/:id/pay 模拟支付（待付款 -> 待接单）
 */
router.put('/:id/pay', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id FROM orders WHERE id = ? AND user_id = ? AND status = 'pending'",
      [req.params.id, req.user.id]
    );
    if (!rows.length) return fail(res, '订单不存在或状态不允许支付');

    await db.query("UPDATE orders SET status = 'paid' WHERE id = ?", [req.params.id]);
    ok(res, null, '支付成功');
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/orders/:id/deliver 商家接单发货（商家端接口，开发用）
 * 待接单 -> 配送中
 */
router.put('/:id/deliver', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id FROM orders WHERE id = ? AND status = 'paid'",
      [req.params.id]
    );
    if (!rows.length) return fail(res, '订单不存在或状态不允许发货');

    await db.query("UPDATE orders SET status = 'delivering' WHERE id = ?", [req.params.id]);
    ok(res, null, '已发货');
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/orders/:id/confirm 确认收货（配送中 -> 已完成）
 */
router.put('/:id/confirm', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id FROM orders WHERE id = ? AND user_id = ? AND status = 'delivering'",
      [req.params.id, req.user.id]
    );
    if (!rows.length) return fail(res, '订单不存在或状态不允许确认收货');

    await db.query("UPDATE orders SET status = 'completed' WHERE id = ?", [req.params.id]);
    ok(res, null, '已确认收货');
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/orders/:id/cancel 取消订单（待付款 / 待接单可取消）
 */
router.put('/:id/cancel', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id FROM orders WHERE id = ? AND user_id = ? AND status IN ('pending', 'paid')",
      [req.params.id, req.user.id]
    );
    if (!rows.length) return fail(res, '订单不存在或当前状态不可取消');

    await db.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    ok(res, null, '订单已取消');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
