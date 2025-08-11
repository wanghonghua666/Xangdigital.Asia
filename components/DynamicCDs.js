"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAllCDs } from "../lib/firebaseService"
import styles from "../app/Home.module.css"

export default function DynamicCDs({ isMobile, mobileCdItemStyle, desktopCdItemStyle, mobileCdImageStyle, desktopCdImageStyle, onLoad }) {
  const [cdData, setCdData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  
  // 立即显示默认数据，避免空白
  useEffect(() => {
    if (cdData.length === 0) {
      setCdData(defaultCDs)
      setIsUsingFallback(true)
      if (onLoad) onLoad(true)
    }
  }, [])

  // 默认CD数据作为fallback - 确保路径正确
  const defaultCDs = [
    { id: 'cd1', title: 'I Love It When She Ride On Me', image: '/cd/album-art.png', productLink: '/products/iloveitwhensherideonme', visible: true },
    { id: 'cd2', title: 'Oshamambe', image: '/cd/album-cover.png', productLink: '/products/oshamambe', visible: true },
    { id: 'cd3', title: 'Album 3', image: '/cd/cd-empty-1.png', productLink: '/products/cd3', visible: true },
    { id: 'cd4', title: 'Digital Dreams EP', image: '/cd/cd-placeholder-2.png', productLink: '/products/cd4', visible: true },
    { id: 'cd5', title: 'Deluxe Edition', image: '/cd/cd-placeholder-1.png', productLink: '/products/cd5', visible: true }
  ]

  // 修复图片路径函数
  const fixImagePath = (imagePath) => {
    if (!imagePath) return '/placeholder.svg'
    
    // 确保路径以/开头
    if (!imagePath.startsWith('/')) {
      imagePath = '/' + imagePath
    }
    
    // 如果路径不以/cd/开头但是引用了已知CD图片，则修复路径
    if (!imagePath.startsWith('/cd/')) {
      const fileName = imagePath.split('/').pop()
      const knownImages = ['album-art.png', 'album-cover.png', 'cd-empty-1.png', 'cd-placeholder-1.png', 'cd-placeholder-2.png', 'cd-placeholder-3.png', 'Nia.jpg']
      
      if (knownImages.includes(fileName)) {
        return `/cd/${fileName}`
      }
    }
    
    return imagePath
  }

  useEffect(() => {
    let mounted = true
    
    const loadCDs = async () => {
      try {
        console.log(`🔄 [DynamicCDs] 开始加载CD数据...`)
        
        // 减少超时时间到1秒，提高响应速度
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 1000)
        })
        
        const cdsPromise = getAllCDs()
        const cds = await Promise.race([cdsPromise, timeoutPromise])
        
        if (!mounted) return
        
        if (cds && cds.length > 0) {
          console.log(`✅ [DynamicCDs] Firebase CD数据加载成功，共 ${cds.length} 个CD`)
          // 修复可能的路径问题并过滤显示的CD
          const processedCDs = cds
            .filter(cd => cd.visible !== false)
            .map(cd => ({
              ...cd,
              image: fixImagePath(cd.image)
            }))
          
          setCdData(processedCDs)
          setIsUsingFallback(false)
          
          // 通知父组件数据加载成功
          if (onLoad) {
            onLoad(true)
          }
        } else {
          console.log(`🔄 [DynamicCDs] Firebase无数据，使用默认CD数据`)
          setCdData(defaultCDs)
          setIsUsingFallback(true)
          
          // 通知父组件数据加载完成（使用fallback）
          if (onLoad) {
            onLoad(true)
          }
        }
      } catch (error) {
        if (!mounted) return
        
        console.warn(`⚠️ [DynamicCDs] CD加载失败，使用默认数据:`, error.message)
        setCdData(defaultCDs)
        setIsUsingFallback(true)
        
        // 通知父组件数据加载完成（使用fallback）
        if (onLoad) {
          onLoad(true)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
          console.log(`✅ [DynamicCDs] CD数据加载完成`)
        }
      }
    }

    // 立即开始加载
    loadCDs()
    
    return () => {
      mounted = false
    }
  }, [onLoad])

  if (isLoading) {
    return (
      <div style={{ 
        color: 'white', 
        fontSize: '0.9rem', 
        opacity: 0.7,
        textAlign: 'center',
        padding: '2rem',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        加载中...
      </div>
    )
  }

  if (!cdData || cdData.length === 0) {
    // 通知父组件数据加载完成（使用紧急fallback）
    if (onLoad) {
      onLoad(true)
    }
    
    return (
      <>
        {defaultCDs.map((cd, index) => (
          <div key={cd.id || index} className={`cd-item ${styles.cdItem}`} style={isMobile ? mobileCdItemStyle : desktopCdItemStyle}>
            <Link href={cd.productLink || '#'}>
              <img
                src={cd.image}
                alt={cd.title || `Album ${index + 1}`}
                style={isMobile ? mobileCdImageStyle : desktopCdImageStyle}
                className={`cd-image ${styles.cdImage}`}
                onError={(e) => {
                  e.target.src = '/placeholder.svg'
                }}
              />
            </Link>
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      {/* 开发模式提示 */}
      {process.env.NODE_ENV === 'development' && isUsingFallback && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 165, 0, 0.9)',
          color: 'black',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          ⚠️ 使用fallback数据
        </div>
      )}
      
              {cdData.map((cd, index) => (
          <div key={cd.id || index} className={`cd-item ${styles.cdItem}`} style={isMobile ? mobileCdItemStyle : desktopCdItemStyle}>
            <Link 
              href={`${cd.productLink || '#'}?from=${encodeURIComponent('/')}`}
              onClick={() => {
                // 存储来源信息到sessionStorage
                sessionStorage.setItem('productPageFrom', '/')
              }}
            >
              <img
                src={fixImagePath(cd.image)}
                alt={cd.title || `Album ${index + 1}`}
                style={isMobile ? mobileCdImageStyle : desktopCdImageStyle}
                className={`cd-image ${styles.cdImage}`}
                onError={(e) => {
                  console.warn('🖼️ 图片加载失败:', e.target.src)
                  // 尝试修复路径
                  const fixedSrc = fixImagePath(e.target.src)
                  if (fixedSrc !== e.target.src) {
                    e.target.src = fixedSrc
                  } else {
                    // 如果还是失败，尝试其他可能的路径
                    const fileName = e.target.src.split('/').pop()
                    if (fileName) {
                      const alternativePaths = [
                        `/cd/${fileName}`,
                        `/product/${fileName}`,
                        `/products/${fileName}`,
                        `/${fileName}`
                      ]
                      
                      // 尝试下一个路径
                      const currentIndex = alternativePaths.indexOf(e.target.src)
                      const nextPath = alternativePaths[currentIndex + 1] || '/placeholder.svg'
                      e.target.src = nextPath
                    } else {
                      e.target.src = '/placeholder.svg'
                    }
                  }
                }}
              />
            </Link>
          </div>
        ))}
    </>
  )
} 