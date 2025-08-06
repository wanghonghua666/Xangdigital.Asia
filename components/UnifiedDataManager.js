"use client"

import { useState, useEffect } from "react"
import { productsManager, cdsManager, productPagesManager } from "../lib/firebaseService"

// 统一数据管理组件
export default function UnifiedDataManager({ 
  type, // 'products', 'cds', 'product-pages'
  title,
  fields,
  defaultData,
  availableImages = [],
  onDataChange
}) {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)
  const [error, setError] = useState("")

  // 获取对应的管理器
  const getManager = () => {
    switch (type) {
      case 'products': return productsManager
      case 'cds': return cdsManager
      case 'product-pages': return productPagesManager
      default: return productsManager
    }
  }

  const manager = getManager()

  // 加载数据
  const loadData = async () => {
    console.log(`🔄 [UnifiedDataManager] 开始加载 ${type} 数据...`)
    setIsLoading(true)
    try {
      const result = await manager.getAll()
      console.log(`✅ [UnifiedDataManager] ${type} 数据加载成功，共 ${result.length} 个`)
      setData(result)
    } catch (error) {
      console.error(`❌ [UnifiedDataManager] 加载 ${type} 失败:`, error)
      setError(`加载${title}失败: ${error.message}`)
    } finally {
      setIsLoading(false)
      console.log(`✅ [UnifiedDataManager] ${type} 数据加载完成`)
    }
  }

  // 创建新项目
  const handleCreate = async () => {
    console.log(`🆕 [UnifiedDataManager] 创建新的 ${type} 项目`)
    const newItem = { ...defaultData }
    setEditingItem(newItem)
  }

  // 保存数据
  const handleSave = async (itemData) => {
    console.log(`💾 [UnifiedDataManager] 开始保存 ${type} 数据...`)
    setIsLoading(true)
    try {
      if (editingItem.firestoreId) {
        // 更新现有项目 - 使用Firestore文档ID
        console.log(`🔄 [UnifiedDataManager] 更新现有 ${type}，ID: ${editingItem.firestoreId}`)
        await manager.update(editingItem.firestoreId, itemData)
        console.log(`✅ [UnifiedDataManager] ${type} 更新成功`)
      } else {
        // 创建新项目
        console.log(`🆕 [UnifiedDataManager] 创建新的 ${type} 项目`)
        const newId = await manager.create(itemData)
        console.log(`✅ [UnifiedDataManager] ${type} 创建成功，ID: ${newId}`)
        itemData.firestoreId = newId
      }
      
      await loadData()
      setEditingItem(null)
      if (onDataChange) onDataChange()
    } catch (error) {
      console.error(`❌ [UnifiedDataManager] 保存 ${type} 失败:`, error)
      setError(`保存${title}失败: ${error.message}`)
    } finally {
      setIsLoading(false)
      console.log(`✅ [UnifiedDataManager] ${type} 保存操作完成`)
    }
  }

  // 删除项目
  const handleDelete = async (id) => {
    if (!confirm(`确定要删除这个${title}吗？`)) return
    
    console.log(`🗑️ [UnifiedDataManager] 开始删除 ${type}，ID: ${id}`)
    setIsLoading(true)
    try {
      await manager.delete(id)
      console.log(`✅ [UnifiedDataManager] ${type} 删除成功`)
      await loadData()
      if (onDataChange) onDataChange()
    } catch (error) {
      console.error(`❌ [UnifiedDataManager] 删除 ${type} 失败:`, error)
      setError(`删除${title}失败: ${error.message}`)
    } finally {
      setIsLoading(false)
      console.log(`✅ [UnifiedDataManager] ${type} 删除操作完成`)
    }
  }

  useEffect(() => {
    loadData()
  }, [type])

  if (isLoading && data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>
  }

  return (
    <div style={contentStyle}>
      <div style={sectionHeaderStyle}>
        <h2 style={sectionTitleStyle}>{title}管理</h2>
        <button onClick={handleCreate} style={createButtonStyle}>
          新增{title}
        </button>
      </div>

      {error && <div style={errorBannerStyle}>{error}</div>}

      <div style={gridStyle}>
        {data.map(item => (
          <div key={item.firestoreId || item.id} style={cardStyle}>
            {item.image && (
              <img 
                src={item.image} 
                alt={item.title || item.name || '图片'}
                style={cardImageStyle}
                onError={(e) => {
                  e.target.src = '/placeholder.svg'
                }}
              />
            )}
            <div style={cardContentStyle}>
              <h3 style={cardTitleStyle}>{item.title || item.name || `项目 ${item.id || item.firestoreId}`}</h3>
              {item.price && <p style={cardTextStyle}>价格: {item.price}</p>}
              {item.description && <p style={cardTextStyle}>{item.description}</p>}
              <p style={cardTextStyle}>状态: {item.visible ? '显示' : '隐藏'}</p>
              <div style={cardActionsStyle}>
                <button 
                  onClick={() => setEditingItem(item)}
                  style={editButtonStyle}
                >
                  编辑
                </button>
                <button 
                  onClick={() => handleDelete(item.firestoreId || item.id)}
                  style={deleteButtonStyle}
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 编辑模态框 */}
      {editingItem && (
        <UnifiedEditModal
          item={editingItem}
          fields={fields}
          availableImages={availableImages}
          onSave={handleSave}
          onCancel={() => setEditingItem(null)}
          title={title}
        />
      )}
    </div>
  )
}

// 统一编辑模态框组件
function UnifiedEditModal({ item, fields, availableImages, onSave, onCancel, title }) {
  const [formData, setFormData] = useState({ ...item })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const renderField = (field) => {
    const { name, label, type = 'text', required = false, options = null } = field

    // 处理嵌套字段（如 details.catalog）
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((current, key) => current?.[key], obj)
    }

    const setNestedValue = (obj, path, value) => {
      const keys = path.split('.')
      const newObj = { ...obj }
      let current = newObj
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newObj
    }

    const currentValue = getNestedValue(formData, name)

    switch (type) {
      case 'textarea':
        return (
          <div key={name} style={formGroupStyle}>
            <label style={modalLabelStyle}>{label}:</label>
            <textarea
              value={currentValue || ''}
              onChange={(e) => setFormData(setNestedValue(formData, name, e.target.value))}
              style={modalTextareaStyle}
              rows={4}
              required={required}
            />
          </div>
        )

      case 'select':
        return (
          <div key={name} style={formGroupStyle}>
            <label style={modalLabelStyle}>{label}:</label>
            <select
              value={currentValue || ''}
              onChange={(e) => setFormData(setNestedValue(formData, name, e.target.value))}
              style={modalSelectStyle}
              required={required}
            >
              <option value="">选择...</option>
              {options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'image':
        return (
          <div key={name} style={formGroupStyle}>
            <label style={modalLabelStyle}>{label}:</label>
            <select
              value={currentValue || ''}
              onChange={(e) => setFormData(setNestedValue(formData, name, e.target.value))}
              style={modalSelectStyle}
            >
              <option value="">选择图片...</option>
              {availableImages.map(imageUrl => (
                <option key={imageUrl} value={imageUrl}>
                  {imageUrl}
                </option>
              ))}
            </select>
            {currentValue && (
              <img src={currentValue} alt="预览" style={previewImageStyle} />
            )}
          </div>
        )

      case 'checkbox':
        return (
          <div key={name} style={formGroupStyle}>
            <label style={modalLabelStyle}>
              <input
                type="checkbox"
                checked={currentValue || false}
                onChange={(e) => setFormData(setNestedValue(formData, name, e.target.checked))}
              />
              {label}
            </label>
          </div>
        )

      case 'number':
        return (
          <div key={name} style={formGroupStyle}>
            <label style={modalLabelStyle}>{label}:</label>
            <input
              type="number"
              value={currentValue || ''}
              onChange={(e) => setFormData(setNestedValue(formData, name, parseFloat(e.target.value) || 0))}
              style={modalInputStyle}
              required={required}
            />
          </div>
        )

      default:
        return (
          <div key={name} style={formGroupStyle}>
            <label style={modalLabelStyle}>{label}:</label>
            <input
              type="text"
              value={currentValue || ''}
              onChange={(e) => setFormData(setNestedValue(formData, name, e.target.value))}
              style={modalInputStyle}
              required={required}
            />
          </div>
        )
    }
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h2 style={modalTitleStyle}>编辑{title}</h2>
        <form onSubmit={handleSubmit}>
          {fields.map(renderField)}
          <div style={modalActionsStyle}>
            <button type="submit" style={saveButtonStyle}>保存</button>
            <button type="button" onClick={onCancel} style={cancelButtonStyle}>取消</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 样式定义 - 统一使用JetBrains Mono字体
const contentStyle = {
  padding: '2rem'
}

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem'
}

const sectionTitleStyle = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '1.5rem',
  color: 'red',
  fontWeight: 'lighter',
  letterSpacing: '1.4px',
  transform: 'scaleY(0.8)',
  margin: 0
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '1.5rem'
}

const cardStyle = {
  background: 'rgba(0, 0, 0, 0.7)',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #333',
  transition: 'transform 0.2s ease'
}

const cardImageStyle = {
  width: '100%',
  height: '180px',
  objectFit: 'cover'
}

const cardContentStyle = {
  padding: '1.5rem'
}

const cardTitleStyle = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '1.1rem',
  color: 'white',
  fontWeight: 'lighter',
  letterSpacing: '1px',
  margin: '0 0 0.5rem 0'
}

const cardTextStyle = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '0.9rem',
  color: 'rgb(156, 163, 175)',
  margin: '0.25rem 0'
}

const cardActionsStyle = {
  display: 'flex',
  gap: '0.75rem',
  marginTop: '1rem'
}

const createButtonStyle = {
  padding: '0.5rem 1rem',
  background: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '0.9rem',
  letterSpacing: '1px',
  transition: 'background-color 0.2s ease'
}

const editButtonStyle = {
  padding: '0.5rem 1rem',
  background: '#ffc107',
  color: 'black',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '0.9rem',
  letterSpacing: '1px',
  transition: 'background-color 0.2s ease'
}

const deleteButtonStyle = {
  padding: '0.5rem 1rem',
  background: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '0.9rem',
  letterSpacing: '1px',
  transition: 'background-color 0.2s ease'
}

const errorBannerStyle = {
  background: '#dc3545',
  color: 'white',
  padding: '0.75rem',
  borderRadius: '4px',
  marginBottom: '1.5rem',
  fontFamily: '"JetBrains Mono", monospace'
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
}

const modalStyle = {
  background: 'rgba(0, 0, 0, 0.9)',
  padding: '2rem',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '600px',
  maxHeight: '80vh',
  overflow: 'auto',
  border: '1px solid #333'
}

const modalTitleStyle = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '1.3rem',
  color: 'red',
  fontWeight: 'lighter',
  letterSpacing: '1.4px',
  transform: 'scaleY(0.8)',
  margin: '0 0 1.5rem 0'
}

const modalLabelStyle = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '0.9rem',
  color: 'white',
  fontWeight: 'lighter',
  letterSpacing: '1px',
  marginBottom: '0.5rem',
  display: 'block'
}

const formGroupStyle = {
  marginBottom: '1.5rem'
}

const modalInputStyle = {
  width: '100%',
  padding: '0.8rem',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '4px',
  color: 'white',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '0.9rem',
  marginTop: '0.5rem',
  boxSizing: 'border-box'
}

const modalTextareaStyle = {
  ...modalInputStyle,
  resize: 'vertical',
  minHeight: '100px'
}

const modalSelectStyle = {
  ...modalInputStyle
}

const previewImageStyle = {
  width: '100%',
  maxHeight: '150px',
  objectFit: 'cover',
  marginTop: '0.5rem',
  borderRadius: '4px'
}

const modalActionsStyle = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'flex-end',
  marginTop: '1.5rem'
}

const saveButtonStyle = {
  padding: '0.8rem 1.2rem',
  background: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '0.9rem',
  letterSpacing: '1px'
}

const cancelButtonStyle = {
  padding: '0.8rem 1.2rem',
  background: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '0.9rem',
  letterSpacing: '1px'
} 