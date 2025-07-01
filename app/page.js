"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import styles from "./Home.module.css"
import DeveloperMode from "../components/DeveloperMode"
import DynamicCDs from "../components/DynamicCDs"
import "../styles/cd-carousel.css"

// 桌面端樣式 - 恢复滚动功能  
const desktopScrollStyle = {
  display: "flex",
  flexDirection: "row", 
  overflowX: "auto",
  overflowY: "hidden",
  gap: "0.8rem",
  padding: "2rem 0",
  alignItems: "center",
  justifyContent: "flex-start",
  cursor: "default",
  position: "relative",
  perspective: "1000px",
  width: "100%",
  gridTemplateColumns: "none", // 防止grid覆盖
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
  flexDirection: "row",
  overflowX: "auto",
  overflowY: "hidden",
  gap: "0.5rem",
  padding: "1rem 0",
  alignItems: "center",
  justifyContent: "flex-start",
  cursor: "default",
  position: "relative",
  perspective: "800px",
  width: "100%",
  gridTemplateColumns: "none", // 防止grid覆盖
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

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 移动端检测
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    const container = document.querySelector(".cd-scroll")
    if (!container) return

    const updateCDs = () => {
      const items = container.querySelectorAll(".cd-item")
      const containerRect = container.getBoundingClientRect()
      const centerX = containerRect.left + containerRect.width / 2

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect()
        const itemCenterX = itemRect.left + itemRect.width / 2
        const distance = Math.abs(centerX - itemCenterX)
        const maxDistance = isMobile ? 150 : 200
        const normalizedDistance = Math.min(distance / maxDistance, 1)

        const img = item.querySelector("img")
        if (img) {
          const scale = 1 - normalizedDistance * 0.3
          const opacity = 0.6 + (1 - normalizedDistance) * 0.4
          
          // 使用CSS自定义属性，不干扰hover效果
          img.style.setProperty('--dynamic-scale', scale)
          img.style.setProperty('--dynamic-opacity', opacity)
          img.style.transition = 'all 0.3s ease'
          
          // 判断是否为中心CD，给中心CD添加特殊类名
          const isCenter = distance < 50
          if (isCenter) {
            img.classList.add('center-cd')
          } else {
            img.classList.remove('center-cd')
          }
          
          img.style.cursor = "pointer"
          
          // 清除之前的事件
          img.onclick = null
          
          if (!isCenter) {
            // 非中心CD点击后滚动到中心
            img.onclick = (e) => {
              e.preventDefault()
              e.stopPropagation()
              
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
          }
        }
      })
    }

    // 自动吸附功能
    let scrollTimeout
    const snapToCenter = () => {
      const items = container.querySelectorAll(".cd-item")
      const containerRect = container.getBoundingClientRect()
      const centerX = containerRect.left + containerRect.width / 2

      let closestItem = null
      let minDistance = Number.POSITIVE_INFINITY

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect()
        const itemCenterX = itemRect.left + itemRect.width / 2
        const distance = Math.abs(centerX - itemCenterX)

        if (distance < minDistance) {
          minDistance = distance
          closestItem = item
        }
      })

      if (closestItem && minDistance > 15) {
        const itemRect = closestItem.getBoundingClientRect()
        const itemCenterX = itemRect.left + itemRect.width / 2
        const offset = itemCenterX - centerX

        container.scrollBy({
          left: offset,
          behavior: "smooth",
        })
      }
    }

    const handleScroll = () => {
      updateCDs()
      
      // 防抖动的自动吸附
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        snapToCenter()
      }, 150)
    }

    // 键盘导航
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault()

        const direction = e.key === "ArrowLeft" ? -1 : 1
        const items = container.querySelectorAll(".cd-item")
        const containerRect = container.getBoundingClientRect()
        const centerX = containerRect.left + containerRect.width / 2

        // 找到当前中心的CD
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

        // 移动到下一个CD
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

    container.addEventListener("scroll", handleScroll, { passive: true })
    document.addEventListener("keydown", handleKeyDown)

    // 初始化 - 居中第一个CD
    const init = () => {
      const items = container.querySelectorAll(".cd-item")
      if (items.length > 0) {
        // 计算第一个CD应该居中的滚动位置
        const containerRect = container.getBoundingClientRect()
        const itemRect = items[0].getBoundingClientRect()
        const containerCenter = containerRect.width / 2
        const itemCenter = itemRect.left + itemRect.width / 2 - containerRect.left
        const requiredScroll = itemCenter - containerCenter
        
        // 设置滚动位置
        container.scrollLeft = container.scrollLeft + requiredScroll
        
        // 应用视觉效果
        setTimeout(() => {
          updateCDs()
        }, 10)
      }
    }

    setTimeout(init, 300)

    return () => {
      container.removeEventListener("scroll", handleScroll)
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", checkMobile)
      clearTimeout(scrollTimeout)
    }
  }, [isMobile])

  return (
    <>
      <Head>
        <title>XANGDIGITAL.ASIA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
          <h1 className={styles.RedFont2}>MUSIC</h1>

          <div className={styles.cdSection}>
            <div className={`cd-scroll ${styles.cdScroll}`} style={isMobile ? mobileScrollStyle : desktopScrollStyle}>
              <div style={{ minWidth: "50vw" }}></div>

              <DynamicCDs 
                isMobile={isMobile}
                mobileCdItemStyle={mobileCdItemStyle}
                desktopCdItemStyle={desktopCdItemStyle}
                mobileCdImageStyle={mobileCdImageStyle}
                desktopCdImageStyle={desktopCdImageStyle}
              />

              <div style={{ minWidth: "50vw" }}></div>
            </div>
          </div>

          <section id="about" className={styles.aboutSection}>
            <h2 className={styles.RedFont2}>ABOUT</h2>
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
            <h2 className={styles.RedFont2}>AVAILABLE IN</h2>
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


    </>
  )
}
