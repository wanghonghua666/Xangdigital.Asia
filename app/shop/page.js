"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import styles from "../Home.module.css"

export default function Shop() {
  const [products, setProducts] = useState([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 检测移动端
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // 加载商品数据
    fetch('/products.json')
      .then(res => res.json())
      .then(data => {
        // 只显示可见且可购买的商品（过滤掉placeholder），按order排序
        const visibleProducts = data.products
          .filter(product => product.visible && !product.title.includes("Upcoming") && !product.title.includes("Coming Soon"))
          .sort((a, b) => a.order - b.order)
        setProducts(visibleProducts)
      })
      .catch(err => console.error('Failed to load products:', err))

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
        <div className={styles.fadeIn}></div>
        <div className={styles.overlay}></div>

        <header className={styles.header}>
          <Link href="/">
            <h1 className={styles.siteTitle}>XANGDIGITAL.ASIA</h1>
          </Link>
          <nav className={styles.guidebar}>
            <Link href="/#work" className={styles.guidebarItem}>
              WORK
            </Link>
            <Link href="/shop" className={styles.guidebarItem}>
              SHOP
            </Link>
          </nav>
        </header>

        <main className={styles.main}>
          <h1 className={styles.worktitle}>SHOP</h1>

          <div className={styles.shopSection}>
            <div className={styles.productsGrid}>
              {products.map((product) => {
                // 映射产品ID到页面路径
                const getProductPath = (productId) => {
                  const pathMap = {
                    'album-art-1': '/products/iloveitwhensherideonme',
                    'album-cover-1': '/products/oshamambe',
                    'cd-placeholder-1': '/products/cd3',
                    'cd-placeholder-2': '/products/cd4',
                    'cd-placeholder-3': '/products/cd5'
                  }
                  return pathMap[productId] || '/products/cd3'
                }
                
                return (
                  <Link key={product.id} href={getProductPath(product.id)} className={styles.productCard}>
                    <div className={styles.productImage}>
                      <img 
                        src={product.image} 
                        alt={product.title}
                        onError={(e) => {
                          e.target.src = '/placeholder.svg'
                        }}
                      />
                      <h3 className={styles.productTitle}>{product.title}</h3>
                    </div>
                    <div className={styles.productInfo}>
                      <div className={styles.productPrice}>€{product.price}</div>
                      <div className={styles.shopifyButton}>
                        {/* Shopify Buy Button 预留位置 */}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </>
  )
} 