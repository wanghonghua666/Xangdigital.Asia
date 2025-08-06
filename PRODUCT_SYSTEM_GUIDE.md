# 产品系统指南

## 概述

您的网站有两个相关的产品数据系统：

### 1. 商品管理 (`products` 集合)
- **用途**: 在商店页面显示的商品列表
- **位置**: `/shop` 页面
- **功能**: 显示商品基本信息（标题、价格、图片等）
- **链接**: 点击后跳转到详细的产品页面

### 2. 产品页面管理 (`productPages` 集合)
- **用途**: 详细的产品页面内容
- **位置**: `/products/{slug}` 页面
- **功能**: 显示完整的专辑信息（曲目列表、制作人员、详细信息等）

## 关联方式

### 方法1: 通过productPageSlug字段（推荐）
在商品管理中设置 `productPageSlug` 字段，直接指定对应的产品页面：

```
商品: "I Love It When She Ride On Me"
productPageSlug: "iloveitwhensherideonme"
```

### 方法2: 通过标题匹配（自动）
如果商品标题与产品页面标题匹配，系统会自动关联：

```
商品标题: "I Love It When She Ride On Me"
产品页面标题: "I LOVE IT WHEN SHE RIDE ON ME"
```

## 工作流程

1. **创建产品页面**: 在"产品页面管理"中创建详细的专辑页面
2. **创建商品**: 在"商品管理"中创建商店商品
3. **设置关联**: 在商品中填写 `productPageSlug` 字段
4. **测试链接**: 在商店页面点击商品，应该能正确跳转到产品页面

## 常见问题

### Q: 为什么点击商品无法打开产品页面？
A: 检查以下几点：
- 商品是否设置了正确的 `productPageSlug`
- 产品页面是否存在
- 商品标题是否与产品页面标题匹配

### Q: 如何创建新的产品页面？
A: 
1. 进入管理后台
2. 切换到"产品页面管理"标签
3. 点击"新增产品页面"
4. 填写详细信息（标题、描述、曲目列表等）
5. 保存后获得页面ID（slug）

### Q: 如何关联商品和产品页面？
A:
1. 在"商品管理"中编辑商品
2. 在 `productPageSlug` 字段中填入产品页面的ID
3. 保存商品

## 数据示例

### 商品数据示例
```json
{
  "title": "I Love It When She Ride On Me",
  "description": "Digital Album - Electronic Music",
  "price": 15.99,
  "image": "/cd/album-art.png",
  "productPageSlug": "iloveitwhensherideonme",
  "visible": true
}
```

### 产品页面数据示例
```json
{
  "id": "iloveitwhensherideonme",
  "title": "I LOVE IT WHEN SHE RIDE ON ME",
  "description": "140g white 12\" vinyl, printed inner sleeve.",
  "trackList": [
    "A1 · HAPPY BOY",
    "A2 · YOU",
    "A3 · EGO DEATH"
  ],
  "details": {
    "catalog": "YR0189",
    "label": "YEAR0001",
    "releaseDate": "20/09/2024"
  }
}
```

## 管理建议

1. **命名一致性**: 保持商品标题和产品页面标题的一致性
2. **Slug管理**: 使用有意义的slug，便于管理和SEO
3. **数据同步**: 定期检查商品和产品页面的数据是否同步
4. **测试链接**: 每次修改后测试商品链接是否正常工作 