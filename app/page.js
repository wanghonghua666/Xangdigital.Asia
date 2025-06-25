"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import styles from "./Home.module.css"
import DeveloperMode from "../components/DeveloperMode"

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 簡單的移動端檢測
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    const container = document.querySelector(".cd-scroll")
    if (!container) return

    const items = container.querySelectorAll(".cd-item")
    let scrollTimeout
    let isScrolling = false
    let snapCount = 0
    let lastSnapTime = 0
    let rapidSnapCount = 0

    // iOS Coverflow風格的CD更新函數
    let isFirstUpdate = true
    const updateCDs = () => {
      const containerRect = container.getBoundingClientRect()
      const centerX = containerRect.left + containerRect.width / 2

      items.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect()
        const itemCenterX = itemRect.left + itemRect.width / 2
        const distance = Math.abs(centerX - itemCenterX)

        // iOS Coverflow效果參數
        const maxDistance = isMobile ? 150 : 200
        const normalizedDistance = Math.min(distance / maxDistance, 1)

        // 平面層疊效果 - 适中的缩放
        const baseScale = isMobile ? 1.0 : 1.15 // 手机端1.0，桌面端1.15
        const scale = isMobile
          ? baseScale - normalizedDistance * 0.2 // 移動端: 0.8-1.0 (适中)
          : baseScale - normalizedDistance * 0.4 // 桌面端: 0.75-1.15

        // 移除3D傾斜，保持平面效果
        
        const blur = normalizedDistance * 1.2
        let opacity = 0.5 + (1 - normalizedDistance) * 0.5
        
        // 第一次更新时，让CD渐入显示
        if (isFirstUpdate) {
          opacity = opacity // 保持计算出的透明度
        }
        
        // 更明顯的層疊z-index
        const zIndex = Math.round(150 - normalizedDistance * 100)

        const img = item.querySelector("img")
        if (img) {
          // 平面層疊變換
          img.style.transform = `scale(${scale})`
          img.style.filter = `blur(${blur}px)`
          img.style.opacity = opacity
          img.style.zIndex = zIndex
          
          // 移除阴影效果
          img.style.boxShadow = 'none'

          // 簡單的中心判定
          const isCenter = distance < 50
          img.style.cursor = isCenter ? "pointer" : "pointer"
          
          // 設置不同的懸停效果類別和當前縮放值
          img.setAttribute('data-is-center', isCenter ? 'true' : 'false')
          img.setAttribute('data-current-scale', scale.toFixed(3))
          
          // 移除之前的事件監聽器
          img.onmouseenter = null
          img.onmouseleave = null
          
          // 添加懸停事件
          img.onmouseenter = () => {
            const currentScale = parseFloat(img.getAttribute('data-current-scale'))
            const isCenter = img.getAttribute('data-is-center') === 'true'
            const hoverMultiplier = isCenter ? 1.04 : 1.01 // 中心CD放大4%，虛影CD放大1%
            const hoverScale = currentScale * hoverMultiplier
            
            img.style.transform = `scale(${hoverScale})`
            img.style.transition = 'all 0.2s ease'
          }
          
          img.onmouseleave = () => {
            const currentScale = parseFloat(img.getAttribute('data-current-scale'))
            img.style.transform = `scale(${currentScale})`
            img.style.transition = 'all 0.2s ease'
          }
          
          // 為非中心CD添加點擊和觸摸事件來移動到中心
          if (!isCenter) {
            const moveToCenter = (e) => {
              e.preventDefault()
              e.stopPropagation()
              
              // 移動這個CD到中心
              const containerRect = container.getBoundingClientRect()
              const itemRect = item.getBoundingClientRect()
              const centerX = containerRect.width / 2
              const itemCenterX = itemRect.left + itemRect.width / 2 - containerRect.left
              const targetScrollLeft = container.scrollLeft + (itemCenterX - centerX)

              container.scrollTo({
                left: targetScrollLeft,
                behavior: "smooth",
              })
            }
            
            img.onclick = moveToCenter
            img.ontouchend = moveToCenter // 添加触摸事件支持
          } else {
            // 中心CD保持原有的點擊行為（進入商品頁面）
            img.onclick = null
            img.ontouchend = null
          }
        }
      })
      
      // 第一次更新后，标记为非首次
      if (isFirstUpdate) {
        isFirstUpdate = false
      }
    }

    // 防抖動的吸附函數
    const snapToCenter = () => {
      const currentTime = Date.now()

      // 防止快速連續吸附（抖動檢測）
      if (currentTime - lastSnapTime < 200) {
        rapidSnapCount++
        console.warn(`⚠️ 快速吸附檢測: ${rapidSnapCount} 次`)

        if (rapidSnapCount > 3) {
          console.warn(`🚫 防抖動: 暫停吸附`)
          return
        }
      } else {
        rapidSnapCount = 0
      }

      const containerRect = container.getBoundingClientRect()
      const centerX = containerRect.left + containerRect.width / 2

      let closestItem = null
      let minDistance = Number.POSITIVE_INFINITY

      // 找到最接近中心的CD
      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect()
        const itemCenterX = itemRect.left + itemRect.width / 2
        const distance = Math.abs(centerX - itemCenterX)

        if (distance < minDistance) {
          minDistance = distance
          closestItem = item
        }
      })

      // 合理的吸附閾值 - 避免抖動
      if (closestItem && minDistance > 12) {
        const itemRect = closestItem.getBoundingClientRect()
        const itemCenterX = itemRect.left + itemRect.width / 2
        const offset = itemCenterX - centerX

        snapCount++
        lastSnapTime = currentTime

        console.log(`📍 吸附執行 #${snapCount}, 距離: ${minDistance.toFixed(1)}px, 偏移: ${offset.toFixed(1)}px`)

        container.scrollBy({
          left: offset,
          behavior: "smooth",
        })
      }
    }

    // 平衡的滾動處理 - 快速但穩定
    const handleScroll = () => {
      isScrolling = true
      updateCDs()

      clearTimeout(scrollTimeout)

      // 平衡的延遲 - 快速但不抖動
      scrollTimeout = setTimeout(() => {
        isScrolling = false
        snapToCenter()
      }, 50) // 50ms - 快速但給足時間穩定
    }

    // 觸摸結束處理 - 稍微延遲確保穩定
    const handleTouchEnd = () => {
      clearTimeout(scrollTimeout)
      isScrolling = false

      // 給一點時間讓滾動穩定
      setTimeout(() => {
        snapToCenter()
      }, 80)
    }

    // 鼠標結束處理
    const handleMouseUp = () => {
      clearTimeout(scrollTimeout)
      isScrolling = false

      setTimeout(() => {
        snapToCenter()
      }, 60)
    }

    // 事件監聽 - 移除鼠標拖拽，保留觸摸支持
    container.addEventListener("scroll", handleScroll, { passive: true })
    container.addEventListener("touchend", handleTouchEnd, { passive: true })
    // 移除 mouseup 事件，禁用鼠標拖拽滾動

    // 鍵盤導航 - 保持即時響應
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault()

        const direction = e.key === "ArrowLeft" ? -1 : 1
        const containerRect = container.getBoundingClientRect()
        const centerX = containerRect.left + containerRect.width / 2

        // 找到當前中心的CD
        let currentIndex = -1
        let minDistance = Number.POSITIVE_INFINITY

        items.forEach((item, index) => {
          const itemRect = item.getBoundingClientRect()
          const itemCenterX = itemRect.left + itemRect.width / 2
          const distance = Math.abs(centerX - itemCenterX)

          if (distance < minDistance) {
            minDistance = distance
            currentIndex = index
          }
        })

        // 移動到下一個CD
        const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction))
        const nextItem = items[nextIndex]

        if (nextItem) {
          const itemRect = nextItem.getBoundingClientRect()
          const itemCenterX = itemRect.left + itemRect.width / 2
          const offset = itemCenterX - centerX

          container.scrollBy({
            left: offset,
            behavior: "smooth",
          })
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    // 初始化CD效果 - 預設樣式避免閃爍
    items.forEach((item) => {
      const img = item.querySelector("img")
      if (img) {
        img.style.transform = "scale(0.8)"
        img.style.opacity = "0" // 初始完全隐藏，避免看到调整过程
        img.style.filter = "blur(1px)"
        // 让CSS处理transition，移除JavaScript的transition设置
      }
    })

    // 等待所有图片加载完成
    const waitForImages = () => {
      const images = container.querySelectorAll('img')
      let loadedImages = 0
      
      if (images.length === 0) {
        initializeCenter()
        return
      }
      
      images.forEach((img) => {
        if (img.complete) {
          loadedImages++
        } else {
          img.onload = () => {
            loadedImages++
            if (loadedImages === images.length) {
              initializeCenter()
            }
          }
          img.onerror = () => {
            loadedImages++
            if (loadedImages === images.length) {
              initializeCenter()
            }
          }
        }
      })
      
      if (loadedImages === images.length) {
        initializeCenter()
      }
    }
    
    // 初始化 - 居中第一個CD並啟動動畫
    const initializeCenter = () => {
      if (items[0]) {
        // 计算第一个CD应该居中的滚动位置
        const containerRect = container.getBoundingClientRect()
        const itemRect = items[0].getBoundingClientRect()
        const containerCenter = containerRect.width / 2
        const itemCenter = itemRect.left + itemRect.width / 2 - containerRect.left
        const requiredScroll = itemCenter - containerCenter
        
        console.log('初始化居中:', {
          containerCenter,
          itemCenter,
          requiredScroll,
          containerWidth: containerRect.width,
          itemWidth: itemRect.width
        })
        
        // 直接设置滚动位置，不使用smooth滚动避免异步问题
        container.scrollLeft = requiredScroll
        
        // 立即更新CD效果，然后再次微调
        setTimeout(() => {
          updateCDs()
          
          // 再次检查并微调位置
          const newContainerRect = container.getBoundingClientRect()
          const newItemRect = items[0].getBoundingClientRect()
          const newContainerCenter = newContainerRect.width / 2
          const newItemCenter = newItemRect.left + newItemRect.width / 2 - newContainerRect.left
          const adjustment = newItemCenter - newContainerCenter
          
          console.log('微调检查:', {
            adjustment,
            newContainerCenter,
            newItemCenter
          })
          
          if (Math.abs(adjustment) > 1) {
            container.scrollLeft = container.scrollLeft + adjustment
            setTimeout(() => updateCDs(), 10)
          }
        }, 50)
      }
    }
    
    // 延迟一点时间再检查图片加载状态
    setTimeout(waitForImages, 100)

    // 穩定性監控
    const stabilityCheck = setInterval(() => {
      if (rapidSnapCount > 0) {
        rapidSnapCount = Math.max(0, rapidSnapCount - 1)
      }
    }, 1000)

    return () => {
      container.removeEventListener("scroll", handleScroll)
      container.removeEventListener("touchend", handleTouchEnd)
      // 移除了 mouseup 事件監聽器
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", checkMobile)
      clearTimeout(scrollTimeout)
      clearInterval(stabilityCheck)
    }
  }, [isMobile])

  return (
    <>
      <Head>
        <title>XANGDIGITAL.ASIA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div className={styles.wrapper}>
        <div className={styles.fadeIn}></div>
        <div className={styles.overlay}></div>

        <header className={styles.header}>
          <h1 className={styles.siteTitle}>XANGDIGITAL.ASIA</h1>
          <nav className={styles.guidebar}>
            <a href="#work" className={styles.guidebarItem}>
              WORK
            </a>
            <Link href="/shop" className={styles.guidebarItem}>
              SHOP
            </Link>
          </nav>
        </header>

        <main className={styles.main}>
          <h1 className={styles.worktitle}>MUSIC</h1>

          <div className={styles.cdSection}>
            <div className="cd-scroll" style={isMobile ? mobileScrollStyle : desktopScrollStyle}>
              <div style={{ minWidth: "50vw" }}></div>

              <div className="cd-item" style={isMobile ? mobileCdItemStyle : desktopCdItemStyle}>
                <Link href="/products/iloveitwhensherideonme">
                  <img
                    src="/album-art.png"
                    alt="Album 1"
                    style={isMobile ? mobileCdImageStyle : desktopCdImageStyle}
                    className="cd-image"
                  />
                </Link>
              </div>

              <div className="cd-item" style={isMobile ? mobileCdItemStyle : desktopCdItemStyle}>
                <Link href="/products/oshamambe">
                  <img
                    src="/album-cover.png"
                    alt="Album 2"
                    style={isMobile ? mobileCdImageStyle : desktopCdImageStyle}
                    className="cd-image"
                  />
                </Link>
              </div>

              <div className="cd-item" style={isMobile ? mobileCdItemStyle : desktopCdItemStyle}>
                <Link href="/products/cd3">
                  <img
                    src="/cd-empty-1.png"
                    alt="Album 3"
                    style={isMobile ? mobileCdImageStyle : desktopCdImageStyle}
                    className="cd-image"
                  />
                </Link>
              </div>

              <div className="cd-item" style={isMobile ? mobileCdItemStyle : desktopCdItemStyle}>
                <Link href="/products/cd4">
                  <img
                    src="/cd-placeholder-2.png"
                    alt="Digital Dreams EP"
                    style={isMobile ? mobileCdImageStyle : desktopCdImageStyle}
                    className="cd-image"
                  />
                </Link>
              </div>

              <div className="cd-item" style={isMobile ? mobileCdItemStyle : desktopCdItemStyle}>
                <Link href="/products/cd5">
                  <img
                    src="/album-art.png"
                    alt="Deluxe Edition"
                    style={isMobile ? mobileCdImageStyle : desktopCdImageStyle}
                    className="cd-image"
                  />
                </Link>
              </div>

              <div style={{ minWidth: "50vw" }}></div>
            </div>
          </div>

          <section id="about" className={styles.aboutSection}>
            <h2 className={styles.sectionTitle}>ABOUT</h2>
            <p className={styles.aboutEText}>Xangdigital, based in Tokyo, creates music.</p>
            <p className={styles.aboutText}>
              社會塑造個體，道德、羞恥感、群體認同成為束縛。音樂是反作用力，打破邊界，呈現未經雕琢的狀態。創作追求原生，不加修飾，粗礪，無虛假。自然與光是根基，陽光賦予生命，映照萬物，世界由此可感。音樂承載光的質感，純粹而有力。
            </p>
            <p className={styles.aboutEText}>
              Society shapes individuals. Morality, shame, and collective identity become restraints. Music is a
              counterforce, breaking boundaries and revealing an unpolished state. Creation is raw, untouched,
              unfiltered—it can be rough, but never fake. Nature and light are the foundation. Sunlight gives life,
              reveals form, and makes the world perceptible. Music carries its essence—pure and powerful.
            </p>
          </section>

          <section id="available" className={styles.contactSection}>
            <h2 className={styles.contactTitle}>AVAILABLE IN</h2>
            <div className={styles.socialLinks}>
              <a
                href="https://open.spotify.com/artist/5MK725n9nD9zJvT4gB6T9m"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
              >
                <img src="/spotify-logo.png" alt="Spotify" className={styles.socialIcon} />
              </a>
              <a
                href="https://www.youtube.com/channel/UCAcLZb24tL1RI172QHULR3g"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
              >
                <img src="/youtube-logo.png" alt="YouTube" className={styles.socialIcon} />
              </a>
              <a
                href="https://music.apple.com/us/artist/xang-digital/1772933469"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
              >
                <img
                  src="/apple-music-logo.png"
                  alt="Apple Music"
                  className={`${styles.socialIcon} ${styles.appleMusicIcon}`}
                />
              </a>
              <a
                href="https://www.instagram.com/djxan_g/"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
              >
                <img src="/insta.png" alt="Instagram" className={styles.socialIcon} />
              </a>
            </div>
          </section>
        </main>

        <DeveloperMode />
      </div>

      <style jsx>{`
        .cd-scroll::-webkit-scrollbar {
          display: none;
        }
        .cd-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .cd-image {
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        }
      `}</style>
    </>
  )
}

// 桌面端樣式 - 恢复滚动功能
const desktopScrollStyle = {
  display: "flex",
  overflowX: "auto", // 恢复滚动功能
  overflowY: "hidden",
  gap: "0.8rem", // 稍微减少gap，确保居中计算准确
  padding: "2rem 0", // 减少padding
  alignItems: "center",
  cursor: "default", // 移除拖拽游標
  position: "relative", // 為z-index提供定位上下文
  perspective: "1000px", // 3D透視效果
}

const desktopCdItemStyle = {
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative", // 為層疊效果準備
}

const desktopCdImageStyle = {
  width: "200px", // 统一基础尺寸为200px
  height: "200px",
  borderRadius: "0px",
  objectFit: "cover",
  cursor: "pointer",
  // 移除固定的transition，让CSS处理
  transformStyle: "preserve-3d", // 3D效果支持
}

// 移動端樣式 - 恢复滚动功能
const mobileScrollStyle = {
  display: "flex",
  overflowX: "auto", // 恢复滚动功能
  overflowY: "hidden",
  gap: "0.5rem", // 适中間距
  padding: "1rem 0", // 合理padding给CD空间
  alignItems: "center",
  cursor: "default", // 移除拖拽游標
  position: "relative", // 為z-index提供定位上下文
  perspective: "800px", // 移動端3D透視效果
}

const mobileCdItemStyle = {
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative", // 為層疊效果準備
}

const mobileCdImageStyle = {
  width: "234px", // 增大30%: 180 * 1.3 = 234px
  height: "234px",
  borderRadius: "0px",
  objectFit: "cover",
  cursor: "pointer",
  // 移除固定的transition，让CSS处理
  transformStyle: "preserve-3d", // 3D效果支持
}
