# 动态页面生成系统

## 概述

本系统实现了基于Firebase数据的动态产品页面生成，所有产品页面都通过统一的动态路由 `/products/[slug]` 生成，无需手动创建静态页面。

## 系统架构

### 1. 动态路由系统
- **路由**: `/products/[slug]`
- **文件**: `app/products/[slug]/page.js`
- **样式**: `app/products/[slug]/product.module.css`
- **数据源**: Firebase `productPages` 集合

### 2. 智能返回导航
- **URL参数**: `?from=/shop` 或 `?from=/`
- **SessionStorage**: 存储来源页面信息
- **Referrer检测**: 自动检测来源页面
- **优先级**: URL参数 > SessionStorage > Referrer > 默认首页

### 3. 统一CSS样式
- **模板**: 基于oshamambe的样式
- **背景**: header-image2.jpg
- **字体**: JetBrains Mono
- **响应式**: 支持移动端适配

## 工作流程

### 1. 页面访问流程
```
用户点击CD/商品 → 添加来源参数 → 跳转到动态页面 → 加载Firebase数据 → 渲染页面
```

### 2. 返回导航流程
```
用户点击BACK → 检查来源信息 → 智能返回对应页面
```

### 3. 数据加载流程
```
动态路由 → 获取slug → 查询Firebase → 渲染数据 → 错误处理
```

## 实现细节

### 1. 智能返回导航实现

```javascript
// 1. URL参数检测
const from = searchParams.get('from')
if (from) {
  setBackUrl(decodeURIComponent(from))
  return
}

// 2. SessionStorage检测
const storedFrom = sessionStorage.getItem('productPageFrom')
if (storedFrom) {
  setBackUrl(storedFrom)
  return
}

// 3. Referrer检测
if (document.referrer) {
  const referrer = new URL(document.referrer)
  if (referrer.pathname === '/shop') {
    setBackUrl('/shop')
    return
  }
}

// 4. 默认返回首页
setBackUrl('/')
```

### 2. 来源信息传递

```javascript
// CD轮播链接
<Link 
  href={`${cd.productLink}?from=${encodeURIComponent('/')}`}
  onClick={() => {
    sessionStorage.setItem('productPageFrom', '/')
  }}
>

// 商店商品链接
<Link 
  href={`${productPath}?from=${encodeURIComponent('/shop')}`}
  onClick={() => {
    sessionStorage.setItem('productPageFrom', '/shop')
  }}
>
```

### 3. 数据格式处理

```javascript
// trackList格式兼容
let tracks = pageData.trackList
if (typeof tracks === 'string') {
  tracks = tracks.split('\n').filter(track => track.trim())
} else if (Array.isArray(tracks)) {
  tracks = tracks.filter(track => track && track.trim())
} else {
  tracks = []
}
```

## 优势

### 1. 完全动态化
- ✅ 无需手动创建静态页面
- ✅ 所有产品页面统一管理
- ✅ 数据与页面分离

### 2. 智能导航
- ✅ 根据来源智能返回
- ✅ 多种来源检测机制
- ✅ 用户体验优化

### 3. 统一样式
- ✅ 所有页面样式一致
- ✅ 易于维护和修改
- ✅ 响应式设计

### 4. 错误处理
- ✅ 数据加载失败处理
- ✅ 页面不存在处理
- ✅ 优雅降级

## 使用方式

### 1. 创建新产品页面
1. 在管理后台"产品页面管理"中创建
2. 设置页面ID（slug）
3. 填写详细信息
4. 保存后自动生成页面

### 2. 设置CD跳转
1. 在"CD轮播管理"中编辑CD
2. 设置productLink为 `/products/{slug}`
3. 保存后即可跳转

### 3. 设置商品跳转
1. 在"商品管理"中编辑商品
2. 设置productPageSlug字段
3. 保存后即可跳转

## 技术栈

- **Next.js 15**: App Router, 动态路由
- **React**: Hooks, 状态管理
- **Firebase**: Firestore数据库
- **CSS Modules**: 样式隔离
- **SessionStorage**: 客户端存储

## 扩展性

### 1. 添加新页面类型
- 创建新的动态路由
- 添加对应的数据集合
- 实现页面组件

### 2. 添加新来源页面
- 在来源检测逻辑中添加新路径
- 更新链接生成逻辑

### 3. 添加新数据字段
- 在Firebase中添加字段
- 在页面组件中渲染
- 在管理界面中编辑 