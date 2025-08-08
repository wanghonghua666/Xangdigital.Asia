"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { getVisibleProducts, getAllProductPages } from "../../lib/firebaseService"
import styles from "./shop.module.css"

export default function Shop() {
  const [products, setProducts] = useState([])
  const [productPages, setProductPages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [showFadeIn, setShowFadeIn] = useState(true)

  useEffect(() => {
    // 检测移动端
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // 加载商品数据
    const loadProducts = async () => {
      console.log(`🔄 [SHOP] 开始加载商品数据...`)
      try {
        console.log(`📦 [SHOP] 并行加载Firebase商品和产品页面数据...`)
        const [pagesData] = await Promise.all([
          getAllProductPages().catch((err) => {
            console.error(`❌ [SHOP] 获取产品页面失败:`, err)
            return []
          })
        ])
        
        console.log(`✅ [SHOP] Firebase数据加载完成:`, {
          pages: pagesData?.length || 0
        })
        
        if (pagesData && pagesData.length > 0) {
          // 使用Firebase产品页面数据，过滤可见的
          const visibleProducts = pagesData.filter(page => page.visible !== false)
          console.log(`✅ [SHOP] 使用Firebase产品页面数据，共 ${visibleProducts.length} 个可见商品`)
          setProducts(visibleProducts)
          setProductPages(pagesData)
        } else {
          // Fallback到静态数据
          console.log(`🔄 [SHOP] Firebase无数据，使用静态fallback数据...`)
          const response = await fetch('/products.json')
          const data = await response.json()
          const visibleProducts = data.products
            .filter(product => product.visible && !product.title.includes("Upcoming") && !product.title.includes("Coming Soon"))
            .sort((a, b) => a.order - b.order)
          console.log(`✅ [SHOP] 静态fallback数据加载成功，共 ${visibleProducts.length} 个商品`)
          setProducts(visibleProducts)
          setProductPages([])
        }
      } catch (error) {
        console.error(`❌ [SHOP] 加载商品数据失败:`, error)
        // 使用静态数据作为fallback
        try {
          console.log(`🔄 [SHOP] 使用静态数据作为fallback...`)
          const response = await fetch('/products.json')
          const data = await response.json()
          const visibleProducts = data.products
            .filter(product => product.visible && !product.title.includes("Upcoming") && !product.title.includes("Coming Soon"))
            .sort((a, b) => a.order - b.order)
          console.log(`✅ [SHOP] 静态fallback数据设置成功，共 ${visibleProducts.length} 个商品`)
          setProducts(visibleProducts)
        } catch (fallbackError) {
          console.error(`❌ [SHOP] 静态fallback数据也失败:`, fallbackError)
        }
      } finally {
        setIsLoading(false)
        console.log(`✅ [SHOP] 商品数据加载流程完成`)
      }
    }

    loadProducts()

    // 页面加载完成后隐藏fadeIn效果
    const timer = setTimeout(() => {
      setShowFadeIn(false)
    }, 1500)

    return () => {
      window.removeEventListener("resize", checkMobile)
      clearTimeout(timer)
    }
  }, [])

  // 根据商品标题查找对应的产品页面slug
  const findProductPageSlug = (productTitle) => {
    console.log(`🔍 [SHOP] 查找产品页面slug，商品标题: ${productTitle}`)
    console.log(`📄 [SHOP] 可用的产品页面:`, productPages.map(p => ({ title: p.title, id: p.firestoreId || p.id })))
    
    const page = productPages.find(page => 
      page.title.toLowerCase() === productTitle.toLowerCase() ||
      page.title.toLowerCase().includes(productTitle.toLowerCase()) ||
      productTitle.toLowerCase().includes(page.title.toLowerCase())
    )
    
    if (page) {
      const slug = page.firestoreId || page.id
      console.log(`✅ [SHOP] 找到匹配的产品页面: ${page.title} -> ${slug}`)
      return slug
    } else {
      console.log(`❌ [SHOP] 未找到匹配的产品页面: ${productTitle}`)
      return null
    }
  }

  return (
    <>
      <Head>
        <title>SHOP - XANGDIGITAL.ASIA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.wrapper}>
        {showFadeIn && <div className={styles.fadeIn}></div>}
        <div className={styles.overlay}></div>

        <header className={styles.header}>
          <h1 className={styles.siteTitle}>XANGDIGITAL.ASIA</h1>
          <nav className={styles.guidebar}>
            <a href="/#work" className={styles.guidebarItem}>
              WORK
            </a>
            <Link href="/shop" className={styles.guidebarItem}>
              SHOP
            </Link>
          </nav>
        </header>

        <main className={styles.main}>
          <h1 className={styles.worktitle}>SHOP</h1>

          <div className={styles.shopSection}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
                加载中...
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {products.map((product) => {
                  // 使用产品的firestoreId作为slug
                  const productPageSlug = product.firestoreId || product.id
                  const productPath = `/products/${productPageSlug}`
                  
                  console.log(`🔗 [SHOP] 商品链接生成:`, {
                    productTitle: product.title,
                    productPageSlug: productPageSlug,
                    productPath: productPath,
                    firestoreId: product.firestoreId
                  })
                  
                  return (
                    <div key={product.firestoreId || product.id} className={styles.productCard}>
                      <Link 
                        href={`${productPath}?from=${encodeURIComponent('/shop')}`}
                        onClick={() => {
                          console.log(`🖱️ [SHOP] 点击商品: ${product.title} -> ${productPath}`)
                          // 存储来源信息到sessionStorage
                          sessionStorage.setItem('productPageFrom', '/shop')
                        }}
                      >
                        <div className={styles.productImage}>
                          <img 
                            src={product.image} 
                            alt={product.title}
                            onError={(e) => {
                              e.target.src = '/placeholder.svg'
                            }}
                          />
                          <div className={styles.productInfoOverlay}>
                            <h3 className={styles.productTitle}>{product.title}</h3>
                            <div className={styles.productPrice}>
                              {product.price}
                            </div>
                          </div>
                        </div>
                      </Link>

                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
} 