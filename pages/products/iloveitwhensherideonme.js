import Head from 'next/head';
import Link from 'next/link';

export default function ILoveItWhenSheRideOnMe() {
  return (
    <div>
      <Head>
        <title>ILOVEITWHENSHERIDEONME - XANGDIGITAL.ASIA</title>
      </Head>

      <div className="overlay"></div>
      <div className="content">
        <header>
          <nav>
            <h1>XANGDIGITAL.ASIA</h1>
            <Link href="/">
              <button className="back-button">← Back</button>
            </Link>
          </nav>
        </header>

        <main>
          <div className="product-layout">
            <img
              src="/album-art.png"
              alt="ILOVEITWHENSHERIDEONME"
              className="product-image"
            />
            <div className="product-info">
              <h1 className="product-title">ILOVEITWHENSHERIDEONME</h1>
              <p className="product-description">
                A journey through electronic soundscapes and digital atmospheres.
              </p>
              <p className="price">$19.99</p>
              <button className="buy-button">Physical CD Soon</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
