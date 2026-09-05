const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok, fail } = require('../utils/response');

const router = express.Router();

// 地址相关接口均需登录
router.use(auth);

/**
 * GET /api/address 地址列表（默认地址排最前）
 */
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, phone, province, city, district, detail, tag, is_default
       FROM address WHERE user_id = ?
       ORDER BY is_default DESC, id DESC`,
      [req.user.id]
    );
    ok(res, rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/address 新增地址
 * body: { name, phone, province, city, district, detail, tag, isDefault }
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, phone, province, city, district, detail, tag = '家', isDefault = 0 } = req.body || {};
    if (!name || !phone || !province || !city || !district || !detail) {
      return fail(res, '请填写完整地址信息');
    }

    // 若设为默认，先把其他地址取消默认
    if (isDefault) {
      await db.query('UPDATE address SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    const [result] = await db.query(
      'INSERT INTO address (user_id, name, phone, province, city, district, detail, tag, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, phone, province, city, district, detail, tag, isDefault ? 1 : 0]
    );

    ok(res, { id: result.insertId }, '新增成功');
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/address/:id 更新地址
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { name, phone, province, city, district, detail, tag, isDefault } = req.body || {};

    const [rows] = await db.query('SELECT id FROM address WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return fail(res, '地址不存在', 404);

    if (isDefault) {
      await db.query('UPDATE address SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    await db.query(
      `UPDATE address SET
         name = COALESCE(?, name),
         phone = COALESCE(?, phone),
         province = COALESCE(?, province),
         city = COALESCE(?, city),
         district = COALESCE(?, district),
         detail = COALESCE(?, detail),
         tag = COALESCE(?, tag),
         is_default = ?
       WHERE id = ? AND user_id = ?`,
      [name, phone, province, city, district, detail, tag, isDefault ? 1 : 0, req.params.id, req.user.id]
    );

    ok(res, null, '更新成功');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/address/:id 删除地址
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM address WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    ok(res, null, '已删除');
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/address/:id/default 设为默认地址
 */
router.put('/:id/default', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id FROM address WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return fail(res, '地址不存在', 404);

    await db.query('UPDATE address SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    await db.query('UPDATE address SET is_default = 1 WHERE id = ?', [req.params.id]);

    ok(res, null, '已设为默认');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
