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
            <img src="/cd-placeholder-2.png" alt="Digital Dreams EP" />
          </div>
          
          <div className={styles.productInfo}>
            <h1 className={styles.productTitle}>XANGDIGITAL / DIGITAL DREAMS EP</h1>
            <p className={styles.productDescription}>
              Ethereal electronic soundscapes exploring digital consciousness and artificial emotions.
            </p>
            
            <div className={styles.productDetails}>
              <p>Digital release with high-quality 24-bit/96kHz files.</p>
              <p>Includes bonus ambient extended versions.</p>
              <p>Features generative AI-assisted composition.</p>
              <p></p>
              <p>Comes with exclusive digital artwork collection.</p>
              <p></p>
              <p>Limited digital edition of 1000 downloads.</p>
              <p></p>
              <p>YR0192</p>
              <p></p>
              <p>Album / Release: Digital Dreams</p>
              <p>Release Type: EP</p>
              <p>Date of release: 15/01/2025</p>
              <p>Label: YEAR0001</p>
              <p>A&R: Digital Collective</p>
              <p>Writer: Xang Digital</p>
              <p>Producer: Xang Digital</p>
              <p>Co-Producer: Neural Networks</p>
              <p>AI Assistance: GPT-4 Music</p>
              <p>Mixing: Cloud Studios</p>
              <p>Mastering: Digital Precision</p>
              <p>Creative Direction: Future Vision</p>
              <p>Visual Art: AI Generated</p>
              <p>Photography: Synthetic Media</p>
              <p>Design: Algorithm Design</p>
            </div>
            
            <div className={styles.priceSection}>
              <span className={styles.price}>€12.00</span>
            </div>
            
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