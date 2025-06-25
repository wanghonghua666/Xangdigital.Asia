"use client"

import Link from "next/link"
import styles from "./product.module.css"

export default function ProductPage() {
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
        <div className={styles.productContainer}>
          <div className={styles.productImage}>
            <img src="/album-art.png" alt="I Love It When She Ride On Me" />
          </div>
          
          <div className={styles.productInfo}>
            <h1 className={styles.productTitle}>I LOVE IT WHEN SHE RIDE ON ME</h1>
            <p className={styles.productDescription}>
              140g white 12" vinyl, printed inner sleeve.
            </p>
            
            <div className={styles.trackList}>
              <h3>TRACKLIST:</h3>
              <p>A1 · HAPPY BOY</p>
              <p>A2 · YOU</p>
              <p>A3 · EGO DEATH</p>
              <p>A4 · I LOVE IT WHEN SHE RIDE ON ME</p>
              <p>B1 · WONDERFUL LIFE</p>
              <p>B2 · V.I.P. IS FOR EVERYONE</p>
              <p>B3 · HEAVEN JUST A BREATH AWAY</p>
            </div>
            
            <div className={styles.productDetails}>
              <p>YR0189</p>
              <p>Album / Release: I LOVE IT WHEN SHE RIDE ON ME</p>
              <p>Release Type: Album</p>
              <p>Date of release: 20/09/2024</p>
              <p>Label: YEAR0001</p>
              <p>A&R: Oskar Ekman</p>
              <p>Writer: Frederik Valentin</p>
              <p>Producer: Frederik Valentin</p>
              <p>Mixing: Frederik Valentin & Emil Emberg</p>
              <p>Master: Robin Schmidt (24-96 Mastering)</p>
              <p>Creative Director: Andre Jofré</p>
              <p>Art Director: Victor Svedberg</p>
            </div>
            
            <div className={styles.priceSection}>
              <span className={styles.price}>€23.00</span>
            </div>
            
            {/* Shopify Buy Button 预留位置 */}
            <div className={styles.buyButtonContainer}>
              <button className={styles.buyButton}>
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 