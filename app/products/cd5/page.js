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
            <img src="/cd/album-art.png" alt="I Love It When She Ride On Me - Deluxe Edition" />
          </div>
          
          <div className={styles.productInfo}>
            <h1 className={styles.productTitle}>I LOVE IT WHEN SHE RIDE ON ME - DELUXE EDITION</h1>
            <p className={styles.productDescription}>
              Deluxe vinyl edition with bonus tracks, alternative mixes, and exclusive content.
            </p>
            
            <div className={styles.productDetails}>
              <p>180g colored vinyl (limited edition blue marble).</p>
              <p>Gatefold sleeve with extended liner notes.</p>
              <p>Includes 4 bonus tracks and instrumentals.</p>
              <p></p>
              <p>Comes with 12"x12" art print signed by artist.</p>
              <p></p>
              <p>Limited to 250 units worldwide.</p>
              <p></p>
              <p>YR0189DLX</p>
              <p></p>
              <p>Album / Release: I LOVE IT WHEN SHE RIDE ON ME</p>
              <p>Release Type: Deluxe Album</p>
              <p>Date of release: 20/09/2024</p>
              <p>Label: YEAR0001</p>
              <p>A&R: Oskar Ekman</p>
              <p>Writer: Frederik Valentin</p>
              <p>Producer: Frederik Valentin</p>
              <p>Additional Production: Studio Collective</p>
              <p>Mixing: Frederik Valentin & Emil Emberg</p>
              <p>Additional Mixing: Premium Studios</p>
              <p>Master: Robin Schmidt (24-96 Mastering)</p>
              <p>Deluxe Mastering: Abbey Road Studios</p>
              <p>Creative Director: Andre Jofré</p>
              <p>Art Director: Victor Svedberg</p>
              <p>Deluxe Packaging: Premium Press</p>
              <p>Photography: Elite Studios</p>
            </div>
            
            <div className={styles.priceSection}>
              <span className={styles.price}>€55.00</span>
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