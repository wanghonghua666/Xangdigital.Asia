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
            <img src="/album-cover.png" alt="Oshamambe" />
          </div>
          
          <div className={styles.productInfo}>
            <h1 className={styles.productTitle}>MERELY / BOOK OF HOURS + SCULPTURE CD</h1>
            <p className={styles.productDescription}>
              Limited edition book with exclusive content and CD.
            </p>
            
            <div className={styles.productDetails}>
              <p>52 pages, 4cp/4cp on 70# Silk Text paper.</p>
              <p>Thermochromic (heat sensitive) cover on 80#/9 pt.</p>
              <p>Pacesetter Silk Cover paper.</p>
              <p></p>
              <p>Comes in 945 g/m2 protective box.</p>
              <p></p>
              <p>Limited to 100 units.</p>
              <p></p>
              <p>YR0167</p>
              <p></p>
              <p>Album / Release: Oshamambe</p>
              <p>Release Type: Album</p>
              <p>Date of release: 14/10/2022</p>
              <p>Label: YEAR0001</p>
              <p>A&R: Emilio Fagone</p>
              <p>Writer: Kristina Florell</p>
              <p>Producer: Merely</p>
              <p>Producer: Cotton Mouth</p>
              <p>Producer (Tracks 9 & 13): Malibu</p>
              <p>Drums (Track 8): Per Nordmark</p>
              <p>Transverse Flute (Tracks 7 & 11): Sofia Florell</p>
              <p>Mixing: Merely</p>
              <p>Mixing: Cotton Mouth</p>
              <p>Add. Mixing (Track 8): Daniel Bengtsson</p>
              <p>Master: Robin Schmidt (24/96 Mastering)</p>
              <p>Creative Direction: Victor Svedberg</p>
              <p>Creative Direction: Merely</p>
              <p>Creative Direction: Adam Carlander</p>
              <p>Photographer: Philip Svensson</p>
              <p>Illustration: Bosco Park</p>
              <p>Video: Linda Pedersen</p>
              <p>Writing: Billie Bugara</p>
            </div>
            
            <div className={styles.priceSection}>
              <span className={styles.price}>€34.00</span>
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