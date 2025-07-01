"use client"

import Head from "next/head"
import Link from "next/link"
import styles from "./product.module.css"

export default function ProductPage() {
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
          <div className={styles.productContainer}>
            <div className={styles.productImage}>
              <img src="/cd/cd-empty-1.png" alt="Upcoming Release" />
            </div>
            
            <div className={styles.productInfo}>
              <h1 className={styles.productTitle}>XANGDIGITAL ARCHIVE VOL.1</h1>
              <p className={styles.productDescription}>
                Limited edition vinyl compilation featuring unreleased tracks and remixes.
              </p>
              
              <div className={styles.productDetails}>
                <p>180g black vinyl, gatefold sleeve.</p>
                <p>Includes download code for high-quality digital files.</p>
                <p>Hand-numbered limited edition of 500 copies.</p>
                <p></p>
                <p>Comes with exclusive poster and sticker set.</p>
                <p></p>
                <p>Limited to 500 units.</p>
                <p></p>
                <p>YR0191</p>
                <p></p>
                <p>Album / Release: Archive Vol.1</p>
                <p>Release Type: Compilation</p>
                <p>Date of release: 01/12/2024</p>
                <p>Label: YEAR0001</p>
                <p>A&R: Xang Digital</p>
                <p>Curator: Xang Digital</p>
                <p>Producer: Various Artists</p>
                <p>Mastering: Sterling Sound</p>
                <p>Creative Direction: Xang Digital</p>
                <p>Artwork: Digital Collective</p>
                <p>Photography: Tokyo Studios</p>
                <p>Design: Minimal Works</p>
              </div>
              
              <div className={styles.priceSection}>
                <span className={styles.price}>€45.00</span>
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
    </>
  )
} 