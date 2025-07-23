"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import UnifiedDataManager from "../../components/UnifiedDataManager"

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
  const [systemLogs, setSystemLogs] = useState([])
  const [activeTab, setActiveTab] = useState("products")
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCD, setEditingCD] = useState(null)
  const [editingProductPage, setEditingProductPage] = useState(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  // 检查URL参数，支持实时编辑
  useEffect(() => {
    const editType = searchParams.get('edit')
    const editSlug = searchParams.get('slug')
    
    if (editType && editSlug) {
      // 自动切换到对应的标签页
      setActiveTab(editType)
      
      // 如果是产品页面编辑，加载对应数据
      if (editType === 'product-pages') {
        loadData(editType).then(() => {
          // 查找对应的产品页面
          const targetPage = productPages.find(page => page.firestoreId === editSlug || page.id === editSlug)
          if (targetPage) {
            setEditingProductPage(targetPage)
          }
        })
      }
    }
  }, [searchParams])

  // 字段配置
  const productFields = [
    { name: 'title', label: '商品名称', type: 'text', required: true },
    { name: 'description', label: '简短描述', type: 'textarea' },
    { name: 'detailedDescription', label: '详细介绍', type: 'textarea' },
    { name: 'productInfo', label: '产品信息', type: 'textarea' },
    { name: 'image', label: '商品图片', type: 'image' },
    { name: 'price', label: '价格', type: 'number', required: true },
    { name: 'category', label: '分类', type: 'select', options: [
      { value: 'music', label: '音乐' },
      { value: 'merchandise', label: '周边' },
      { value: 'digital', label: '数字产品' }
    ]},
    { name: 'visible', label: '在商店中显示', type: 'checkbox' },
    { name: 'order', label: '排序', type: 'number' },
    // Shopify集成字段
    { name: 'shopifyProductId', label: 'Shopify产品ID', type: 'text', placeholder: 'gid://shopify/Product/123456789' },
    { name: 'shopifyVariantId', label: 'Shopify变体ID', type: 'text', placeholder: 'gid://shopify/ProductVariant/987654321' },
    { name: 'shopifyHandle', label: 'Shopify Handle', type: 'text', placeholder: 'product-handle' },
    { name: 'shopifyAvailable', label: 'Shopify库存状态', type: 'checkbox' },
    { name: 'shopifyPrice', label: 'Shopify价格', type: 'text', placeholder: '€15.99' },
    { name: 'shopifyCurrency', label: '货币', type: 'select', options: [
      { value: 'EUR', label: '欧元 (€)' },
      { value: 'USD', label: '美元 ($)' },
      { value: 'CNY', label: '人民币 (¥)' }
    ]}
  ]

  const cdFields = [
    { name: 'title', label: 'CD标题', type: 'text', required: true },
    { name: 'image', label: 'CD图片', type: 'image' },
    { name: 'productLink', label: '产品链接', type: 'text' },
    { name: 'visible', label: '在轮播中显示', type: 'checkbox' },
    { name: 'order', label: '排序', type: 'number' }
  ]

  const productPageFields = [
    { name: 'title', label: '产品标题', type: 'text', required: true },
    { name: 'description', label: '产品描述', type: 'textarea' },
    { name: 'image', label: '产品图片', type: 'image' },
    { name: 'price', label: '价格', type: 'text' },
    { name: 'trackList', label: '曲目列表', type: 'textarea', placeholder: '每行一个曲目，如：A1 · HAPPY BOY' },
    { name: 'details.catalog', label: '目录号', type: 'text' },
    { name: 'details.album', label: '专辑名称', type: 'text' },
    { name: 'details.releaseType', label: '发布类型', type: 'text' },
    { name: 'details.releaseDate', label: '发布日期', type: 'text' },
    { name: 'details.label', label: '厂牌', type: 'text' },
    { name: 'details.ar', label: 'A&R', type: 'text' },
    { name: 'details.writer', label: '作词', type: 'text' },
    { name: 'details.producer', label: '制作人', type: 'text' },
    { name: 'details.mixing', label: '混音', type: 'text' },
    { name: 'details.master', label: '母带', type: 'text' },
    { name: 'details.creativeDirector', label: '创意总监', type: 'text' },
    { name: 'details.artDirector', label: '艺术总监', type: 'text' }
  ]

  // 默认数据
  const defaultProduct = {
    title: "新商品",
    description: "商品描述",
    image: "/placeholder.svg",
    price: 0,
    category: "music",
    visible: false,
    order: 1,
    // Shopify集成默认值
    shopifyProductId: "",
    shopifyVariantId: "",
    shopifyHandle: "",
    shopifyAvailable: false,
    shopifyPrice: "€0.00",
    shopifyCurrency: "EUR"
  }

  const defaultCD = {
    title: "新CD",
    image: "/cd/cd-placeholder-1.png",
    productLink: "/products/new",
    visible: true,
    order: 1
  }

  const defaultProductPage = {
    title: "新专辑",
    description: "专辑描述...",
    image: "/cd/album-art.png",
    price: "€20.00",
    trackList: "A1 · 曲目一\nA2 · 曲目二",
    details: {
      catalog: "NEW001",
      album: "新专辑",
      releaseType: "Album",
      releaseDate: new Date().toLocaleDateString('zh-CN'),
      label: "XANG DIGITAL",
      ar: "",
      writer: "",
      producer: "",
      mixing: "",
      master: "",
      creativeDirector: "",
      artDirector: ""
    }
  }

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
            pagesData = await initializeProductPages()
          }
          
          setProductPages(pagesData)
        } catch (error) {
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
      
      if (tab === "logs") {
        // 加载系统日志
        try {
          const logs = JSON.parse(localStorage.getItem('admin_logs') || '[]')
          setSystemLogs(logs.reverse()) // 最新的日志在前面
          console.log(`📋 加载了 ${logs.length} 条系统日志`)
        } catch (error) {
          console.error('❌ 加载系统日志失败:', error)
          setSystemLogs([])
        }
      }
      

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
        <button 
          onClick={() => {
            setActiveTab("logs")
            loadData("logs")
          }}
          style={activeTab === "logs" ? activeTabStyle : tabStyle}
        >
          系统日志 ({systemLogs.length})
        </button>
          </div>

      {/* 商品管理 */}
      {activeTab === "products" && (
        <UnifiedDataManager
          type="products"
          title="商品"
          fields={productFields}
          defaultData={defaultProduct}
          availableImages={publicImages}
          onDataChange={() => {
            clearCache()
            loadData("products")
          }}
        />
      )}

      {/* CD管理 */}
      {activeTab === "cds" && (
        <UnifiedDataManager
          type="cds"
          title="CD"
          fields={cdFields}
          defaultData={defaultCD}
          availableImages={publicImages}
          onDataChange={() => {
            clearCache()
            loadData("cds")
          }}
        />
      )}

      {/* 图片管理 */}
      {activeTab === "images" && (
        <div style={contentStyle}>
          <div style={sectionHeaderStyle}>
            <h2>图片管理</h2>
            <label style={uploadButtonStyle}>
              上传图片
              <input
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <h3>Firebase存储的图片</h3>
          <div style={imageGridStyle}>
            {images.map(image => (
              <div key={image.id} style={imageCardStyle}>
                <img src={image.url} alt={image.name} style={imageStyle} />
                <p>{image.name}</p>
                <button 
                  onClick={() => navigator.clipboard.writeText(image.url)}
                  style={copyButtonStyle}
                >
                  复制链接
                </button>
              </div>
            ))}
          </div>

          <h3>Public文件夹中的图片</h3>
          <div style={imageGridStyle}>
            {publicImages.map(imagePath => (
              <div key={imagePath} style={imageCardStyle}>
                <img src={imagePath} alt={imagePath} style={imageStyle} />
                <p>{imagePath}</p>
                <button 
                  onClick={() => navigator.clipboard.writeText(imagePath)}
                  style={copyButtonStyle}
                >
                  复制路径
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 产品页面管理 */}
      {activeTab === "product-pages" && (
        <UnifiedDataManager
          type="product-pages"
          title="产品页面"
          fields={productPageFields}
          defaultData={defaultProductPage}
          availableImages={publicImages}
          onDataChange={() => {
            clearCache()
            loadData("product-pages")
          }}
        />
      )}

      {/* 系统日志 */}
      {activeTab === "logs" && (
        <div style={contentStyle}>
          <div style={sectionHeaderStyle}>
            <h2>系统日志</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => {
                  localStorage.removeItem('admin_logs')
                  setSystemLogs([])
                  alert('日志已清空')
                }}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#dc3545',
                  fontSize: '0.8rem'
                }}
              >
                清空日志
              </button>
              <button 
                onClick={() => {
                  const logs = JSON.parse(localStorage.getItem('admin_logs') || '[]')
                  const logText = logs.map(log => 
                    `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
                  ).join('\n')
                  
                  navigator.clipboard.writeText(logText)
                  alert('日志已复制到剪贴板')
                }}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#17a2b8',
                  fontSize: '0.8rem'
                }}
              >
                复制日志
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              显示最近的系统运行日志，包括CD播放器动画初始化状态
            </p>
          </div>
          
          <div style={logContainerStyle}>
            {systemLogs.length === 0 ? (
              <div style={noLogsStyle}>
                <p>暂无系统日志</p>
                <p style={{ fontSize: '12px', color: '#999' }}>
                  访问首页后会自动生成日志记录
                </p>
              </div>
            ) : (
              systemLogs.map((log, index) => (
                <div key={index} style={{
                  ...logItemStyle,
                  borderLeftColor: log.type === 'error' ? '#dc3545' : 
                                   log.type === 'warning' ? '#ffc107' : '#28a745'
                }}>
                  <div style={logHeaderStyle}>
                    <span style={logTimestampStyle}>
                      {new Date(log.timestamp).toLocaleString('zh-CN')}
                    </span>
                    <span style={{
                      ...logTypeStyle,
                      backgroundColor: log.type === 'error' ? '#dc3545' : 
                                      log.type === 'warning' ? '#ffc107' : '#28a745',
                      color: log.type === 'warning' ? '#000' : '#fff'
                    }}>
                      {log.type.toUpperCase()}
                    </span>
                  </div>
                  <div style={logMessageStyle}>
                    {log.message}
                  </div>
                  {log.url && (
                    <div style={logMetaStyle}>
                      <small>URL: {log.url}</small>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}


    </div>
  )
}



// 样式定义
const authContainerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'monospace'
}

const authFormStyle = {
  background: 'rgba(0, 0, 0, 0.8)',
  padding: '2rem',
  borderRadius: '8px',
  minWidth: '300px',
  textAlign: 'center'
}

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  color: 'white',
  fontFamily: 'monospace',
  padding: '1rem'
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  padding: '1rem',
  background: 'rgba(0, 0, 0, 0.3)',
  borderRadius: '8px'
}

const headerActionsStyle = {
  display: 'flex',
  gap: '1rem'
}

const titleStyle = {
  color: 'red',
  fontSize: '1.5rem',
  margin: 0
}

const tabsStyle = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem',
  borderBottom: '1px solid #333'
}

const tabStyle = {
  padding: '0.5rem 1rem',
  background: 'transparent',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: 'none',
  color: '#888',
  cursor: 'pointer',
  fontSize: '1rem',
  fontFamily: 'monospace'
}

const activeTabStyle = {
  ...tabStyle,
  color: 'red',
  borderBottom: '2px solid red'
}

const contentStyle = {
  padding: '1rem'
}

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem'
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: '1rem'
}

const imageGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '1rem',
  marginBottom: '2rem'
}

const cardStyle = {
  background: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #333'
}

const imageCardStyle = {
  background: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '8px',
  padding: '1rem',
  textAlign: 'center',
  border: '1px solid #333'
}

const cardImageStyle = {
  width: '100%',
  height: '150px',
  objectFit: 'cover'
}

const imageStyle = {
  width: '100%',
  height: '120px',
  objectFit: 'cover',
  borderRadius: '4px'
}

const cardContentStyle = {
  padding: '1rem'
}

const cardActionsStyle = {
  display: 'flex',
  gap: '0.5rem',
  marginTop: '1rem'
}

const buttonStyle = {
  padding: '0.5rem 1rem',
  background: 'red',
  color: 'white',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'monospace'
}

const createButtonStyle = {
  ...buttonStyle,
  background: '#28a745'
}

const editButtonStyle = {
  ...buttonStyle,
  background: '#ffc107',
  color: 'black'
}

const deleteButtonStyle = {
  ...buttonStyle,
  background: '#dc3545'
}

const uploadButtonStyle = {
  ...buttonStyle,
  background: '#17a2b8',
  cursor: 'pointer'
}

const copyButtonStyle = {
  ...buttonStyle,
  background: '#6c757d',
  fontSize: '0.8rem',
  marginTop: '0.5rem'
}

const backButtonStyle = {
  ...buttonStyle,
  background: '#6c757d'
}

const logoutButtonStyle = {
  ...buttonStyle,
  background: '#dc3545'
}

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
}

const inputStyle = {
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #333',
  background: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  fontFamily: 'monospace'
}

const errorStyle = {
  color: 'red',
  fontSize: '0.9rem',
  marginTop: '0.5rem'
}

const errorBannerStyle = {
  background: '#dc3545',
  color: 'white',
  padding: '0.5rem',
  borderRadius: '4px',
  marginBottom: '1rem'
}

const loadingBannerStyle = {
  background: '#ffc107',
  color: 'black',
  padding: '0.5rem',
  borderRadius: '4px',
  marginBottom: '1rem',
  textAlign: 'center'
}

// 模态框样式
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
}

const modalStyle = {
  background: '#2d2d2d',
  padding: '2rem',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '500px',
  maxHeight: '80vh',
  overflow: 'auto'
}

const formGroupStyle = {
  marginBottom: '1rem'
}

const modalInputStyle = {
  ...inputStyle,
  width: '100%',
  marginTop: '0.5rem'
}

const modalTextareaStyle = {
  ...modalInputStyle,
  resize: 'vertical'
}

const modalSelectStyle = {
  ...modalInputStyle
}

const previewImageStyle = {
  width: '100%',
  maxHeight: '150px',
  objectFit: 'cover',
  marginTop: '0.5rem',
  borderRadius: '4px'
}

const modalActionsStyle = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'flex-end',
  marginTop: '1rem'
}

const saveButtonStyle = {
  ...buttonStyle,
  background: '#28a745'
}

const cancelButtonStyle = {
  ...buttonStyle,
  background: '#6c757d'
}

// 日志相关样式
const logContainerStyle = {
  maxHeight: '600px',
  overflowY: 'auto',
  border: '1px solid #333',
  borderRadius: '4px',
  background: 'rgba(0, 0, 0, 0.3)'
}

const noLogsStyle = {
  padding: '2rem',
  textAlign: 'center',
  color: '#666'
}

const logItemStyle = {
  padding: '1rem',
  borderBottom: '1px solid #333',
  borderLeft: '4px solid #28a745',
  background: 'rgba(0, 0, 0, 0.2)',
  margin: '0'
}

const logHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem'
}

const logTimestampStyle = {
  fontSize: '0.8rem',
  color: '#999',
  fontFamily: 'monospace'
}

const logTypeStyle = {
  padding: '0.2rem 0.5rem',
  borderRadius: '3px',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  fontFamily: 'monospace'
}

const logMessageStyle = {
  fontSize: '0.9rem',
  color: '#fff',
  fontFamily: 'monospace',
  wordBreak: 'break-word'
}

const logMetaStyle = {
  marginTop: '0.5rem',
  fontSize: '0.8rem',
  color: '#666'
}

 