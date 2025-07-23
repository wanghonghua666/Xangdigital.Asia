"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { getProductPage } from "../../../lib/firebaseService"
import styles from "./product.module.css"

export default function DynamicProductPage({ params }) {
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 使用React.use()解包params
  const resolvedParams = use(params)
  const slug = resolvedParams.slug

  useEffect(() => {
    const loadPageData = async () => {
      try {
        console.log(`📄 动态产品页面加载: ${slug}`)
        
        const data = await getProductPage(slug).catch(error => {
          console.warn(`⚠️ Firebase请求失败: ${error.message}`)
          return null
        })
        
        if (data && typeof data === 'object') {
          setPageData(data)
          console.log(`✅ 动态产品页面加载成功: ${data.title}`)
        } else {
          console.log(`⚠️ 未找到产品数据: ${slug}`)
          setError('产品不存在')
        }
      } catch (error) {
        console.error(`❌ 动态产品页面加载失败: ${slug}`, error)
        setError(error.message)
      } finally {
        setLoading(false)
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
          <Link href="/" className={styles.backButton}>
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
          <Link href="/" className={styles.backButton}>
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
        <Link href="/" className={styles.backButton}>
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
            
            {pageData.trackList && pageData.trackList.length > 0 && (
              <div className={styles.trackList}>
                <h3>TRACKLIST:</h3>
                {pageData.trackList.map((track, index) => (
                  <p key={index}>{track}</p>
                ))}
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
            
            {/* Shopify Buy Button 预留位置 */}
            <div className={styles.buyButtonContainer}>
              <button className={styles.buyButton}>
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 