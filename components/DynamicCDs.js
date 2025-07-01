"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAllCDs } from "../lib/firebaseService"
import styles from "../app/Home.module.css"

export default function DynamicCDs({ isMobile, mobileCdItemStyle, desktopCdItemStyle, mobileCdImageStyle, desktopCdImageStyle }) {
  const [cdData, setCdData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingFallback, setIsUsingFallback] = useState(false)

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
    
    // 如果路径不以/cd/开头但是引用了已知CD图片，则修复路径
    if (!imagePath.startsWith('/cd/')) {
      const fileName = imagePath.split('/').pop()
      const knownImages = ['album-art.png', 'album-cover.png', 'cd-empty-1.png', 'cd-placeholder-1.png', 'cd-placeholder-2.png', 'cd-placeholder-3.png']
      
      if (knownImages.includes(fileName)) {
        return `/cd/${fileName}`
      }
    }
    
    return imagePath
  }

  useEffect(() => {
    let mounted = true
    
    const loadCDs = async () => {
      console.log('🎵 开始加载CD数据...')
      
      try {
        const cds = await getAllCDs()
        
        if (!mounted) return
        
        if (cds && cds.length > 0) {
          // 修复可能的路径问题并过滤显示的CD
          const processedCDs = cds
            .filter(cd => cd.visible !== false)
            .map(cd => ({
              ...cd,
              image: fixImagePath(cd.image)
            }))
          
          console.log('✅ Firebase CD数据加载成功:', processedCDs.length, '个CD')
          setCdData(processedCDs)
          setIsUsingFallback(false)
        } else {
          console.log('⚠️ Firebase返回空数据，使用默认CD数据')
          setCdData(defaultCDs)
          setIsUsingFallback(true)
        }
      } catch (error) {
        if (!mounted) return
        
        console.error('❌ DynamicCDs: Firebase加载失败，使用默认数据:', error)
        setCdData(defaultCDs)
        setIsUsingFallback(true)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadCDs()
    
    return () => {
      mounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div style={{ color: 'white', fontSize: '1rem', opacity: 0.7 }}>
        Loading CDs...
      </div>
    )
  }

  if (!cdData || cdData.length === 0) {
    console.log('🚨 紧急fallback: 使用硬编码默认数据')
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
                  console.warn('🖼️ 图片加载失败:', e.target.src)
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
          <Link href={cd.productLink || '#'}>
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
                  e.target.src = '/placeholder.svg'
                }
              }}
            />
          </Link>
        </div>
      ))}
    </>
  )
} 