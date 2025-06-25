"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"

export default function Admin() {
  const [products, setProducts] = useState([])
  const [availableImages, setAvailableImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
    loadAvailableImages()
  }, [])

  const loadProducts = async () => {
    try {
      const res = await fetch('/products.json')
      const data = await res.json()
      setProducts(data.products)
    } catch (err) {
      console.error('Failed to load products:', err)
    }
  }

  const loadAvailableImages = async () => {
    try {
      const res = await fetch('/api/images')
      const images = await res.json()
      setAvailableImages(images)
    } catch (err) {
      console.error('Failed to load images:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateProduct = (index, field, value) => {
    const updatedProducts = [...products]
    updatedProducts[index] = { ...updatedProducts[index], [field]: value }
    setProducts(updatedProducts)
  }

  const addNewProduct = () => {
    const newProduct = {
      id: `product-${Date.now()}`,
      title: "新商品",
      description: "商品描述",
      image: "/placeholder.svg",
      price: 0,
      category: "music",
      visible: false,
      order: products.length + 1
    }
    setProducts([...products, newProduct])
  }

  const deleteProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index)
    setProducts(updatedProducts)
  }

  const saveProducts = async () => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      })
      
      if (res.ok) {
        alert('商品保存成功！')
      } else {
        alert('保存失败，请重试')
      }
    } catch (err) {
      console.error('Failed to save products:', err)
      alert('保存失败，请重试')
    }
  }

  if (loading) {
    return <div className="loading">加载中...</div>
  }

  return (
    <>
      <Head>
        <title>Admin - XANGDIGITAL.ASIA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="admin-container">
        <header className="admin-header">
          <div className="header-left">
            <Link href="/">
              <button className="back-btn">← 返回主页</button>
            </Link>
            <h1>XANGDIGITAL.ASIA - 后台管理</h1>
          </div>
          <div className="admin-actions">
            <button onClick={addNewProduct} className="add-btn">
              添加商品
            </button>
            <button onClick={saveProducts} className="save-btn">
              保存更改
            </button>
          </div>
        </header>

        <main className="admin-main">
          <div className="products-list">
            {products.map((product, index) => (
              <div key={product.id} className="product-item">
                <div className="product-order">
                  <label>排序:</label>
                  <input
                    type="number"
                    value={product.order}
                    onChange={(e) => updateProduct(index, 'order', parseInt(e.target.value))}
                  />
                </div>

                <div className="product-image-selector">
                  <label>图片:</label>
                  <select
                    value={product.image}
                    onChange={(e) => updateProduct(index, 'image', e.target.value)}
                  >
                    {availableImages.map((img) => (
                      <option key={img} value={img}>
                        {img}
                      </option>
                    ))}
                  </select>
                  <img src={product.image} alt="预览" className="image-preview" />
                </div>

                <div className="product-details">
                  <div className="form-group">
                    <label>标题:</label>
                    <input
                      type="text"
                      value={product.title}
                      onChange={(e) => updateProduct(index, 'title', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>描述:</label>
                    <textarea
                      value={product.description}
                      onChange={(e) => updateProduct(index, 'description', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>价格:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={product.price}
                      onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label>分类:</label>
                    <select
                      value={product.category}
                      onChange={(e) => updateProduct(index, 'category', e.target.value)}
                    >
                      <option value="music">音乐</option>
                      <option value="merch">周边</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={product.visible}
                        onChange={(e) => updateProduct(index, 'visible', e.target.checked)}
                      />
                      显示在商店
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => deleteProduct(index)}
                  className="delete-btn"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>

      <style jsx>{`
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: white;
          background: #000;
        }

        .admin-container {
          min-height: 100vh;
          background: #000;
          color: white;
          font-family: monospace;
        }

        .admin-header {
          padding: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: monospace;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: red;
          color: red;
        }

        .admin-header h1 {
          color: red;
          margin: 0;
        }

        .admin-actions {
          display: flex;
          gap: 1rem;
        }

        .add-btn, .save-btn {
          background: red;
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: monospace;
        }

        .add-btn:hover, .save-btn:hover {
          background: #cc0000;
        }

        .admin-main {
          padding: 2rem;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .product-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1.5rem;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1.5rem;
          align-items: start;
        }

        .product-order {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .product-image-selector {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .image-preview {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }

        input, textarea, select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: white;
          padding: 0.5rem;
          font-family: monospace;
        }

        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: red;
        }

        textarea {
          resize: vertical;
          min-height: 60px;
        }

        .delete-btn {
          background: #666;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          height: fit-content;
        }

        .delete-btn:hover {
          background: #999;
        }

        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .header-left {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          .back-btn {
            align-self: flex-start;
          }

          .product-item {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }
      `}</style>
    </>
  )
} 