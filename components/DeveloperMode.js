"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  getAllProducts, 
  getAllCDs, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  createCD,
  updateCD,
  deleteCD,
  uploadImage,
  getAllImages,
  deleteImage,
  migrateProductsFromJSON,
  initializeCDs
} from "../lib/firebaseService"

export default function DeveloperMode() {
  const [showModal, setShowModal] = useState(false)
  const [showFirebaseModal, setShowFirebaseModal] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Firebase管理数据状态
  const [products, setProducts] = useState([])
  const [cds, setCds] = useState([])
  const [images, setImages] = useState([])
  const [activeTab, setActiveTab] = useState("products")
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCD, setEditingCD] = useState(null)
  
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password === "88888888") {
      setShowModal(false)
      setShowFirebaseModal(true)
      setPassword("")
      setError("")
      
      // 自动加载Firebase数据
      await loadFirebaseData()
    } else {
      setError("密码错误")
      setTimeout(() => setError(""), 2000)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowModal(false)
      setShowFirebaseModal(false)
      setPassword("")
      setError("")
      setEditingProduct(null)
      setEditingCD(null)
    }
  }

  // 加载Firebase数据
  const loadFirebaseData = async (retryCount = 0) => {
    setLoading(true)
    try {
      console.log('🔥 开始加载Firebase数据...')
      const [productsResult, cdsData, imagesData] = await Promise.all([
        getAllProducts(),
        getAllCDs(),
        getAllImages()
      ])
      setProducts(productsResult.products || [])
      setCds(cdsData)
      setImages(imagesData)
      console.log('✅ Firebase数据加载成功')
    } catch (error) {
      console.error("❌ Firebase数据加载失败:", error)
      
      // 重试机制
      if (retryCount < 2) {
        console.log(`🔄 重试中... (${retryCount + 1}/3)`)
        setTimeout(() => loadFirebaseData(retryCount + 1), 2000)
        return
      }
      
      setError(`连接Firebase失败: ${error.message || '请检查网络连接'}`)
    } finally {
      setLoading(false)
    }
  }

  // 商品管理
  const handleCreateProduct = async () => {
    const newProduct = {
      title: "新商品",
      description: "商品描述",
      image: "/placeholder.svg",
      price: 0,
      category: "music",
      visible: false,
      order: products.length + 1
    }
    
    try {
      const productId = await createProduct(newProduct)
      const createdProduct = { id: productId, ...newProduct }
      setProducts([...products, createdProduct])
      setEditingProduct(createdProduct)
    } catch (error) {
      setError("创建商品失败")
    }
  }

  const handleUpdateProduct = async (productId, productData) => {
    try {
      await updateProduct(productId, productData)
      setProducts(products.map(p => p.id === productId ? { ...p, ...productData } : p))
      setEditingProduct(null)
    } catch (error) {
      setError("更新商品失败")
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (confirm("确定要删除这个商品吗？")) {
      try {
        await deleteProduct(productId)
        setProducts(products.filter(p => p.id !== productId))
      } catch (error) {
        setError("删除商品失败")
      }
    }
  }

  // CD管理
  const handleCreateCD = async () => {
    const newCD = {
      title: "新CD",
      image: "/placeholder.svg",
      productLink: "/products/new",
      order: cds.length + 1,
      visible: true
    }
    
    try {
      const cdId = await createCD(newCD)
      const createdCD = { id: cdId, ...newCD }
      setCds([...cds, createdCD])
      setEditingCD(createdCD)
    } catch (error) {
      setError("创建CD失败")
    }
  }

  const handleUpdateCD = async (cdId, cdData) => {
    try {
      await updateCD(cdId, cdData)
      setCds(cds.map(c => c.id === cdId ? { ...c, ...cdData } : c))
      setEditingCD(null)
    } catch (error) {
      setError("更新CD失败")
    }
  }

  const handleDeleteCD = async (cdId) => {
    if (confirm("确定要删除这个CD吗？")) {
      try {
        await deleteCD(cdId)
        setCds(cds.filter(c => c.id !== cdId))
      } catch (error) {
        setError("删除CD失败")
      }
    }
  }

  // 图片上传
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    try {
      const result = await uploadImage(file)
      setImages([...images, result])
      alert(`图片上传成功！\n地址: ${result.url}`)
    } catch (error) {
      setError("图片上传失败")
    } finally {
      setLoading(false)
    }
  }

  // 数据迁移
  const handleMigrateData = async () => {
    if (confirm("确定要从JSON文件迁移数据到Firebase吗？")) {
      setLoading(true)
      try {
        await migrateProductsFromJSON()
        await initializeCDs()
        await loadFirebaseData()
        alert("数据迁移完成！")
      } catch (error) {
        setError("数据迁移失败")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      <div className="developer-mode">
        <button onClick={() => setShowModal(true)}>
          开发者模式
        </button>
      </div>

      {/* 原有的登录模态框 */}
      {showModal && (
        <div className="modal-overlay" onKeyDown={handleKeyDown} tabIndex={-1}>
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <h3>开发者模式</h3>
              <input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {error && <div className="error">{error}</div>}
              <div className="modal-buttons">
                <button type="submit">进入后台</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false)
                    setPassword("")
                    setError("")
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Firebase管理模态框 */}
      {showFirebaseModal && (
        <div className="modal-overlay" onKeyDown={handleKeyDown} tabIndex={-1}>
          <div className="firebase-modal-content">
            <div className="firebase-header">
              <h3>内容管理后台</h3>
              <button onClick={() => setShowFirebaseModal(false)} className="close-btn">×</button>
            </div>

            {!loading && products.length === 0 && cds.length === 0 && (
              <div className="init-section">
                <p>首次使用？点击下方按钮初始化后台数据：</p>
                <button onClick={handleMigrateData} className="init-btn">初始化数据</button>
                <button onClick={loadFirebaseData} className="init-btn">加载现有数据</button>
              </div>
            )}

            <div className="firebase-tabs">
              <button 
                className={activeTab === "products" ? "tab active" : "tab"}
                onClick={() => { setActiveTab("products"); loadFirebaseData(); }}
              >
                商品管理
              </button>
              <button 
                className={activeTab === "cds" ? "tab active" : "tab"}
                onClick={() => { setActiveTab("cds"); loadFirebaseData(); }}
              >
                CD管理
              </button>
              <button 
                className={activeTab === "images" ? "tab active" : "tab"}
                onClick={() => { setActiveTab("images"); loadFirebaseData(); }}
              >
                图片管理
              </button>
            </div>

            <div className="firebase-content">
              {loading && <div className="loading">处理中...</div>}
              {error && <div className="error">{error}</div>}

              {activeTab === "products" && (
                <div className="tab-content">
                  <div className="tab-header">
                    <span>商品管理 ({products.length})</span>
                    <button onClick={handleCreateProduct} className="create-btn">+ 新增</button>
                  </div>
                  <div className="items-grid">
                    {products.map(product => (
                      <div key={product.id} className="item-card">
                        <img src={product.image} alt={product.title} className="item-thumb" />
                        <div className="item-info">
                          <h4>{product.title}</h4>
                          <p>${product.price}</p>
                          <div className="item-status">
                            {product.visible ? "✅ 显示" : "❌ 隐藏"}
                          </div>
                        </div>
                        <div className="item-actions">
                          <button onClick={() => setEditingProduct(product)}>编辑</button>
                          <button onClick={() => handleDeleteProduct(product.id)}>删除</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "cds" && (
                <div className="tab-content">
                  <div className="tab-header">
                    <span>CD管理 ({cds.length})</span>
                    <button onClick={handleCreateCD} className="create-btn">+ 新增</button>
                  </div>
                  <div className="items-grid">
                    {cds.map(cd => (
                      <div key={cd.id} className="item-card">
                        <img src={cd.image} alt={cd.title} className="item-thumb" />
                        <div className="item-info">
                          <h4>{cd.title}</h4>
                          <p>排序: {cd.order}</p>
                          <div className="item-status">
                            {cd.visible ? "✅ 显示" : "❌ 隐藏"}
                          </div>
                        </div>
                        <div className="item-actions">
                          <button onClick={() => setEditingCD(cd)}>编辑</button>
                          <button onClick={() => handleDeleteCD(cd.id)}>删除</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "images" && (
                <div className="tab-content">
                  <div className="tab-header">
                    <span>图片管理 ({images.length})</span>
                    <label className="upload-btn">
                      + 上传
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
                    </label>
                  </div>
                  <div className="items-grid">
                    {images.map((image, index) => (
                      <div key={index} className="item-card">
                        <img src={image.url} alt={image.name} className="item-thumb" />
                        <div className="item-info">
                          <p className="image-name">{image.name}</p>
                          <button 
                            onClick={() => navigator.clipboard.writeText(image.url)}
                            className="copy-btn"
                          >
                            复制链接
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 编辑商品模态框 */}
          {editingProduct && (
            <div className="edit-overlay">
              <div className="edit-content">
                <h4>编辑商品</h4>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  const productData = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    price: parseFloat(formData.get('price')),
                    category: formData.get('category'),
                    image: formData.get('image'),
                    visible: formData.get('visible') === 'on',
                    order: parseInt(formData.get('order'))
                  }
                  handleUpdateProduct(editingProduct.id, productData)
                }}>
                  <input name="title" defaultValue={editingProduct.title} placeholder="商品标题" required />
                  <textarea name="description" defaultValue={editingProduct.description} placeholder="商品描述" />
                  <input name="price" type="number" step="0.01" defaultValue={editingProduct.price} placeholder="价格" />
                  <select name="category" defaultValue={editingProduct.category}>
                    <option value="music">音乐</option>
                    <option value="merch">周边</option>
                  </select>
                  <input name="image" defaultValue={editingProduct.image} placeholder="图片URL" />
                  <input name="order" type="number" defaultValue={editingProduct.order} placeholder="排序" />
                  <label>
                    <input name="visible" type="checkbox" defaultChecked={editingProduct.visible} />
                    在商店中显示
                  </label>
                  <div className="edit-actions">
                    <button type="submit">保存</button>
                    <button type="button" onClick={() => setEditingProduct(null)}>取消</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 编辑CD模态框 */}
          {editingCD && (
            <div className="edit-overlay">
              <div className="edit-content">
                <h4>编辑CD</h4>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  const cdData = {
                    title: formData.get('title'),
                    image: formData.get('image'),
                    productLink: formData.get('productLink'),
                    order: parseInt(formData.get('order')),
                    visible: formData.get('visible') === 'on'
                  }
                  handleUpdateCD(editingCD.id, cdData)
                }}>
                  <input name="title" defaultValue={editingCD.title} placeholder="CD标题" required />
                  <input name="image" defaultValue={editingCD.image} placeholder="CD图片URL" />
                  <input name="productLink" defaultValue={editingCD.productLink} placeholder="商品链接" />
                  <input name="order" type="number" defaultValue={editingCD.order} placeholder="排序" />
                  <label>
                    <input name="visible" type="checkbox" defaultChecked={editingCD.visible} />
                    在主页中显示
                  </label>
                  <div className="edit-actions">
                    <button type="submit">保存</button>
                    <button type="button" onClick={() => setEditingCD(null)}>取消</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .developer-mode {
          position: fixed;
          bottom: 10px;
          right: 10px;
          z-index: 1000;
        }

        .developer-mode button {
          background: none;
          border: none;
          color: #666;
          font-size: 10px;
          cursor: pointer;
          padding: 5px;
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }

        .developer-mode button:hover {
          opacity: 0.8;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }

        .modal-content {
          background: #1a1a1a;
          padding: 2rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          min-width: 300px;
        }

        .modal-content h3 {
          color: white;
          margin-bottom: 1rem;
          font-family: monospace;
        }

        .modal-content input {
          width: 100%;
          padding: 0.8rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: white;
          font-family: monospace;
          margin-bottom: 1rem;
        }

        .modal-content input:focus {
          outline: none;
          border-color: red;
        }

        .error {
          color: red;
          font-size: 0.8rem;
          margin-bottom: 1rem;
          font-family: monospace;
        }

        .modal-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .modal-buttons button {
          flex: 1;
          padding: 0.8rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: monospace;
          transition: background-color 0.3s ease;
          font-size: 0.8rem;
        }

        .modal-buttons button[type="submit"] {
          background: red;
          color: white;
        }

        .modal-buttons button[type="submit"]:hover {
          background: #cc0000;
        }

        .modal-buttons button[type="button"] {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .modal-buttons button[type="button"]:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Firebase管理界面样式 */
        .firebase-modal-content {
          background: #1a1a1a;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: 90vw;
          height: 80vh;
          max-width: 1000px;
          display: flex;
          flex-direction: column;
          color: white;
          font-family: monospace;
        }

        .firebase-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .firebase-header h3 {
          margin: 0;
          color: white;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.2rem;
        }

        .init-section {
          padding: 2rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
        }

        .init-btn {
          background: red;
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          margin: 0.5rem;
          font-family: monospace;
        }

        .firebase-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          padding: 1rem;
          cursor: pointer;
          font-family: monospace;
          border-bottom: 2px solid transparent;
        }

        .tab.active {
          color: red;
          border-bottom-color: red;
        }

        .firebase-content {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .tab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .create-btn, .upload-btn {
          background: red;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: monospace;
          font-size: 0.8rem;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .item-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 0.8rem;
        }

        .item-thumb {
          width: 100%;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .item-info h4 {
          margin: 0 0 0.2rem 0;
          font-size: 0.9rem;
        }

        .item-info p {
          margin: 0.2rem 0;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .item-status {
          font-size: 0.7rem;
          margin: 0.3rem 0;
        }

        .item-actions {
          display: flex;
          gap: 0.3rem;
          margin-top: 0.5rem;
        }

        .item-actions button {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.3rem;
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.7rem;
          font-family: monospace;
        }

        .copy-btn {
          background: rgba(0, 255, 0, 0.2);
          border: 1px solid rgba(0, 255, 0, 0.3);
          color: white;
          padding: 0.3rem 0.6rem;
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.7rem;
          margin-top: 0.3rem;
        }

        .image-name {
          font-size: 0.7rem;
          word-break: break-all;
          margin-bottom: 0.3rem;
        }

        .loading {
          text-align: center;
          color: red;
          margin: 1rem 0;
        }

        /* 编辑模态框样式 */
        .edit-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .edit-content {
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 1.5rem;
          min-width: 300px;
        }

        .edit-content h4 {
          color: white;
          margin-bottom: 1rem;
        }

        .edit-content form {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .edit-content input, .edit-content textarea, .edit-content select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: white;
          padding: 0.6rem;
          font-family: monospace;
        }

        .edit-content label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-size: 0.9rem;
        }

        .edit-actions {
          display: flex;
          gap: 0.8rem;
          margin-top: 1rem;
        }

        .edit-actions button {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: monospace;
        }

        .edit-actions button[type="submit"] {
          background: red;
          color: white;
        }

        .edit-actions button[type="button"] {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
      `}</style>
    </>
  )
} 