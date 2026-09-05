const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const auth = require('../middleware/auth');
const { ok, fail } = require('../utils/response');

const router = express.Router();

/**
 * POST /api/auth/login 微信登录
 * body: { code }
 * 真实项目应调用微信 jscode2session 接口换取 openid：
 *   const { openid } = await jscode2session(code);
 * 本项目为便于本地开发调试，使用 code 的哈希值模拟 openid。
 */
router.post('/login', async (req, res, next) => {
  try {
    const { code } = req.body || {};
    if (!code) return fail(res, '缺少登录凭证 code');

    const openid = 'dev_' + crypto.createHash('md5').update(String(code)).digest('hex').slice(0, 16);

    let [users] = await db.query('SELECT * FROM user WHERE openid = ?', [openid]);
    let user = users[0];

    if (!user) {
      const [result] = await db.query('INSERT INTO user (openid, nickname, avatar) VALUES (?, ?, ?)', [openid, '微信用户', '']);
      user = { id: result.insertId, openid, nickname: '微信用户', avatar: '', phone: '' };
    }

    const token = jwt.sign({ id: user.id, openid: user.openid }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    ok(res, {
      token,
      userInfo: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone || ''
      }
    }, '登录成功');
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/profile 获取当前用户信息（需登录）
router.get('/profile', auth, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, openid, nickname, avatar, phone, created_at FROM user WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return fail(res, '用户不存在', 404);
    ok(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/profile 更新用户信息（需登录）
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { nickname, avatar, phone } = req.body || {};
    await db.query(
      'UPDATE user SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar), phone = COALESCE(?, phone) WHERE id = ?',
      [nickname, avatar, phone, req.user.id]
    );
    ok(res, null, '更新成功');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
