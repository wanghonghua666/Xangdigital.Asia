// pages/index.js   
import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  useEffect(() => {
    const track = document.getElementById('scroll-track');
    if (!track) return;

    const items = Array.from(track.querySelectorAll('.scrollItem'));

    const updateScale = () => {
      const centerX = track.scrollLeft + track.offsetWidth / 2;
      items.forEach((item) => {
        const itemX = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(centerX - itemX);
        const scale = Math.max(1 - distance / 300, 0.6); // 更強烈的變化
        const img = item.querySelector('img');
        if (img) {
          img.style.transform = `scale(${scale})`;
          img.style.opacity = `${scale}`;
          img.style.filter = `grayscale(${1 - scale}) blur(${(1 - scale) * 2}px)`;
          img.style.zIndex = Math.floor(scale * 100);
        }
      });
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScale();
          ticking = false;
        });
        ticking = true;
      }
    };

    const snapToClosest = () => {
      let closestItem = null;
      let minDistance = Infinity;
      const centerX = track.scrollLeft + track.offsetWidth / 2;

      items.forEach((item) => {
        const itemX = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(centerX - itemX);
        if (distance < minDistance) {
          minDistance = distance;
          closestItem = item;
        }
      });

      if (closestItem) {
        const scrollTo = closestItem.offsetLeft - track.offsetWidth / 2 + closestItem.offsetWidth / 2;
        track.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    const initializeScroll = () => {
      if (items[0]) {
        const scrollTo = items[0].offsetLeft - track.offsetWidth / 2 + items[0].offsetWidth / 2;
        track.scrollTo({ left: scrollTo });
        updateScale();
      }
    };

    track.addEventListener('scroll', handleScroll);
    track.addEventListener('touchend', snapToClosest);
    track.addEventListener('mouseup', snapToClosest);
    initializeScroll();

    return () => {
      track.removeEventListener('scroll', handleScroll);
      track.removeEventListener('touchend', snapToClosest);
      track.removeEventListener('mouseup', snapToClosest);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>XANGDIGITAL.ASIA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div className={styles.overlay}></div>

      <header className={styles.header}>
        <h1 className={styles.siteTitle}>XANGDIGITAL.ASIA</h1>
        <nav className={styles.navbar}>
          <a href="#work" className={styles.navButton}>WORK</a>
          <a href="#about" className={styles.navButton}>ABOUT</a>
          <a href="#available" className={styles.navButton}>AVAILABLE IN</a>
        </nav>
      </header>

      <main className={styles.main}>
        <h1 className={styles.worktitle}>WORK</h1>
        <section id="scroll-track" className={styles.workSection}>
          <div style={{ flex: '0 0 150px' }} />
          <div className={`${styles.scrollItem} scrollItem`}>
            <Link href="/products/iloveitwhensherideonme">
              <img src="/album-art.png" alt="CD1" className={styles.cdImage} />
            </Link>
          </div>
          <div className={`${styles.scrollItem} scrollItem`}>
            <Link href="/products/oshamambe">
              <img src="/album-cover.png" alt="CD2" className={styles.cdImage} />
            </Link>
          </div>
          <div className={`${styles.scrollItem} scrollItem`}>
            <img src="/cd-empty-1.png" alt="New CD" className={styles.cdImage} />
          </div>
          <div style={{ flex: '0 0 150px' }} />
        </section>

        <section id="about" className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>ABOUT</h2>
          <p className={styles.aboutEText}>Xangdigital, based in Tokyo, creates music.</p>
          <p className={styles.aboutText}>社會塑造個體，道德、羞恥感、群體認同成為束縛。音樂是反作用力，打破邊界，呈現未經雕琢的狀態。創作追求原生，不加修飾，粗礪，無虛假。自然與光是根基，陽光賦予生命，映照萬物，世界由此可感。音樂承載光的質感，純粹而有力。</p>
          <p className={styles.aboutEText}>Society shapes individuals. Morality, shame, and collective identity become restraints. Music is a counterforce, breaking boundaries and revealing an unpolished state. Creation is raw, untouched, unfiltered—it can be rough, but never fake. Nature and light are the foundation. Sunlight gives life, reveals form, and makes the world perceptible. Music carries its essence—pure and powerful.</p>
        </section>

        <section id="available" className={styles.contactSection}>
          <h2 className={styles.contactTitle}>AVAILABLE IN</h2>
          <div className={styles.socialLinks}>
            <a href="https://open.spotify.com/artist/5MK725n9nD9zJvT4gB6T9m" target="_blank" rel="noreferrer" className={styles.socialLink}>
              <img src="/spotify-logo.png" alt="Spotify" className={styles.socialIcon} />
            </a>
            <a href="https://www.youtube.com/channel/UCAcLZb24tL1RI172QHULR3g" target="_blank" rel="noreferrer" className={styles.socialLink}>
              <img src="/youtube-logo.png" alt="YouTube" className={styles.socialIcon} />
            </a>
            <a href="https://music.apple.com/us/artist/xang-digital/1772933469" target="_blank" rel="noreferrer" className={styles.socialLink}>
              <img src="/apple-music-logo.png" alt="Apple Music" className={`${styles.socialIcon} ${styles.appleMusicIcon}`} />
            </a>
            <a href="https://www.instagram.com/djxan_g/" target="_blank" rel="noreferrer" className={styles.socialLink}>
              <img src="/insta.png" alt="Instagram" className={styles.socialIcon} />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
