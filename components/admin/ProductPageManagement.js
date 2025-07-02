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

export default function ProductPageManagement({ pages, publicImages, onCreate, onUpdate }) {
  const [editingPage, setEditingPage] = useState(null)

  return (
    <div style={contentStyle}>
      <div style={sectionHeaderStyle}>
        <h2>产品页面内容管理</h2>
        <button onClick={onCreate} style={createButtonStyle}>新增页面</button>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
          管理各个产品页面的详细内容，包括标题、描述、曲目列表等
        </p>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
          可用图片: {publicImages.length} 张
        </p>
      </div>
      <div style={gridStyle}>
        {pages.map(page => (
          <div key={page.id} style={cardStyle}>
            <img src={page.image} alt={page.title} style={cardImageStyle} onError={e => { e.target.src = '/placeholder.svg' }} />
            <div style={cardContentStyle}>
              <h3>{page.title}</h3>
              <p>价格: {page.price}</p>
              <p>曲目数: {page.trackList?.length || 0}</p>
              <p>页面ID: {page.id}</p>
              <div style={cardActionsStyle}>
                <button onClick={() => setEditingPage(page)} style={editButtonStyle}>编辑页面内容</button>
                <a href={`/products/${page.id}`} target="_blank" rel="noopener noreferrer" style={{ ...editButtonStyle, textDecoration: 'none', display: 'inline-block', marginLeft: '8px' }}>预览页面</a>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editingPage && (
        <ProductPageEditModal
          page={editingPage}
          onSave={(id, data) => { onUpdate(id, data); setEditingPage(null) }}
          onCancel={() => setEditingPage(null)}
          availableImages={publicImages}
        />
      )}
    </div>
  )
}

function ProductPageEditModal({ page, onSave, onCancel, availableImages }) {
  const [formData, setFormData] = useState({
    title: page.title || '',
    description: page.description || '',
    image: page.image || '',
    price: page.price || '',
    trackList: page.trackList ? page.trackList.join('\n') : '',
    catalog: page.details?.catalog || '',
    album: page.details?.album || '',
    releaseType: page.details?.releaseType || '',
    releaseDate: page.details?.releaseDate || '',
    label: page.details?.label || '',
    ar: page.details?.ar || '',
    writer: page.details?.writer || '',
    producer: page.details?.producer || '',
    mixing: page.details?.mixing || '',
    master: page.details?.master || '',
    creativeDirector: page.details?.creativeDirector || '',
    artDirector: page.details?.artDirector || ''
  })

  const handleSubmit = e => {
    e.preventDefault()
    const pageData = {
      title: formData.title,
      description: formData.description,
      image: formData.image,
      price: formData.price,
      trackList: formData.trackList.split('\n').filter(t => t.trim()),
      details: {
        catalog: formData.catalog,
        album: formData.album,
        releaseType: formData.releaseType,
        releaseDate: formData.releaseDate,
        label: formData.label,
        ar: formData.ar,
        writer: formData.writer,
        producer: formData.producer,
        mixing: formData.mixing,
        master: formData.master,
        creativeDirector: formData.creativeDirector,
        artDirector: formData.artDirector
      }
    }
    onSave(page.id, pageData)
  }

  return (
    <div style={modalOverlayStyle} onClick={onCancel}>
      <div style={{ ...modalStyle, maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
        <h2>编辑产品页面: {page.title}</h2>
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label>产品标题</label>
            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={modalInputStyle} required />
          </div>
          <div style={formGroupStyle}>
            <label>产品描述</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={modalTextareaStyle} rows="3" />
          </div>
          <div style={formGroupStyle}>
            <label>产品图片</label>
            <select value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} style={modalSelectStyle}>
              <option value="">选择图片</option>
              {availableImages.map(img => (
                <option key={img} value={img}>{img}</option>
              ))}
            </select>
            {formData.image && <img src={formData.image} alt="预览" style={previewImageStyle} />}
          </div>
          <div style={formGroupStyle}>
            <label>价格</label>
            <input type="text" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={modalInputStyle} placeholder="€23.00" />
          </div>
          <div style={formGroupStyle}>
            <label>曲目列表 (每行一个曲目)</label>
            <textarea value={formData.trackList} onChange={e => setFormData({ ...formData, trackList: e.target.value })} style={modalTextareaStyle} rows="8" placeholder="A1 · TRACK ONE\nA2 · TRACK TWO\nB1 · TRACK THREE" />
          </div>
          <h3>发布详情</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={formGroupStyle}>
              <label>目录号</label>
              <input type="text" value={formData.catalog} onChange={e => setFormData({ ...formData, catalog: e.target.value })} style={modalInputStyle} placeholder="YR0189" />
            </div>
            <div style={formGroupStyle}>
              <label>专辑名称</label>
              <input type="text" value={formData.album} onChange={e => setFormData({ ...formData, album: e.target.value })} style={modalInputStyle} />
            </div>
            <div style={formGroupStyle}>
              <label>发布类型</label>
              <input type="text" value={formData.releaseType} onChange={e => setFormData({ ...formData, releaseType: e.target.value })} style={modalInputStyle} placeholder="Album / EP" />
            </div>
            <div style={formGroupStyle}>
              <label>发布日期</label>
              <input type="text" value={formData.releaseDate} onChange={e => setFormData({ ...formData, releaseDate: e.target.value })} style={modalInputStyle} placeholder="20/09/2024" />
            </div>
            <div style={formGroupStyle}>
              <label>厂牌</label>
              <input type="text" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} style={modalInputStyle} placeholder="YEAR0001" />
            </div>
            <div style={formGroupStyle}>
              <label>A&R</label>
              <input type="text" value={formData.ar} onChange={e => setFormData({ ...formData, ar: e.target.value })} style={modalInputStyle} />
            </div>
            <div style={formGroupStyle}>
              <label>作词人</label>
              <input type="text" value={formData.writer} onChange={e => setFormData({ ...formData, writer: e.target.value })} style={modalInputStyle} />
            </div>
            <div style={formGroupStyle}>
              <label>制作人</label>
              <input type="text" value={formData.producer} onChange={e => setFormData({ ...formData, producer: e.target.value })} style={modalInputStyle} />
            </div>
            <div style={formGroupStyle}>
              <label>混音师</label>
              <input type="text" value={formData.mixing} onChange={e => setFormData({ ...formData, mixing: e.target.value })} style={modalInputStyle} />
            </div>
            <div style={formGroupStyle}>
              <label>母带工程师</label>
              <input type="text" value={formData.master} onChange={e => setFormData({ ...formData, master: e.target.value })} style={modalInputStyle} />
            </div>
            <div style={formGroupStyle}>
              <label>创意总监</label>
              <input type="text" value={formData.creativeDirector} onChange={e => setFormData({ ...formData, creativeDirector: e.target.value })} style={modalInputStyle} />
            </div>
            <div style={formGroupStyle}>
              <label>艺术总监</label>
              <input type="text" value={formData.artDirector} onChange={e => setFormData({ ...formData, artDirector: e.target.value })} style={modalInputStyle} />
            </div>
          </div>
          <div style={modalActionsStyle}>
            <button type="button" onClick={onCancel} style={cancelButtonStyle}>取消</button>
            <button type="submit" style={saveButtonStyle}>保存更改</button>
          </div>
        </form>
      </div>
    </div>
  )
}
