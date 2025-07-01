"use client"

import { useState, useEffect } from "react"
import { getProductPage } from "../lib/firebaseService"

export default function DynamicProductPage({ pageId, fallbackData, styles }) {
  const [pageData, setPageData] = useState(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPageData = async () => {
      try {
        console.log(`🔄 加载产品页面数据: ${pageId}`)
        
        const data = await getProductPage(pageId).catch(error => {
          console.warn(`⚠️ Firebase请求失败: ${error.message}`)
          return null
        })
        
        if (data && typeof data === 'object') {
          setPageData(data)
          console.log(`✅ 产品页面数据加载成功: ${data.title}`)
        } else {
          console.log(`⚠️ 未找到产品页面数据，使用fallback: ${pageId}`)
          setPageData(fallbackData)
        }
      } catch (error) {
        console.error(`❌ 产品页面数据加载失败: ${pageId}`, error)
        setPageData(fallbackData)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (pageId) {
      loadPageData()
    } else {
      setPageData(fallbackData)
      setLoading(false)
    }
  }, [pageId, fallbackData])

  if (loading) {
    return (
      <div className={styles.main}>
        <div className={styles.productContainer}>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            加载中...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    console.warn(`⚠️ 产品页面显示错误，使用fallback数据: ${error}`)
  }

  return (
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
  )
} 