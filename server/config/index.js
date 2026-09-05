const path = require('path');
// 加载 .env 环境变量（开发环境可复制 .env.example 为 .env）
require('dotenv').config({ path: path.join(__dirname, '../.env') });

module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'quickbite'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'quickbite-dev-secret',
    expiresIn: '30d'
  }
};
