// 统一响应格式
// 成功: { code: 0, message, data }
// 失败: { code: 非 0, message, data: null }

exports.ok = function ok(res, data = null, message = 'ok') {
  res.json({ code: 0, message, data });
};

exports.fail = function fail(res, message = '操作失败', code = 1, status = 200) {
  res.status(status).json({ code, message, data: null });
};
