import { useState } from 'react'
import {
  contentStyle,
  sectionHeaderStyle,
  gridStyle,
  cardStyle,
  cardImageStyle,
  cardContentStyle,
  cardActionsStyle,
  imageStyle,
  createButtonStyle,
  editButtonStyle,
  deleteButtonStyle,
  modalOverlayStyle,
  modalStyle,
  formGroupStyle,
  modalInputStyle,
  modalTextareaStyle,
  modalSelectStyle,
  previewImageStyle,
  modalActionsStyle,
  saveButtonStyle,
  cancelButtonStyle
} from './adminStyles'

export default function ProductManagement({ products, publicImages, onCreate, onUpdate, onDelete }) {
  const [editingProduct, setEditingProduct] = useState(null)

  return (
    <div style={contentStyle}>
      <div style={sectionHeaderStyle}>
        <h2>商品管理</h2>
        <button onClick={onCreate} style={createButtonStyle}>新增商品</button>
      </div>
      <div style={gridStyle}>
        {products.map(product => (
          <div key={product.id} style={cardStyle}>
            <img
              src={product.image}
              alt={product.title}
              style={cardImageStyle}
              onError={e => { e.target.src = '/placeholder.svg' }}
            />
            <div style={cardContentStyle}>
              <h3>{product.title}</h3>
              <p>价格: ¥{product.price}</p>
              <p>状态: {product.visible ? '显示' : '隐藏'}</p>
              <div style={cardActionsStyle}>
                <button onClick={() => setEditingProduct(product)} style={editButtonStyle}>编辑</button>
                <button onClick={() => onDelete(product.id)} style={deleteButtonStyle}>删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onSave={(id, data) => { onUpdate(id, data); setEditingProduct(null) }}
          onCancel={() => setEditingProduct(null)}
          availableImages={publicImages}
        />
      )}
    </div>
  )
}

function ProductEditModal({ product, onSave, onCancel, availableImages }) {
  const [formData, setFormData] = useState({
    title: product.title || '',
    description: product.description || '',
    detailedDescription: product.detailedDescription || '',
    productInfo: product.productInfo || '',
    image: product.image || '',
    price: product.price || 0,
    category: product.category || 'music',
    visible: product.visible || false,
    order: product.order || 1
  })

  const handleSubmit = e => {
    e.preventDefault()
    onSave(product.id, formData)
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h2>编辑商品</h2>
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label>商品名称:</label>
            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={modalInputStyle} />
          </div>
          <div style={formGroupStyle}>
            <label>简短描述:</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={modalTextareaStyle} rows={2} />
          </div>
          <div style={formGroupStyle}>
            <label>详细介绍:</label>
            <textarea value={formData.detailedDescription} onChange={e => setFormData({ ...formData, detailedDescription: e.target.value })} style={modalTextareaStyle} rows={5} />
          </div>
          <div style={formGroupStyle}>
            <label>产品信息:</label>
            <textarea value={formData.productInfo} onChange={e => setFormData({ ...formData, productInfo: e.target.value })} style={modalTextareaStyle} rows={3} />
          </div>
          <div style={formGroupStyle}>
            <label>商品图片:</label>
            <select value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} style={modalSelectStyle}>
              <option value="">选择图片...</option>
              {availableImages.map(url => (
                <option key={url} value={url}>{url}</option>
              ))}
            </select>
            {formData.image && <img src={formData.image} alt="预览" style={previewImageStyle} />}
          </div>
          <div style={formGroupStyle}>
            <label>价格:</label>
            <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} style={modalInputStyle} />
          </div>
          <div style={formGroupStyle}>
            <label>
              <input type="checkbox" checked={formData.visible} onChange={e => setFormData({ ...formData, visible: e.target.checked })} />
              在商店中显示
            </label>
          </div>
          <div style={modalActionsStyle}>
            <button type="submit" style={saveButtonStyle}>保存</button>
            <button type="button" onClick={onCancel} style={cancelButtonStyle}>取消</button>
          </div>
        </form>
      </div>
    </div>
  )
}
