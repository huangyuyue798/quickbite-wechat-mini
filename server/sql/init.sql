-- ============================================================
-- QuickBite 外卖点餐小程序 · 数据库初始化脚本
-- 用法: mysql -u root -p < init.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS quickbite DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quickbite;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `openid`     VARCHAR(64)  NOT NULL COMMENT '微信 openid',
  `nickname`   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar`     VARCHAR(255) NOT NULL DEFAULT '' COMMENT '头像 URL',
  `phone`      VARCHAR(20)  NOT NULL DEFAULT '' COMMENT '手机号',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 店铺表
CREATE TABLE IF NOT EXISTS `shop` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(64)  NOT NULL COMMENT '店铺名称',
  `logo`          VARCHAR(255) NOT NULL DEFAULT '' COMMENT '店铺 logo URL',
  `description`   VARCHAR(255) NOT NULL DEFAULT '' COMMENT '店铺简介',
  `category`      VARCHAR(32)  NOT NULL DEFAULT '快餐' COMMENT '店铺分类',
  `rating`        DECIMAL(2,1) NOT NULL DEFAULT 5.0 COMMENT '评分',
  `monthly_sales` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '月售',
  `delivery_fee`  DECIMAL(6,2) NOT NULL DEFAULT 3.00 COMMENT '配送费',
  `min_price`     DECIMAL(6,2) NOT NULL DEFAULT 15.00 COMMENT '起送价',
  `delivery_time` INT UNSIGNED NOT NULL DEFAULT 30 COMMENT '预计配送时长(分钟)',
  `notice`        VARCHAR(255) NOT NULL DEFAULT '' COMMENT '店铺公告',
  `status`        TINYINT      NOT NULL DEFAULT 1 COMMENT '状态 1营业 0打烊',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店铺表';

-- 店铺商品分类表
CREATE TABLE IF NOT EXISTS `goods_category` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `shop_id`    INT UNSIGNED NOT NULL COMMENT '店铺 ID',
  `name`       VARCHAR(32)  NOT NULL COMMENT '分类名称',
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`),
  KEY `idx_shop` (`shop_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店铺商品分类表';

-- 商品表
CREATE TABLE IF NOT EXISTS `goods` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `shop_id`       INT UNSIGNED NOT NULL COMMENT '店铺 ID',
  `category_id`   INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '分类 ID',
  `name`          VARCHAR(64)  NOT NULL COMMENT '商品名称',
  `image`         VARCHAR(255) NOT NULL DEFAULT '' COMMENT '商品图片 URL',
  `price`         DECIMAL(6,2) NOT NULL COMMENT '售价',
  `original_price` DECIMAL(6,2) NOT NULL DEFAULT 0 COMMENT '原价',
  `description`   VARCHAR(255) NOT NULL DEFAULT '' COMMENT '商品描述',
  `unit`          VARCHAR(16)  NOT NULL DEFAULT '份' COMMENT '单位',
  `sales`         INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '销量',
  `stock`         INT UNSIGNED NOT NULL DEFAULT 999 COMMENT '库存',
  `status`        TINYINT      NOT NULL DEFAULT 1 COMMENT '状态 1上架 0下架',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_shop_category` (`shop_id`, `category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 收货地址表
CREATE TABLE IF NOT EXISTS `address` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED NOT NULL COMMENT '用户 ID',
  `name`       VARCHAR(32)  NOT NULL COMMENT '收货人姓名',
  `phone`      VARCHAR(20)  NOT NULL COMMENT '收货人电话',
  `province`   VARCHAR(32)  NOT NULL COMMENT '省',
  `city`       VARCHAR(32)  NOT NULL COMMENT '市',
  `district`   VARCHAR(32)  NOT NULL COMMENT '区/县',
  `detail`     VARCHAR(255) NOT NULL COMMENT '详细地址',
  `tag`        VARCHAR(16)  NOT NULL DEFAULT '家' COMMENT '标签(家/公司/学校)',
  `is_default` TINYINT      NOT NULL DEFAULT 0 COMMENT '是否默认地址',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表';

-- 购物车表
CREATE TABLE IF NOT EXISTS `cart` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED NOT NULL COMMENT '用户 ID',
  `shop_id`    INT UNSIGNED NOT NULL COMMENT '店铺 ID',
  `goods_id`   INT UNSIGNED NOT NULL COMMENT '商品 ID',
  `count`      INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '数量',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_goods` (`user_id`, `goods_id`),
  KEY `idx_shop` (`shop_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no`        VARCHAR(32)  NOT NULL COMMENT '订单号',
  `user_id`         INT UNSIGNED NOT NULL COMMENT '用户 ID',
  `shop_id`         INT UNSIGNED NOT NULL COMMENT '店铺 ID',
  `status`          VARCHAR(16)  NOT NULL DEFAULT 'pending' COMMENT '状态 pending/paid/delivering/completed/cancelled',
  `goods_amount`    DECIMAL(8,2) NOT NULL COMMENT '商品金额',
  `delivery_fee`    DECIMAL(6,2) NOT NULL COMMENT '配送费',
  `total_price`     DECIMAL(8,2) NOT NULL COMMENT '实付金额',
  `address_id`      INT UNSIGNED NOT NULL COMMENT '地址 ID',
  `address_snapshot` JSON        NOT NULL COMMENT '地址快照',
  `remark`          VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_status` (`user_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单明细表
CREATE TABLE IF NOT EXISTS `order_item` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`    INT UNSIGNED NOT NULL COMMENT '订单 ID',
  `goods_id`    INT UNSIGNED NOT NULL COMMENT '商品 ID',
  `goods_name`  VARCHAR(64)  NOT NULL COMMENT '商品名称快照',
  `goods_image` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '商品图片快照',
  `price`       DECIMAL(6,2) NOT NULL COMMENT '成交单价',
  `unit`        VARCHAR(16)  NOT NULL DEFAULT '份' COMMENT '单位',
  `count`       INT UNSIGNED NOT NULL COMMENT '数量',
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- ============================================================
-- 示例数据
-- ============================================================

INSERT INTO `shop` (`id`, `name`, `description`, `category`, `rating`, `monthly_sales`, `delivery_fee`, `min_price`, `delivery_time`, `notice`) VALUES
(1, '甜心奶茶屋', '现做鲜果茶，好喝不贵，学生党首选', '饮品', 4.8, 1260, 2.00, 10.00, 25, '全场满 20 减 3，欢迎光临！'),
(2, '老王川味快餐', '地道川味小炒，米饭管饱，出餐快', '快餐', 4.7, 2350, 3.00, 15.00, 30, '高峰期出餐约 30 分钟，请耐心等待～'),
(3, '椒麻麻辣烫', '自选食材按斤称，麻辣鲜香随心配', '麻辣烫', 4.6, 980, 2.50, 12.00, 35, '新客立减 5 元，麻辣程度可选微辣/中辣/特辣'),
(4, '意式比萨小屋', '手工现烤薄底比萨，芝士拉丝', '西餐', 4.9, 750, 5.00, 25.00, 40, '现烤现做，配送稍慢请谅解');

INSERT INTO `goods_category` (`id`, `shop_id`, `name`, `sort_order`) VALUES
(1, 1, '招牌奶茶', 1),
(2, 1, '鲜果茶', 2),
(3, 1, '小食甜点', 3),
(4, 2, '盖浇饭', 1),
(5, 2, '小炒菜', 2),
(6, 2, '汤类', 3),
(7, 3, '素菜', 1),
(8, 3, '荤菜', 2),
(9, 3, '主食', 3),
(10, 4, '经典比萨', 1),
(11, 4, '小食饮品', 2);

INSERT INTO `goods` (`shop_id`, `category_id`, `name`, `price`, `original_price`, `description`, `unit`, `sales`, `stock`) VALUES
-- 甜心奶茶屋
(1, 1, '珍珠奶茶', 9.00, 12.00, 'Q弹珍珠 + 香浓奶茶，经典必点', '杯', 890, 500),
(1, 1, '红豆奶茶', 10.00, 12.00, '绵密红豆搭配丝滑奶茶', '杯', 560, 300),
(1, 1, '焦糖布丁奶茶', 11.00, 14.00, '焦糖布丁入口即化', '杯', 320, 300),
(1, 2, '满杯百香果', 12.00, 15.00, '百香果 + 橙片，酸甜解腻', '杯', 470, 400),
(1, 2, '芝士草莓', 14.00, 17.00, '当季草莓 + 咸香芝士奶盖', '杯', 610, 350),
(1, 3, '原味鸡蛋仔', 8.00, 10.00, '外脆内软，蛋香浓郁', '份', 280, 200),
-- 老王川味快餐
(2, 4, '宫保鸡丁饭', 16.00, 20.00, '鸡肉花生米，微辣下饭', '份', 760, 500),
(2, 4, '鱼香肉丝饭', 15.00, 18.00, '咸甜微辣，经典川味', '份', 690, 500),
(2, 4, '回锅肉饭', 17.00, 20.00, '肥而不腻，蒜苗提香', '份', 540, 400),
(2, 5, '麻婆豆腐', 12.00, 15.00, '麻辣鲜香烫，拌饭一绝', '份', 480, 300),
(2, 5, '干煸四季豆', 13.00, 16.00, '干香入味，微辣', '份', 390, 300),
(2, 6, '番茄蛋花汤', 6.00, 8.00, '清淡暖胃，配饭解腻', '份', 300, 200),
-- 椒麻麻辣烫
(3, 7, '生菜', 3.00, 0, '按份计价，新鲜爽脆', '份', 420, 999),
(3, 7, '土豆片', 3.00, 0, '厚切入味，糯而不烂', '份', 380, 999),
(3, 7, '金针菇', 4.00, 0, '吸汤利器', '份', 350, 999),
(3, 8, '肥牛卷', 8.00, 0, '精选肥牛，鲜嫩多汁', '份', 510, 999),
(3, 8, '午餐肉', 6.00, 0, '经典午餐肉，越煮越香', '份', 430, 999),
(3, 8, '虾滑', 10.00, 0, '手打虾滑，Q弹鲜美', '份', 360, 500),
(3, 9, '方便面', 4.00, 0, '麻辣烫灵魂伴侣', '份', 580, 999),
-- 意式比萨小屋
(4, 10, '玛格丽特比萨', 32.00, 38.00, '番茄 + 罗勒 + 马苏里拉，经典意式', '9寸', 260, 200),
(4, 10, '超级至尊比萨', 45.00, 52.00, '培根香肠火腿什锦配料', '9寸', 310, 200),
(4, 10, '榴莲芝士比萨', 48.00, 55.00, '整块榴莲果肉，香气浓郁', '9寸', 220, 150),
(4, 11, '黄金鸡翅(4只)', 18.00, 22.00, '外酥里嫩，配蘸酱', '份', 180, 300),
(4, 11, '可乐(罐装)', 5.00, 6.00, '冰镇可乐', '罐', 260, 500);
