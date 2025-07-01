# XANGDIGITAL.ASIA 音乐网站

这是一个基于Next.js和Firebase的现代音乐网站，提供CD轮播展示、商品管理和内容管理功能。

## 主要功能

### 🎵 前端功能
- **CD轮播** - 支持点击切换、键盘导航、自动居中的3D视觉效果
- **响应式设计** - 自适应桌面端和移动端显示
- **产品页面** - 详细的专辑信息展示，包括曲目列表和发布详情
- **商店功能** - 产品浏览和展示

### ⚙️ 后端管理
- **商品管理** - 创建、编辑、删除商品信息
- **CD轮播管理** - 管理首页CD显示顺序和内容
- **图片管理** - 支持本地图片库管理
- **产品页面管理** - 编辑专辑详情、曲目列表等内容
- **数据维护** - 一键修复图片路径、清理无效数据

## 技术栈

- **Frontend**: Next.js 15, React 19, CSS Modules
- **Backend**: Firebase (Firestore, Storage)
- **部署**: Vercel/Firebase Hosting
- **样式**: CSS Modules + 自定义样式

## 项目结构

```
├── app/                    # Next.js 13+ App Router
│   ├── page.js            # 主页 (CD轮播)
│   ├── admin/             # 管理后台
│   ├── shop/              # 商店页面
│   └── products/          # 产品详情页
├── components/            # React组件
│   ├── DynamicCDs.js     # CD轮播组件
│   └── ui/               # UI组件库
├── lib/                  # 工具函数
│   ├── firebase.js       # Firebase配置
│   ├── firebaseService.js # Firebase服务
│   └── utils.ts          # 通用工具
├── public/               # 静态资源
│   ├── cd/              # CD图片
│   ├── product/         # 产品图片
│   └── favicon.png      # 网站图标
└── scripts/             # 工具脚本
```

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置Firebase
1. 在Firebase控制台创建项目
2. 复制配置到 `lib/firebase.js`
3. 启用Firestore和Storage服务

### 3. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

### 4. 访问管理后台
1. 访问 http://localhost:3000/admin
2. 输入密码：`88888888`
3. 管理商品、CD和内容

## 管理功能

### 商品管理
- ✅ 增删改查商品信息
- ✅ 图片选择和预览
- ✅ 可见性控制

### CD轮播管理  
- ✅ 管理首页CD显示
- ✅ 设置链接和顺序
- ✅ 图片更换

### 图片管理
- ✅ 本地图片库管理
- ✅ 支持17种图片格式
- ✅ 自动路径检测

### 产品页面管理
- ✅ 编辑专辑详情
- ✅ 曲目列表管理
- ✅ 发布信息维护
- ✅ 实时预览

### 数据维护
- 🔧 **修复图片路径** - 一键修复错误的图片路径
- 🗑️ **清理数据** - 删除损坏或无效的数据项
- 🧹 **缓存清理** - 清除本地缓存确保数据同步

## 部署说明

### 1. 配置环境变量
创建 `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. 构建项目
```bash
npm run build
```

### 3. 部署
- **Vercel**: 连接GitHub仓库自动部署
- **Firebase**: `firebase deploy`

## 注意事项

### 图片路径规范
- CD图片: `/cd/filename.ext`
- 产品图片: `/product/filename.ext`
- 通用图片: `/filename.ext`

### 数据结构
```javascript
// CD数据结构
{
  id: "cd1",
  title: "专辑名称",
  image: "/cd/image.png",
  productLink: "/products/album-id",
  visible: true,
  order: 1
}

// 产品页面数据结构
{
  id: "album-id",
  title: "专辑名称",
  description: "专辑描述",
  image: "/cd/image.png",
  price: "€23.00",
  trackList: ["A1 · 曲目1", "A2 · 曲目2"],
  details: {
    catalog: "YR0189",
    album: "专辑名称",
    releaseType: "Album",
    releaseDate: "20/09/2024",
    label: "厂牌名称"
  }
}
```

## 维护指南

### 日常操作
1. **添加新专辑**: 管理后台 → 产品页面管理 → 新增页面
2. **更新CD轮播**: 管理后台 → CD轮播管理 → 编辑
3. **修复问题**: 管理后台 → 清理数据 → 修复图片路径

### 故障排除
- **CD轮播不显示**: 检查DynamicCDs组件，清理数据并重启
- **图片404错误**: 使用"修复图片路径"功能
- **数据不同步**: 清理缓存并刷新页面

## 开发者说明

### 核心组件
- `DynamicCDs`: CD轮播的核心组件，包含3D效果和交互逻辑
- `firebaseService`: 所有Firebase操作的统一服务层
- `admin/page.js`: 完整的后台管理界面

### 性能优化
- ✅ Firebase查询缓存
- ✅ 图片懒加载和错误处理  
- ✅ 组件状态优化
- ✅ 网络重试机制

---

*最后更新: 2024年1月* 