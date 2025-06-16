import Head from 'next/head';
import Link from 'next/link';

export default function Oshamambe() {
  return (
    <>
      <Head>
        <title>Oshamambe - XANGDIGITAL.ASIA</title>
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
            <img src="/album-cover.png" alt="Oshamambe" className="product-image" />
            <div className="product-info">
              <h1 className="product-title">Oshamambe</h1>
              <p className="product-description">
                A collaborative project exploring natural and digital worlds.
              </p>
              <p className="price">$19.99</p>
              <button className="buy-button">Physical CD Soon</button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
