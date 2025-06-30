// Firebase数据迁移脚本
import { 
  migrateProductsFromJSON, 
  initializeCDs,
  getAllProducts,
  getAllCDs
} from "../lib/firebaseService.js"

async function initializeFirebaseData() {
  console.log("🚀 开始初始化Firebase数据...")

  try {
    // 检查是否已有数据
    const existingProducts = await getAllProducts()
    const existingCDs = await getAllCDs()

    if (existingProducts.products.length > 0) {
      console.log("📦 发现现有产品数据:", existingProducts.products.length, "个商品")
    } else {
      console.log("📦 迁移产品数据...")
      const migratedProducts = await migrateProductsFromJSON()
      console.log("✅ 产品数据迁移完成:", migratedProducts.length, "个商品")
    }

    if (existingCDs.length > 0) {
      console.log("💿 发现现有CD数据:", existingCDs.length, "个CD")
    } else {
      console.log("💿 初始化CD数据...")
      const initializedCDs = await initializeCDs()
      console.log("✅ CD数据初始化完成:", initializedCDs.length, "个CD")
    }

    console.log("🎉 Firebase数据初始化完成!")
    console.log("\n现在您可以：")
    console.log("1. 使用开发者模式管理商品和CD")
    console.log("2. 通过图片管理功能上传新图片")
    console.log("3. 在商店页面查看从Firebase加载的商品")

  } catch (error) {
    console.error("❌ Firebase数据初始化失败:", error)
    console.log("\n请检查：")
    console.log("1. Firebase配置是否正确")
    console.log("2. 网络连接是否正常")
    console.log("3. Firebase项目权限设置")
  }
}

// 如果作为脚本运行
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeFirebaseData()
}

export { initializeFirebaseData } 