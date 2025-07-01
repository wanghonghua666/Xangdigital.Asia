"use client"

import Head from "next/head"
import Link from "next/link"
import styles from "./product.module.css"
import DynamicProductPage from "../../../components/DynamicProductPage"

export default function ProductPage() {
  // 保留原有数据作为fallback，防止Firebase连接失败
  const fallbackData = {
    title: "OSHAMAMBE",
    description: "Digital EP release.",
    image: "/cd/album-cover.png",
    price: "€15.00",
    trackList: [
      "A1 · INTRO",
      "A2 · OSHAMAMBE THEME"
    ],
    details: {
      catalog: "YR0190",
      album: "OSHAMAMBE",
      releaseType: "EP",
      releaseDate: "01/10/2024",
      label: "YEAR0001"
    }
  }

  return (
    <>
      <Head>
        <title>XANGDIGITAL.ASIA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className={styles.wrapper}>
        <div className={styles.overlay}></div>
        
        <header className={styles.header}>
          <Link href="/" className={styles.backButton}>
            ← BACK
          </Link>
          <h1 className={styles.siteTitle}>XANGDIGITAL.ASIA</h1>
        </header>

        <main className={styles.main}>
          <DynamicProductPage 
            pageId="oshamambe"
            fallbackData={fallbackData}
            styles={styles}
          />
        </main>
      </div>
    </>
  )
} 