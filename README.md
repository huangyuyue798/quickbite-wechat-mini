# QuickBite 外卖点餐微信小程序 🍔

一个基于**微信小程序** + **Node.js** 的外卖点餐系统，前后端分离，适合学习和个人项目实战。

## ✨ 功能特性

- ✅ 微信授权登录（支持开发环境模拟登录）
- ✅ 店铺列表 + 关键词搜索 + 分类筛选
- ✅ 店铺详情 + 商品分类浏览
- ✅ 购物车：加购 / 减购 / 数量修改 / 清空
- ✅ 地址管理：新增 / 编辑 / 删除 / 设为默认
- ✅ 下单流程：确认订单 → 选择地址 → 提交订单
- ✅ 订单管理：状态流转（待付款 → 待接单 → 配送中 → 已完成）
- ✅ 订单详情：支付（模拟） / 取消 / 确认收货

## 🛠 技术栈

| 端 | 技术 |
| --- | --- |
| 前端 | 微信小程序（WXML + WXSS + JavaScript，原生开发） |
| 后端 | Node.js + Express |
| 数据库 | MySQL 8.x |
| 鉴权 | JWT（jsonwebtoken） |
| 部署 | 腾讯云 / 阿里云 / Docker（可选） |

## 📁 项目结构

```
quickbite-wechat-mini/
├── miniprogram/                 # 微信小程序前端
│   ├── app.js / app.json / app.wxss
│   ├── pages/
│   │   ├── index/               # 首页（店铺列表 + 搜索 + 分类）
│   │   ├── shop/                # 店铺详情（商品 + 购物车）
│   │   ├── cart/                # 购物车
│   │   ├── confirm-order/       # 确认订单
│   │   ├── order/               # 订单列表
│   │   ├── order-detail/        # 订单详情
│   │   ├── address/             # 地址列表
│   │   ├── address-edit/        # 地址编辑
│   │   ├── mine/                # 我的
│   │   └── login/               # 登录
│   ├── components/              # 自定义组件
│   │   ├── shop-card/           # 店铺卡片
│   │   ├── goods-card/          # 商品卡片
│   │   ├── cart-bar/            # 底部购物车栏
│   │   ├── stepper/             # 数量步进器
│   │   └── empty/               # 空状态
│   └── utils/                   # 工具（request/auth/util）
├── server/                      # Node.js 后端
│   ├── app.js                   # 服务入口
│   ├── config/                  # 配置
│   ├── db/                      # MySQL 连接池
│   ├── middleware/              # JWT 鉴权中间件
│   ├── routes/                  # 路由（auth/shop/cart/address/order）
│   ├── utils/                   # 响应工具
│   └── sql/init.sql             # 数据库初始化脚本（含示例数据）
├── project.config.json          # 小程序项目配置
└── .gitignore
```

## 🚀 快速开始

### 1. 初始化数据库

```bash
# 确保本机已安装并启动 MySQL
mysql -u root -p < server/sql/init.sql
```

脚本会自动创建 `quickbite` 数据库、全部表结构，并写入示例数据（4 家店铺 + 22 个商品）。

### 2. 启动后端

```bash
cd server
cp .env.example .env        # Windows: copy .env.example .env
# 按本机环境修改 .env 中的数据库账号密码

npm install
npm run dev                 # 开发模式（nodemon）或 npm start
```

启动成功后终端显示：`✅ QuickBite 后端服务已启动: http://localhost:3000`。

健康检查：浏览器访问 `http://localhost:3000/api/health`。

### 3. 运行小程序

1. 下载并打开 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目根目录 `quickbite-wechat-mini`，AppID 使用测试号（`touristappid`，已配置）
3. 如需真机调试，将 `miniprogram/utils/request.js` 中的 `BASE_URL` 改为电脑局域网 IP，如 `http://192.168.1.100:3000/api`
4. 编译运行，在"我的 → 登录"页面选择"开发环境模拟登录"即可体验完整流程

> 提示：开发者工具需勾选"不校验合法域名"（`project.config.json` 已配置 `urlCheck: false`）。

## 🔌 接口一览

| 方法 | 路径 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| POST | /api/auth/login | 登录（code 换 token） | 否 |
| GET | /api/auth/profile | 获取用户信息 | 是 |
| PUT | /api/auth/profile | 更新用户信息 | 是 |
| GET | /api/shops | 店铺列表（keyword/category 筛选） | 否 |
| GET | /api/shops/categories | 店铺分类 | 否 |
| GET | /api/shops/:id | 店铺详情 | 否 |
| GET | /api/shops/:id/goods | 店铺商品（含分类） | 否 |
| GET | /api/cart | 购物车（按店铺分组） | 是 |
| POST | /api/cart | 加入购物车 | 是 |
| PUT | /api/cart/:id | 修改数量 | 是 |
| DELETE | /api/cart/:id | 删除单项 | 是 |
| DELETE | /api/cart | 清空购物车 | 是 |
| GET/POST | /api/address | 地址列表 / 新增 | 是 |
| PUT/DELETE | /api/address/:id | 更新 / 删除 | 是 |
| PUT | /api/address/:id/default | 设为默认 | 是 |
| POST | /api/orders | 创建订单 | 是 |
| GET | /api/orders | 订单列表（status 筛选） | 是 |
| GET | /api/orders/:id | 订单详情 | 是 |
| PUT | /api/orders/:id/pay | 支付（模拟） | 是 |
| PUT | /api/orders/:id/cancel | 取消订单 | 是 |
| PUT | /api/orders/:id/deliver | 商家发货（开发用） | 是 |
| PUT | /api/orders/:id/confirm | 确认收货 | 是 |

## 📌 后续计划

- [ ] 接入微信支付
- [ ] 商家端接单管理
- [ ] 实时订单推送（WebSocket）
- [ ] 骑手模拟配送
- [ ] 使用 Go + Gin 重构后端（大二暑假计划）

## 📄 License

MIT

---

欢迎 Star / Fork / Issue，一起学习交流！🎉
