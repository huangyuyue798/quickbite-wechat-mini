const express = require('express');
const cors = require('cors');
const config = require('./config');
const db = require('./db');

// 路由模块
const authRouter = require('./routes/auth');
const shopRouter = require('./routes/shop');
const cartRouter = require('./routes/cart');
const addressRouter = require('./routes/address');
const orderRouter = require('./routes/order');

const app = express();

app.use(cors());
app.use(express.json());

// 简单请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString('zh-CN')}] ${req.method} ${req.url}`);
  next();
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'ok', data: { time: new Date().toISOString() } });
});

// 业务路由
app.use('/api/auth', authRouter);
app.use('/api/shops', shopRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/orders', orderRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在', data: null });
});

// 统一错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
});

// 启动前先验证数据库连接
db.query('SELECT 1')
  .then(() => {
    app.listen(config.port, () => {
      console.log(`✅ QuickBite 后端服务已启动: http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    console.error('❌ 数据库连接失败，请检查 MySQL 是否启动以及 server/.env 配置:');
    console.error('  ' + err.message);
    process.exit(1);
  });
