const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok, fail } = require('../utils/response');

const router = express.Router();

// 购物车相关接口均需登录
router.use(auth);

/**
 * GET /api/cart 购物车列表（按店铺分组）
 */
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id AS cart_id, c.shop_id, c.goods_id, c.count,
              s.name AS shop_name, s.logo AS shop_logo, s.delivery_fee, s.min_price,
              g.name AS goods_name, g.image AS goods_image, g.price, g.unit, g.stock
       FROM cart c
       JOIN shop s ON c.shop_id = s.id
       JOIN goods g ON c.goods_id = g.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    // 按店铺分组
    const shopMap = new Map();
    rows.forEach((item) => {
      if (!shopMap.has(item.shop_id)) {
        shopMap.set(item.shop_id, {
          shopId: item.shop_id,
          shopName: item.shop_name,
          shopLogo: item.shop_logo,
          deliveryFee: item.delivery_fee,
          minPrice: item.min_price,
          goods: []
        });
      }
      shopMap.get(item.shop_id).goods.push({
        cartId: item.cart_id,
        goodsId: item.goods_id,
        name: item.goods_name,
        image: item.goods_image,
        price: item.price,
        unit: item.unit,
        stock: item.stock,
        count: item.count
      });
    });

    const list = Array.from(shopMap.values()).map((shop) => {
      let goodsAmount = 0;
      shop.goods.forEach((g) => {
        goodsAmount += g.price * g.count;
      });
      shop.goodsAmount = goodsAmount;
      return shop;
    });

    ok(res, list);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart 加入购物车
 * body: { shopId, goodsId, count }
 * 同一用户同一商品重复加入则数量累加
 */
router.post('/', async (req, res, next) => {
  try {
    const { shopId, goodsId, count = 1 } = req.body || {};
    if (!shopId || !goodsId) return fail(res, '参数不完整');

    const [goodsRows] = await db.query('SELECT id, shop_id, stock FROM goods WHERE id = ? AND status = 1', [goodsId]);
    if (!goodsRows.length) return fail(res, '商品不存在或已下架');
    if (goodsRows[0].shop_id !== Number(shopId)) return fail(res, '商品与店铺不匹配');

    const [existRows] = await db.query(
      'SELECT id, count FROM cart WHERE user_id = ? AND goods_id = ?',
      [req.user.id, goodsId]
    );

    if (existRows.length) {
      const newCount = existRows[0].count + Number(count);
      if (newCount > goodsRows[0].stock) return fail(res, '超出库存');
      await db.query('UPDATE cart SET count = ? WHERE id = ?', [newCount, existRows[0].id]);
    } else {
      if (Number(count) > goodsRows[0].stock) return fail(res, '超出库存');
      await db.query('INSERT INTO cart (user_id, shop_id, goods_id, count) VALUES (?, ?, ?, ?)', [
        req.user.id, shopId, goodsId, Number(count)
      ]);
    }

    ok(res, null, '已加入购物车');
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/cart/:id 修改购物车数量
 * body: { count }
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { count } = req.body || {};
    if (!count || count < 1) return fail(res, '数量不合法');

    const [rows] = await db.query('SELECT id, goods_id FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return fail(res, '购物车记录不存在', 404);

    const [goodsRows] = await db.query('SELECT stock FROM goods WHERE id = ?', [rows[0].goods_id]);
    if (count > goodsRows[0].stock) return fail(res, '超出库存');

    await db.query('UPDATE cart SET count = ? WHERE id = ?', [count, req.params.id]);
    ok(res, null, '已更新');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart/:id 删除购物车单项
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    ok(res, null, '已删除');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart 清空购物车
 */
router.delete('/', async (req, res, next) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    ok(res, null, '已清空');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
