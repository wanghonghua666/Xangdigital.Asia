"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  getAllProducts, 
  getAllCDs, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  createCD,
  updateCD,
  deleteCD,
  uploadImage,
  getAllImages,
  deleteImage,
  migrateProductsFromJSON,
  initializeCDs,
  getAllProductPages,
  getProductPage,
  updateProductPage,
  initializeProductPages,
  clearCache,
  fixImagePaths,
  handleCleanupData
} from "../../lib/firebaseService"
import { collection, getDocs, deleteDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import ProductManagement from "../../components/admin/ProductManagement"
import CDManagement from "../../components/admin/CDManagement"
import ImageManagement from "../../components/admin/ImageManagement"
import ProductPageManagement from "../../components/admin/ProductPageManagement"
import {
  authContainerStyle,
  authFormStyle,
  containerStyle,
  headerStyle,
  headerActionsStyle,
  titleStyle,
  tabsStyle,
  tabStyle,
  activeTabStyle,
  errorBannerStyle,
  loadingBannerStyle,
  backButtonStyle,
  logoutButtonStyle
} from "../../components/admin/adminStyles"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // 数据状态
  const [products, setProducts] = useState([])
  const [cds, setCds] = useState([])
  const [images, setImages] = useState([])
  const [publicImages, setPublicImages] = useState([])
  const [productPages, setProductPages] = useState([])
  const [activeTab, setActiveTab] = useState("products")
  
  const router = useRouter()

  // 检查身份验证
  const handleAuth = async (e) => {
    e.preventDefault()
    if (password === "88888888") {
      setIsAuthenticated(true)
      setPassword("")
      setError("")
      await loadData()
    } else {
      setError("密码错误")
      setTimeout(() => setError(""), 2000)
    }
  }

  // 按需加载数据
  const loadData = async (tab = "products") => {
    setLoading(true)
    try {
      console.log(`🔥 加载${tab}数据...`)
      
      // 每次都确保public图片列表可用
      loadPublicImages()
      
      if (tab === "products" && products.length === 0) {
        const productsResult = await getAllProducts().catch(err => ({ products: [], error: err }))
        setProducts(productsResult.products || [])
      }
      
      if (tab === "cds" && cds.length === 0) {
        const cdsData = await getAllCDs().catch(err => [])
        setCds(cdsData)
      }
      
      if (tab === "images") {
        // 只加载public文件夹图片，不依赖Firebase Storage
        loadPublicImages()
      }
      
      if (tab === "product-pages") {        
        if (productPages.length === 0) {
        // 从Firebase加载产品页面数据
        try {
          let pagesData = await getAllProductPages()
          
          // 如果没有数据，则初始化默认数据
          if (pagesData.length === 0) {
            console.log('🆕 初始化产品页面数据...')
            pagesData = await initializeProductPages()
          }
          
          setProductPages(pagesData)
          console.log(`📄 加载了 ${pagesData.length} 个产品页面`)
        } catch (error) {
          console.error('❌ 产品页面数据加载失败:', error)
          // 使用本地默认数据作为fallback
          const defaultPages = [
            {
              id: 'iloveitwhensherideonme',
              title: 'I LOVE IT WHEN SHE RIDE ON ME',
              description: '140g white 12\" vinyl, printed inner sleeve.',
              image: '/cd/album-art.png',
              price: '€23.00',
              trackList: [
                'A1 · HAPPY BOY',
                'A2 · YOU', 
                'A3 · EGO DEATH',
                'A4 · I LOVE IT WHEN SHE RIDE ON ME',
                'B1 · WONDERFUL LIFE',
                'B2 · V.I.P. IS FOR EVERYONE',
                'B3 · HEAVEN JUST A BREATH AWAY'
              ],
              details: {
                catalog: 'YR0189',
                album: 'I LOVE IT WHEN SHE RIDE ON ME',
                releaseType: 'Album',
                releaseDate: '20/09/2024',
                label: 'YEAR0001',
                ar: 'Oskar Ekman',
                writer: 'Frederik Valentin',
                producer: 'Frederik Valentin',
                mixing: 'Frederik Valentin & Emil Emberg',
                master: 'Robin Schmidt (24-96 Mastering)',
                creativeDirector: 'Andre Jofré',
                artDirector: 'Victor Svedberg'
              }
            },
            {
              id: 'oshamambe',
              title: 'OSHAMAMBE',
              description: 'Digital EP release.',
              image: '/cd/album-cover.png',
              price: '€15.00',
              trackList: [
                'A1 · INTRO',
                'A2 · OSHAMAMBE THEME'
              ],
              details: {
                catalog: 'YR0190',
                album: 'OSHAMAMBE',
                releaseType: 'EP',
                releaseDate: '01/10/2024',
                label: 'YEAR0001'
              }
            }
          ]
          setProductPages(defaultPages)
        }
        }
      }
      
      console.log('✅ 数据加载成功')
    } catch (error) {
      console.error("❌ 数据加载失败:", error)
      setError(`加载数据失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 加载public文件夹中的图片
  const loadPublicImages = () => {
    const imageFiles = [
      // CD图片
      '/cd/album-art.png',
      '/cd/album-cover.png', 
      '/cd/cd-empty-1.png',
      '/cd/cd-placeholder-1.png',
      '/cd/cd-placeholder-2.png',
      '/cd/cd-placeholder-3.png',
      '/cd/Nia.jpg',
      
      // Product图片
      '/product/album-art-1.jpeg',
      '/product/album-cover-main.jpeg',
      
      // Products图片
      '/products/placeholder.jpg',
      
      // 根目录图片
      '/placeholder.svg',
      '/placeholder.jpg',
      '/placeholder-logo.png',
      '/placeholder-logo.svg',
      '/placeholder-user.jpg',
      '/header-image.jpg',
      '/header-image2.jpg'
    ]
    
    setPublicImages(imageFiles)
  }

  // 商品管理
  const handleCreateProduct = async () => {
    const newProduct = {
      title: "新商品",
      description: "商品描述",
      image: "/placeholder.svg",  // 使用存在的占位符图片
      price: 0,
      category: "music",
      visible: false,
      order: products.length + 1
    }
    
    setLoading(true)
    try {
      const productId = await createProduct(newProduct)
      const createdProduct = { id: productId, ...newProduct }
      setProducts([...products, createdProduct])
      setEditingProduct(createdProduct)
    } catch (error) {
      setError("创建商品失败: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProduct = async (productId, productData) => {
    setLoading(true)
    try {
      // 检查产品是否存在
      const existingProduct = products.find(p => p.id === productId)
      if (!existingProduct) {
        throw new Error(`商品不存在: ${productId}`)
      }
      
      await updateProduct(productId, productData)
      setProducts(products.map(p => p.id === productId ? { ...p, ...productData } : p))
      setEditingProduct(null)
      
      await clearCache()
    } catch (error) {
      console.error('❌ 更新商品失败:', error)
      setError(`更新商品失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (confirm("确定要删除这个商品吗？")) {
      setLoading(true)
      try {
        await deleteProduct(productId)
        setProducts(products.filter(p => p.id !== productId))
        await clearCache()
      } catch (error) {
        setError("删除商品失败: " + error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  // CD管理
  const handleCreateCD = async () => {
    const newCD = {
      title: "新CD",
      image: "/cd/cd-placeholder-1.png",  // 使用存在的CD占位符图片
      productLink: "/products/new",
      order: cds.length + 1,
      visible: true
    }
    
    setLoading(true)
    try {
      const cdId = await createCD(newCD)
      const createdCD = { id: cdId, ...newCD }
      setCds([...cds, createdCD])
      setEditingCD(createdCD)
    } catch (error) {
      setError("创建CD失败: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCD = async (cdId, cdData) => {
    setLoading(true)
    try {
      await updateCD(cdId, cdData)
      setCds(cds.map(c => c.id === cdId ? { ...c, ...cdData } : c))
      setEditingCD(null)
      await clearCache()
    } catch (error) {
      setError("更新CD失败: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCD = async (cdId) => {
    if (confirm("确定要删除这个CD吗？")) {
      setLoading(true)
      try {
        await deleteCD(cdId)
        setCds(cds.filter(c => c.id !== cdId))
        await clearCache()
      } catch (error) {
        setError("删除CD失败: " + error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  // 产品页面管理
  const handleUpdateProductPage = async (pageId, pageData) => {
    setLoading(true)
    try {
      console.log('🔄 正在更新产品页面:', { pageId, pageData })
      
      // 保存到Firebase
      await updateProductPage(pageId, pageData)
      
      // 清除缓存确保数据同步
      clearCache()
      
      // 更新本地状态
      setProductPages(productPages.map(p => p.id === pageId ? { ...p, ...pageData } : p))
      setEditingProductPage(null)
      
      console.log('✅ 产品页面更新成功')
    } catch (error) {
      console.error('❌ 更新产品页面失败:', error)
      setError(`更新产品页面失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 创建新产品页面
  const handleCreateProductPage = async () => {
    const newPageId = prompt('请输入新页面的ID (例如: new-album-2024):')
    if (!newPageId) return
    
    // 检查ID是否已存在
    if (productPages.find(p => p.id === newPageId)) {
      alert('页面ID已存在，请使用不同的ID')
      return
    }
    
    const newPage = {
      id: newPageId,
      title: '新专辑',
      description: '专辑描述...',
      image: '/cd/album-art.png',
      price: '€20.00',
      trackList: [
        'A1 · 曲目一',
        'A2 · 曲目二'
      ],
      details: {
        catalog: 'NEW001',
        album: '新专辑',
        releaseType: 'Album',
        releaseDate: new Date().toLocaleDateString('zh-CN'),
        label: 'XANG DIGITAL'
      }
    }
    
    setLoading(true)
    try {
      // 保存到Firebase
      await updateProductPage(newPageId, newPage)
      
      // 更新本地状态
      setProductPages([...productPages, newPage])
      
      // 立即编辑新页面
      setEditingProductPage(newPage)
      
      console.log('✅ 新产品页面创建成功:', newPageId)
    } catch (error) {
      console.error('❌ 创建产品页面失败:', error)
      setError(`创建页面失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 图片上传
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    try {
      const result = await uploadImage(file, 'products')
      setImages([...images, result])
      alert(`图片上传成功！\n地址: ${result.url}`)
      await loadData() // 重新加载数据
    } catch (error) {
      setError("图片上传失败: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 修复图片路径
  const handleFixImagePaths = async () => {
    try {
      setLoading(true)
      
      const result = await fixImagePaths()
      alert(`修复完成！共修复了 ${result.fixed} 个文档`)
      
      // 重新加载数据
      await Promise.all([loadProducts(), loadCDs(), loadProductPages()])
    } catch (error) {
      console.error("修复图片路径时出错:", error)
      alert("修复失败: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 清理无效数据
  const handleCleanupData = async () => {
    if (!confirm('确定要清理无效的placeholder数据吗？这个操作不可撤销。')) {
      return
    }
    
    try {
      setLoading(true)
      
      // 需要导入handleCleanupData函数
      const { handleCleanupData: cleanupData } = await import("../../lib/firebaseService")
      await cleanupData()
      alert('无效数据清理完成！')
      
      // 重新加载数据
      await Promise.all([loadProducts(), loadCDs(), loadProductPages()])
    } catch (error) {
      console.error("清理数据时出错:", error)
      alert("清理失败: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Tab切换处理
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    // 切换标签时立即加载相应数据
    loadData(tab)
  }

  useEffect(() => {
    if (isAuthenticated) {
      // 首次登录时加载产品数据
      loadData(activeTab)
    }
  }, [isAuthenticated])

  // 组件加载时初始化图片列表
  useEffect(() => {
    loadPublicImages()
  }, [])

  if (!isAuthenticated) {
  return (
      <div style={authContainerStyle}>
        <div style={authFormStyle}>
          <h1 style={titleStyle}>管理员登录</h1>
          <form onSubmit={handleAuth} style={formStyle}>
            <input
              type="password"
              placeholder="请输入管理员密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              autoFocus
            />
            <button type="submit" style={buttonStyle}>
              登录
            </button>
            {error && <div style={errorStyle}>{error}</div>}
          </form>
          <button 
            onClick={() => router.push('/')} 
            style={backButtonStyle}
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>商品管理系统</h1>
        <div style={headerActionsStyle}>
          <button onClick={handleCleanupData} style={{
            ...backButtonStyle,
            backgroundColor: '#f44336',
            marginRight: '10px'
          }}>
            🗑️ 清理数据
          </button>
          <button onClick={handleFixImagePaths} style={{
            ...backButtonStyle,
            backgroundColor: '#ff9800',
            marginRight: '10px'
          }}>
            🔧 修复图片路径
          </button>
          <button onClick={() => router.push('/')} style={backButtonStyle}>
            返回首页
          </button>
          <button onClick={() => setIsAuthenticated(false)} style={logoutButtonStyle}>
            退出登录
          </button>
          </div>
      </div>

      {error && <div style={errorBannerStyle}>{error}</div>}
      {loading && <div style={loadingBannerStyle}>处理中...</div>}

      {/* 标签栏 */}
      <div style={tabsStyle}>
        <button 
          onClick={() => {
            setActiveTab("products")
            loadData("products")
          }}
          style={activeTab === "products" ? activeTabStyle : tabStyle}
        >
          商品管理 ({products.length})
            </button>
        <button 
          onClick={() => {
            setActiveTab("cds")
            loadData("cds")
          }}
          style={activeTab === "cds" ? activeTabStyle : tabStyle}
        >
          CD轮播管理 ({cds.length})
        </button>
        <button 
          onClick={() => {
            setActiveTab("images")
            loadData("images")
          }}
          style={activeTab === "images" ? activeTabStyle : tabStyle}
        >
          图片管理 ({images.length + publicImages.length})
        </button>
        <button 
          onClick={() => {
            setActiveTab("product-pages")
            loadData("product-pages")
          }}
          style={activeTab === "product-pages" ? activeTabStyle : tabStyle}
        >
          产品页面管理 ({productPages.length})
            </button>
          </div>



      {activeTab === "products" && (
        <ProductManagement
          products={products}
          publicImages={publicImages}
          onCreate={handleCreateProduct}
          onUpdate={handleUpdateProduct}
          onDelete={handleDeleteProduct}
        />
      )}

      {activeTab === "cds" && (
        <CDManagement
          cds={cds}
          publicImages={publicImages}
          onCreate={handleCreateCD}
          onUpdate={handleUpdateCD}
          onDelete={handleDeleteCD}
        />
      )}

      {activeTab === "images" && (
        <ImageManagement
          images={images}
          publicImages={publicImages}
          onUpload={handleImageUpload}
        />
      )}

      {activeTab === "product-pages" && (
        <ProductPageManagement
          pages={productPages}
          publicImages={publicImages}
          onCreate={handleCreateProductPage}
          onUpdate={handleUpdateProductPage}
        />
      )}

