"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getProductPage, addProductInterest } from "../../../lib/firebaseService"
import styles from "./product.module.css"

export default function DynamicProductPage({ params }) {
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [backUrl, setBackUrl] = useState("/")
  const [showNotify, setShowNotify] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState("")
  const [notifyMsg, setNotifyMsg] = useState("")
  
  // 使用React.use()解包params
  const resolvedParams = use(params)
  const slug = resolvedParams.slug
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleNotifySubmit = async () => {
    try {
      if (!notifyEmail || !notifyEmail.includes('@')) {
        setNotifyMsg('Enter Email 4 Notify')
        return
      }
      const res = await addProductInterest({ productId: slug, email: notifyEmail })
      setNotifyMsg(res?.duplicate ? 'You have already subscribed' : 'Thank You')
      setNotifyEmail('')
      console.log(`✅ [PRODUCT_PAGE] 收到订阅: ${slug} -> ${notifyEmail}`)
    } catch (e) {
      console.error('❌ [PRODUCT_PAGE] 提交订阅失败', e)
      setNotifyMsg('Submit Failed, Please Try Again')
    }
  }

  useEffect(() => {
    // 智能返回导航逻辑
    const determineBackUrl = () => {
      console.log(`🧭 [PRODUCT_PAGE] 开始确定返回URL，slug: ${slug}`)
      
      // 1. 检查URL参数中的来源
      const from = searchParams.get('from')
      if (from) {
        const decodedFrom = decodeURIComponent(from)
        console.log(`✅ [PRODUCT_PAGE] 从URL参数获取来源: ${decodedFrom}`)
        setBackUrl(decodedFrom)
        return
      }
      
      // 2. 检查sessionStorage中的来源
      const storedFrom = sessionStorage.getItem('productPageFrom')
      if (storedFrom) {
        console.log(`✅ [PRODUCT_PAGE] 从sessionStorage获取来源: ${storedFrom}`)
        setBackUrl(storedFrom)
        return
      }
      
      // 3. 检查referrer
      if (document.referrer) {
        const referrer = new URL(document.referrer)
        console.log(`🔍 [PRODUCT_PAGE] 检查referrer: ${referrer.pathname}`)
        if (referrer.pathname === '/shop') {
          console.log(`✅ [PRODUCT_PAGE] 从referrer确定来源: /shop`)
          setBackUrl('/shop')
          return
        }
        if (referrer.pathname === '/') {
          console.log(`✅ [PRODUCT_PAGE] 从referrer确定来源: /`)
          setBackUrl('/')
          return
        }
      }
      
      // 4. 默认返回首页
      console.log(`✅ [PRODUCT_PAGE] 使用默认返回URL: /`)
      setBackUrl('/')
    }
    
    determineBackUrl()
  }, [searchParams, slug])
  
  useEffect(() => {
    const loadPageData = async () => {
      console.log(`📄 [PRODUCT_PAGE] 开始加载产品页面数据，slug: ${slug}`)
      try {
        const data = await getProductPage(slug).catch(error => {
          console.warn(`⚠️ [PRODUCT_PAGE] Firebase请求失败: ${error.message}`)
          return null
        })
        
        if (data && typeof data === 'object') {
          console.log(`✅ [PRODUCT_PAGE] 产品页面数据加载成功:`, {
            title: data.title,
            price: data.price,
            hasTrackList: !!data.trackList,
            hasDetails: !!data.details
          })
          setPageData(data)
        } else {
          console.log(`❌ [PRODUCT_PAGE] 产品不存在: ${slug}`)
          setError('产品不存在')
        }
      } catch (error) {
        console.error(`❌ [PRODUCT_PAGE] 动态产品页面加载失败: ${slug}`, error)
        setError(error.message)
      } finally {
        setLoading(false)
        console.log(`✅ [PRODUCT_PAGE] 产品页面数据加载完成`)
      }
    }

    if (slug) {
      loadPageData()
    }
  }, [slug])

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.overlay}></div>
        <header className={styles.header}>
          <Link href={backUrl} className={styles.backButton}>
            ← BACK
          </Link>
          <h1 className={styles.siteTitle}>XANGDIGITAL.ASIA</h1>
        </header>
        <main className={styles.main}>
          <div className={styles.productContainer}>
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              加载中...
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !pageData) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.overlay}></div>
        <header className={styles.header}>
          <Link href={backUrl} className={styles.backButton}>
            ← BACK
          </Link>
          <h1 className={styles.siteTitle}>XANGDIGITAL.ASIA</h1>
        </header>
        <main className={styles.main}>
          <div className={styles.productContainer}>
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <h2>产品不存在</h2>
              <p>未找到产品: {slug}</p>
              <Link href="/shop" style={{ color: 'red', textDecoration: 'none' }}>
                返回商店
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.overlay}></div>
      
      <header className={styles.header}>
        <Link href={backUrl} className={styles.backButton}>
          ← BACK
        </Link>
        <h1 className={styles.siteTitle}>XANGDIGITAL.ASIA</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.productContainer}>
          <div className={styles.productImage}>
            <img src={pageData.image} alt={pageData.title} />
          </div>
          
          <div className={styles.productInfo}>
            <h1 className={styles.productTitle}>{pageData.title}</h1>
            <p className={styles.productDescription}>
              {pageData.description}
            </p>
            
            {pageData.trackList && (
              <div className={styles.trackList}>
                <h3>TRACKLIST:</h3>
                {(() => {
                  // 处理trackList可能是字符串或数组的情况
                  let tracks = pageData.trackList
                  if (typeof tracks === 'string') {
                    // 如果是字符串，按换行符分割
                    tracks = tracks.split('\n').filter(track => track.trim())
                  } else if (Array.isArray(tracks)) {
                    // 如果已经是数组，直接使用
                    tracks = tracks.filter(track => track && track.trim())
                  } else {
                    // 其他情况，设为空数组
                    tracks = []
                  }
                  
                  return tracks.map((track, index) => (
                    <p key={index}>{track}</p>
                  ))
                })()}
              </div>
            )}
            
            {pageData.details && (
              <div className={styles.productDetails}>
                {pageData.details.catalog && <p>{pageData.details.catalog}</p>}
                {pageData.details.album && <p>Album / Release: {pageData.details.album}</p>}
                {pageData.details.releaseType && <p>Release Type: {pageData.details.releaseType}</p>}
                {pageData.details.releaseDate && <p>Date of release: {pageData.details.releaseDate}</p>}
                {pageData.details.label && <p>Label: {pageData.details.label}</p>}
                {pageData.details.ar && <p>A&R: {pageData.details.ar}</p>}
                {pageData.details.writer && <p>Writer: {pageData.details.writer}</p>}
                {pageData.details.producer && <p>Producer: {pageData.details.producer}</p>}
                {pageData.details.mixing && <p>Mixing: {pageData.details.mixing}</p>}
                {pageData.details.master && <p>Master: {pageData.details.master}</p>}
                {pageData.details.creativeDirector && <p>Creative Director: {pageData.details.creativeDirector}</p>}
                {pageData.details.artDirector && <p>Art Director: {pageData.details.artDirector}</p>}
              </div>
            )}
            
            <div className={styles.priceSection}>
              <span className={styles.price}>{pageData.price}</span>
            </div>
            
            {/* 购买/订阅逻辑 */}
            <div className={styles.buyButtonContainer}>
              {pageData.comingSoon ? (
  <div>
    <button className={styles.buyButton} onClick={() => setShowNotify(true)}>
      SOON
    </button>
    {showNotify && (
      <div className={styles.notifyPanel}>
        <input
          className={styles.notifyInput}
          type="email"
          placeholder="Enter Email 4 Notify"
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
        />
        <button className={styles.buyButton} onClick={async () => {
          await handleNotifySubmit()
          // 1.5s后淡出并关闭
          setTimeout(() => {
            setShowNotify(false)
            setNotifyMsg("")
          }, 1500)
        }}>
          Submit
        </button>
        {notifyMsg && (
          <p className={styles.notifyMessage}>{notifyMsg}</p>
        )}
      </div>
    )}
  </div>
) : (
  <button className={styles.buyButton}>
    ADD TO CART
  </button>
)}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 