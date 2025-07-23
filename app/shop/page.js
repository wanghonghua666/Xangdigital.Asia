"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { getVisibleProducts } from "../../lib/firebaseService"
import styles from "./shop.module.css"

export default function Shop() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 检测移动端
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // 加载商品数据
    const loadProducts = async () => {
      try {
        const firebaseProducts = await getVisibleProducts()
        
        if (firebaseProducts && firebaseProducts.length > 0) {
          // 使用Firebase数据
          setProducts(firebaseProducts)
        } else {
          // Fallback到静态数据
          const response = await fetch('/products.json')
          const data = await response.json()
          const visibleProducts = data.products
            .filter(product => product.visible && !product.title.includes("Upcoming") && !product.title.includes("Coming Soon"))
            .sort((a, b) => a.order - b.order)
          setProducts(visibleProducts)
        }
      } catch (error) {
        console.error('Failed to load products:', error)
        // 使用静态数据作为fallback
        try {
          const response = await fetch('/products.json')
          const data = await response.json()
          const visibleProducts = data.products
            .filter(product => product.visible && !product.title.includes("Upcoming") && !product.title.includes("Coming Soon"))
            .sort((a, b) => a.order - b.order)
          setProducts(visibleProducts)
        } catch (fallbackError) {
          console.error('Fallback data also failed:', fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])



  return (
    <>
      <Head>
        <title>SHOP - XANGDIGITAL.ASIA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.wrapper}>
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
                  // 使用动态路由，直接使用产品ID作为slug
                  const productPath = `/products/${product.id}`
                  
                  return (
                    <div key={product.id} className={styles.productCard}>
                      <Link href={productPath}>
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
                              {product.shopifyPrice || `€${product.price}`}
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