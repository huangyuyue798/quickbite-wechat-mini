const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * JWT 鉴权中间件
 * 从 Authorization: Bearer <token> 中解析用户身份，挂载到 req.user
 */
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录', data: null });
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录', data: null });
  }
};
