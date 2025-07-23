# Shopify集成指南

## 概述

本项目已集成Shopify Buy Button，可以在商品页面显示购买按钮，实现直接购买功能。

## 配置步骤

### 1. 创建Shopify商店

1. 访问 [Shopify官网](https://www.shopify.com) 创建商店
2. 添加你的商品到Shopify商店
3. 获取商店域名（例如：your-store.myshopify.com）

### 2. 获取Storefront Access Token

1. 登录Shopify管理后台
2. 进入 Settings > Apps and sales channels
3. 点击 "Develop apps"
4. 创建新应用或选择现有应用
5. 在 "Configuration" 中启用 "Storefront API"
6. 复制 "Storefront access token"

### 3. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# Shopify集成配置
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your-storefront-access-token
```

### 4. 在管理后台配置商品

1. 访问管理后台 (`/admin`)
2. 进入 "商品管理" 标签页
3. 编辑商品，填写以下Shopify字段：
   - **Shopify产品ID**: 从Shopify商品页面URL获取（例如：gid://shopify/Product/123456789）
   - **Shopify变体ID**: 商品变体的ID（例如：gid://shopify/ProductVariant/987654321）
   - **Shopify Handle**: 商品的handle（URL中的标识符）
   - **Shopify库存状态**: 是否可购买
   - **Shopify价格**: 显示价格（例如：€15.99）
   - **货币**: 选择货币类型

## 获取Shopify产品ID

### 方法1：从URL获取
1. 在Shopify管理后台打开商品
2. 查看浏览器地址栏，URL格式为：
   ```
   https://your-store.myshopify.com/admin/products/123456789
   ```
3. 产品ID就是URL中的数字部分

### 方法2：使用Shopify GraphQL API
```graphql
query {
  products(first: 10) {
    edges {
      node {
        id
        title
        handle
        variants(first: 1) {
          edges {
            node {
              id
              price
            }
          }
        }
      }
    }
  }
}
```

## 功能特性

### 1. 自动购买按钮
- 商品页面自动显示Shopify购买按钮
- 支持数量选择和购物车功能
- 响应式设计，适配移动端

### 2. 库存管理
- 实时显示库存状态
- 缺货商品显示"暂时缺货"
- 支持多货币显示

### 3. 样式定制
- 购买按钮样式与网站风格一致
- 支持悬停效果
- 可自定义按钮颜色和字体

## 故障排除

### 购买按钮不显示
1. 检查环境变量是否正确配置
2. 确认Shopify产品ID是否正确
3. 检查网络连接和Shopify API状态

### 价格显示错误
1. 确认Shopify价格字段已填写
2. 检查货币设置是否正确
3. 验证Shopify商店中的价格设置

### 购买功能异常
1. 确认Storefront Access Token有效
2. 检查Shopify商店是否启用在线销售
3. 验证支付方式配置

## 高级配置

### 自定义按钮样式
在 `components/ShopifyBuyButton.js` 中修改样式配置：

```javascript
styles: {
  button: {
    'background-color': '#000000',
    'color': '#ffffff',
    'border': '1px solid #000000',
    'border-radius': '0px',
    'font-family': 'monospace',
    'font-size': '14px',
    'font-weight': 'bold',
    'text-transform': 'uppercase',
    'letter-spacing': '1px',
    'padding': '12px 24px'
  }
}
```

### 多语言支持
在商品配置中添加多语言价格字段：
- `shopifyPriceEN`: 英文价格
- `shopifyPriceCN`: 中文价格
- `shopifyPriceJP`: 日文价格

## 安全注意事项

1. **不要提交环境变量文件**
   - `.env.local` 文件已添加到 `.gitignore`
   - 不要在代码中硬编码API密钥

2. **定期更新Access Token**
   - Storefront Access Token可能会过期
   - 建议定期检查和更新

3. **监控API使用量**
   - Shopify API有使用限制
   - 监控API调用次数避免超出限制

## 支持

如果遇到问题，请：
1. 检查浏览器控制台错误信息
2. 查看Shopify API文档
3. 联系技术支持 