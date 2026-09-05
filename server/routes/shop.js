const express = require('express');
const db = require('../db');
const { ok, fail } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/shops/categories 店铺分类列表
 */
router.get('/categories', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT category FROM shop WHERE status = 1 ORDER BY category');
    ok(res, rows.map((r) => r.category));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/shops 店铺列表
 * query: keyword 搜索关键词 / category 分类 / page 页码 / pageSize 每页条数
 */
router.get('/', async (req, res, next) => {
  try {
    const { keyword = '', category = '', page = 1, pageSize = 10 } = req.query;
    const conditions = ['status = 1'];
    const params = [];

    if (keyword) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    const where = conditions.join(' AND ');
    const offset = (Number(page) - 1) * Number(pageSize);

    const [rows] = await db.query(
      `SELECT id, name, logo, description, rating, monthly_sales, delivery_fee, min_price, delivery_time, category
       FROM shop WHERE ${where} ORDER BY rating DESC, monthly_sales DESC LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    );
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM shop WHERE ${where}`, params);

    ok(res, { list: rows, total, page: Number(page), pageSize: Number(pageSize) });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/shops/:id 店铺详情
 */
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, logo, description, rating, monthly_sales, delivery_fee, min_price, delivery_time, category, notice FROM shop WHERE id = ? AND status = 1',
      [req.params.id]
    );
    if (!rows.length) return fail(res, '店铺不存在或已打烊', 404);
    ok(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/shops/:id/goods 店铺商品列表（含分类）
 * 返回 { shop, categories, goods }，前端自行按分类过滤展示
 */
router.get('/:id/goods', async (req, res, next) => {
  try {
    const [shopRows] = await db.query('SELECT id, name FROM shop WHERE id = ? AND status = 1', [req.params.id]);
    if (!shopRows.length) return fail(res, '店铺不存在或已打烊', 404);

    const [categories] = await db.query(
      'SELECT id, name FROM goods_category WHERE shop_id = ? ORDER BY sort_order ASC, id ASC',
      [req.params.id]
    );
    const [goods] = await db.query(
      'SELECT id, shop_id, category_id, name, image, price, original_price, description, sales, stock, unit FROM goods WHERE shop_id = ? AND status = 1 ORDER BY sales DESC, id ASC',
      [req.params.id]
    );

    ok(res, { shop: shopRows[0], categories, goods });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
