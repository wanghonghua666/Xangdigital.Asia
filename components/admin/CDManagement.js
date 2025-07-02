import { useState } from 'react'
import {
  contentStyle,
  sectionHeaderStyle,
  gridStyle,
  cardStyle,
  cardImageStyle,
  cardContentStyle,
  cardActionsStyle,
  createButtonStyle,
  editButtonStyle,
  deleteButtonStyle,
  modalOverlayStyle,
  modalStyle,
  formGroupStyle,
  modalInputStyle,
  modalSelectStyle,
  previewImageStyle,
  modalActionsStyle,
  saveButtonStyle,
  cancelButtonStyle
} from './adminStyles'

export default function CDManagement({ cds, publicImages, onCreate, onUpdate, onDelete }) {
  const [editingCD, setEditingCD] = useState(null)

  return (
    <div style={contentStyle}>
      <div style={sectionHeaderStyle}>
        <h2>CD轮播管理</h2>
        <button onClick={onCreate} style={createButtonStyle}>新增CD</button>
      </div>
      <div style={gridStyle}>
        {cds.map(cd => (
          <div key={cd.id} style={cardStyle}>
            <img src={cd.image} alt={cd.title} style={cardImageStyle} onError={e => { e.target.src = '/placeholder.svg' }} />
            <div style={cardContentStyle}>
              <h3>{cd.title}</h3>
              <p>链接: {cd.productLink}</p>
              <p>状态: {cd.visible ? '显示' : '隐藏'}</p>
              <div style={cardActionsStyle}>
                <button onClick={() => setEditingCD(cd)} style={editButtonStyle}>编辑</button>
                <button onClick={() => onDelete(cd.id)} style={deleteButtonStyle}>删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editingCD && (
        <CDEditModal
          cd={editingCD}
          onSave={(id, data) => { onUpdate(id, data); setEditingCD(null) }}
          onCancel={() => setEditingCD(null)}
          availableImages={publicImages}
        />
      )}
    </div>
  )
}

function CDEditModal({ cd, onSave, onCancel, availableImages }) {
  const [formData, setFormData] = useState({
    title: cd.title || '',
    image: cd.image || '',
    productLink: cd.productLink || '',
    visible: cd.visible !== false,
    order: cd.order || 1
  })

  const handleSubmit = e => {
    e.preventDefault()
    onSave(cd.id, formData)
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h2>编辑CD</h2>
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label>CD标题:</label>
            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={modalInputStyle} />
          </div>
          <div style={formGroupStyle}>
            <label>CD图片:</label>
            <select value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} style={modalSelectStyle}>
              <option value="">选择图片...</option>
              {availableImages.map(url => (
                <option key={url} value={url}>{url}</option>
              ))}
            </select>
            {formData.image && <img src={formData.image} alt="预览" style={previewImageStyle} />}
          </div>
          <div style={formGroupStyle}>
            <label>产品链接:</label>
            <input type="text" value={formData.productLink} onChange={e => setFormData({ ...formData, productLink: e.target.value })} style={modalInputStyle} placeholder="/products/album-name" />
          </div>
          <div style={formGroupStyle}>
            <label>
              <input type="checkbox" checked={formData.visible} onChange={e => setFormData({ ...formData, visible: e.target.checked })} />
              在轮播中显示
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
