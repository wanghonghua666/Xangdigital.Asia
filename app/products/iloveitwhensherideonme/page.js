"use client"

import Link from "next/link"
import styles from "./product.module.css"
import DynamicProductPage from "../../../components/DynamicProductPage"

export default function ProductPage() {
  // 保留原有数据作为fallback，防止Firebase连接失败
  const fallbackData = {
    title: "I LOVE IT WHEN SHE RIDE ON ME",
    description: "140g white 12\" vinyl, printed inner sleeve.",
    image: "/cd/album-art.png",
    price: "€23.00",
    trackList: [
      "A1 · HAPPY BOY",
      "A2 · YOU",
      "A3 · EGO DEATH",
      "A4 · I LOVE IT WHEN SHE RIDE ON ME",
      "B1 · WONDERFUL LIFE",
      "B2 · V.I.P. IS FOR EVERYONE",
      "B3 · HEAVEN JUST A BREATH AWAY"
    ],
    details: {
      catalog: "YR0189",
      album: "I LOVE IT WHEN SHE RIDE ON ME",
      releaseType: "Album",
      releaseDate: "20/09/2024",
      label: "YEAR0001",
      ar: "Oskar Ekman",
      writer: "Frederik Valentin",
      producer: "Frederik Valentin",
      mixing: "Frederik Valentin & Emil Emberg",
      master: "Robin Schmidt (24-96 Mastering)",
      creativeDirector: "Andre Jofré",
      artDirector: "Victor Svedberg"
    }
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
        <DynamicProductPage 
          pageId="iloveitwhensherideonme"
          fallbackData={fallbackData}
          styles={styles}
        />
      </main>
    </div>
  )
} 