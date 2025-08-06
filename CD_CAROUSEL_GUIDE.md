# CD轮播跳转机制说明

## 概述

CD轮播跳转到产品页面的机制是通过 `productLink` 字段实现的。

## 工作流程

### 1. CD轮播管理
在管理界面的"CD轮播管理"中，每个CD条目包含：
- **CD标题** - 专辑名称
- **CD图片** - 专辑封面
- **产品链接** - 关键字段，指向对应的产品页面
- **可见性** - 控制是否在首页显示
- **排序** - 控制显示顺序

### 2. 产品页面管理
在"产品页面管理"中，每个产品页面包含：
- **产品标题** - 专辑名称
- **详细信息** - 曲目列表、制作人员等
- **可见性** - 控制产品页面是否可用

### 3. 跳转机制

#### 设置productLink
1. 在CD轮播管理中编辑CD
2. 在"产品链接"字段中填入对应的产品页面路径
3. 例如：`/products/iloveitwhensherideonme`

#### 前端实现
```javascript
// 在首页CD轮播中
<Link href={cd.productLink}>
  <img src={cd.image} alt={cd.title} />
</Link>
```

## 示例配置

### CD条目配置
```
标题: "I Love It When She Ride On Me"
图片: "/cd/album-art.png"
产品链接: "/products/iloveitwhensherideonme"
可见性: 显示
排序: 1
```

### 对应产品页面
```
标题: "I LOVE IT WHEN SHE RIDE ON ME"
路径: /products/iloveitwhensherideonme
曲目列表: ["A1 · HAPPY BOY", "A2 · YOU", ...]
```

## 注意事项

1. **路径匹配** - productLink必须与产品页面的实际路径匹配
2. **可见性控制** - CD和产品页面都可以独立控制可见性
3. **数据同步** - 修改后会自动同步到前台显示

## 故障排除

### 点击CD无法跳转
1. 检查CD的productLink字段是否正确设置
2. 确认对应的产品页面是否存在
3. 验证产品页面的可见性设置

### 产品页面显示错误
1. 检查trackList数据格式（字符串或数组）
2. 确认所有必填字段都已填写
3. 验证图片路径是否正确 