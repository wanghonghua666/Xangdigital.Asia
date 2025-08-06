"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  getAllCDs, 
  createCD,
  updateCD,
  deleteCD,
  getAllProductPages,
  updateProductPage,
  initializeCDs,
  initializeProductPages,
  clearCache
} from "../../lib/firebaseService"
import UnifiedDataManager from "../../components/UnifiedDataManager"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // 数据状态
  const [cds, setCds] = useState([])
  const [productPages, setProductPages] = useState([])
  const [activeTab, setActiveTab] = useState("cds")
  
  const router = useRouter()

  // 字段配置
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
    { name: 'visible', label: '可见性', type: 'checkbox' },
    { name: 'order', label: '排序', type: 'number' },
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

  // 动态获取public文件夹中的图片
  const getPublicImages = () => {
    console.log(`🖼️ [ADMIN] 获取公共图片列表...`)
    const images = [
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
      '/header-image2.jpg',
      '/header-image3.jpg'
    ]
    console.log(`✅ [ADMIN] 公共图片列表获取完成，共 ${images.length} 张图片`)
    return images
  }

  // 默认数据
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
    visible: true, // 添加可见性字段
    order: 1, // 添加排序字段
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

  // 认证处理
  const handleAuth = async (e) => {
    e.preventDefault()
    console.log(`🔐 [ADMIN] 开始认证...`)
    if (password === "88888888") {
      console.log(`✅ [ADMIN] 认证成功`)
      setIsAuthenticated(true)
      setError("")
    } else {
      console.log(`❌ [ADMIN] 密码错误`)
      setError("密码错误")
    }
  }

  // 按需加载数据
  const loadData = async (tab = "cds") => {
    console.log(`🔄 [ADMIN] 开始加载 ${tab} 数据...`)
    setLoading(true)
    try {
      if (tab === "cds" && cds.length === 0) {
        console.log(`📀 [ADMIN] 开始加载CD数据...`)
        const cdsData = await getAllCDs().catch(err => {
          console.error(`❌ [ADMIN] 加载CD数据失败:`, err)
          return []
        })
        console.log(`✅ [ADMIN] CD数据加载成功，共 ${cdsData.length} 个CD`)
        setCds(cdsData)
      } else if (tab === "cds") {
        console.log(`📀 [ADMIN] 使用缓存的CD数据，共 ${cds.length} 个CD`)
      }
      
      if (tab === "product-pages") {        
        if (productPages.length === 0) {
          console.log(`📄 [ADMIN] 开始加载产品页面数据...`)
          try {
            let pagesData = await getAllProductPages()
            console.log(`📄 [ADMIN] 从Firebase获取到 ${pagesData.length} 个产品页面`)
            
            if (pagesData.length === 0) {
              console.log(`🆕 [ADMIN] 没有产品页面数据，开始初始化...`)
              pagesData = await initializeProductPages()
              console.log(`🆕 [ADMIN] 初始化完成，创建了 ${pagesData.length} 个产品页面`)
            }
            
            setProductPages(pagesData)
            console.log(`✅ [ADMIN] 产品页面数据已设置，共 ${pagesData.length} 个`)
          } catch (error) {
            console.error(`❌ [ADMIN] 加载产品页面失败:`, error)
            setError(`加载产品页面失败: ${error.message}`)
            setProductPages([])
          }
        } else {
          console.log(`📄 [ADMIN] 使用缓存的产品页面数据，共 ${productPages.length} 个`)
        }
      }
    } catch (error) {
      console.error(`❌ [ADMIN] 加载数据失败:`, error)
      setError(`加载数据失败: ${error.message}`)
    } finally {
      setLoading(false)
      console.log(`✅ [ADMIN] ${tab} 数据加载完成`)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      console.log(`🔄 [ADMIN] 认证成功，开始初始化数据...`)
      loadData(activeTab)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div style={authContainerStyle}>
        <div style={authFormStyle}>
          <h1 style={titleStyle}>XANGDIGITAL.ASIA</h1>
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
        <h1 style={titleStyle}>XANGDIGITAL.ASIA</h1>
        <div style={headerActionsStyle}>
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
            console.log(`🔄 [ADMIN] 切换到CD轮播管理`)
            setActiveTab("cds")
            loadData("cds")
          }}
          style={activeTab === "cds" ? activeTabStyle : tabStyle}
        >
          CD轮播管理 ({cds.length})
        </button>
        <button 
          onClick={() => {
            console.log(`🔄 [ADMIN] 切换到产品页面管理`)
            setActiveTab("product-pages")
            loadData("product-pages")
          }}
          style={activeTab === "product-pages" ? activeTabStyle : tabStyle}
        >
          产品页面管理 ({productPages.length})
        </button>
      </div>

      {/* CD管理 */}
      {activeTab === "cds" && (
        <UnifiedDataManager
          type="cds"
          title="CD"
          fields={cdFields}
          defaultData={defaultCD}
          availableImages={getPublicImages()}
          onDataChange={() => {
            clearCache()
            loadData("cds")
          }}
        />
      )}

      {/* 产品页面管理 */}
      {activeTab === "product-pages" && (
        <UnifiedDataManager
          type="product-pages"
          title="产品页面"
          fields={productPageFields}
          defaultData={defaultProductPage}
          availableImages={getPublicImages()}
          onDataChange={() => {
            clearCache()
            loadData("product-pages")
          }}
        />
      )}
    </div>
  )
}

// 样式定义 - 统一使用JetBrains Mono字体
const authContainerStyle = {
  minHeight: '100vh',
  background: 'url("/header-image3.jpg") no-repeat center top',
  backgroundSize: '100% 100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '"JetBrains Mono", monospace'
}

const authFormStyle = {
  background: 'rgba(0, 0, 0, 0.8)',
  padding: '2rem',
  borderRadius: '8px',
  border: '1px solid #333',
  textAlign: 'center',
  minWidth: '300px'
}

const containerStyle = {
  minHeight: '100vh',
  background: 'url("/header-image3.jpg") no-repeat center top',
  backgroundSize: '100% 100%',
  fontFamily: '"JetBrains Mono", monospace',
  color: 'white'
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  borderBottom: '1px solid #333',
  background: 'rgba(0, 0, 0, 0.8)'
}

const titleStyle = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '1rem',
  color: 'red',
  fontWeight: 'bolder',
  letterSpacing: '19px',
  margin: '1px',
  transform: 'scaleY(1.5)',
  textAlign: 'left'
}

const headerActionsStyle = {
  display: 'flex',
  gap: '1rem'
}

const tabsStyle = {
  display: 'flex',
  gap: '0',
  background: 'rgba(0, 0, 0, 0.8)',
  borderBottom: '1px solid #333'
}

const tabStyle = {
  padding: '1.5rem 3rem',
  background: 'transparent',
  color: 'red',
  border: 'none',
  cursor: 'pointer',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '1rem',
  fontWeight: 'lighter',
  letterSpacing: '1.4px',
  transform: 'scaleY(0.8)',
  transition: 'all 0.3s ease',
  position: 'relative'
}

const activeTabStyle = {
  ...tabStyle,
  color: 'white',
  background: 'rgba(255, 0, 0, 0.3)',
  transform: 'scaleY(0.8) scaleX(1.05)'
}

const buttonStyle = {
  padding: '0.5rem 1rem',
  background: 'red',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '0.9rem',
  letterSpacing: '1px'
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
  gap: '1rem',
  marginBottom: '1rem'
}

const inputStyle = {
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #333',
  background: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  fontFamily: '"JetBrains Mono", monospace'
}

const errorStyle = {
  color: 'red',
  fontSize: '0.9rem',
  marginTop: '0.5rem',
  fontFamily: '"JetBrains Mono", monospace'
}

const errorBannerStyle = {
  background: '#dc3545',
  color: 'white',
  padding: '0.5rem',
  borderRadius: '4px',
  margin: '1rem 2rem',
  fontFamily: '"JetBrains Mono", monospace'
}

const loadingBannerStyle = {
  background: '#ffc107',
  color: 'black',
  padding: '0.5rem',
  borderRadius: '4px',
  margin: '1rem 2rem',
  textAlign: 'center',
  fontFamily: '"JetBrains Mono", monospace'
}



 