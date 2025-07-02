
// 样式定义
export const authContainerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'monospace'
}

export const authFormStyle = {
  background: 'rgba(0, 0, 0, 0.8)',
  padding: '2rem',
  borderRadius: '8px',
  minWidth: '300px',
  textAlign: 'center'
}

export const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  color: 'white',
  fontFamily: 'monospace',
  padding: '1rem'
}

export const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  padding: '1rem',
  background: 'rgba(0, 0, 0, 0.3)',
  borderRadius: '8px'
}

export const headerActionsStyle = {
  display: 'flex',
  gap: '1rem'
}

export const titleStyle = {
  color: 'red',
  fontSize: '1.5rem',
  margin: 0
}

export const tabsStyle = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem',
  borderBottom: '1px solid #333'
}

export const tabStyle = {
  padding: '0.5rem 1rem',
  background: 'transparent',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: 'none',
  color: '#888',
  cursor: 'pointer',
  fontSize: '1rem',
  fontFamily: 'monospace'
}

export const activeTabStyle = {
  ...tabStyle,
  color: 'red',
  borderBottom: '2px solid red'
}

export const contentStyle = {
  padding: '1rem'
}

export const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem'
}

export const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: '1rem'
}

export const imageGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '1rem',
  marginBottom: '2rem'
}

export const cardStyle = {
  background: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #333'
}

export const imageCardStyle = {
  background: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '8px',
  padding: '1rem',
  textAlign: 'center',
  border: '1px solid #333'
}

export const cardImageStyle = {
  width: '100%',
  height: '150px',
  objectFit: 'cover'
}

export const imageStyle = {
  width: '100%',
  height: '120px',
  objectFit: 'cover',
  borderRadius: '4px'
}

export const cardContentStyle = {
  padding: '1rem'
}

export const cardActionsStyle = {
  display: 'flex',
  gap: '0.5rem',
  marginTop: '1rem'
}

export const buttonStyle = {
  padding: '0.5rem 1rem',
  background: 'red',
  color: 'white',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'monospace'
}

export const createButtonStyle = {
  ...buttonStyle,
  background: '#28a745'
}

export const editButtonStyle = {
  ...buttonStyle,
  background: '#ffc107',
  color: 'black'
}

export const deleteButtonStyle = {
  ...buttonStyle,
  background: '#dc3545'
}

export const uploadButtonStyle = {
  ...buttonStyle,
  background: '#17a2b8',
  cursor: 'pointer'
}

export const copyButtonStyle = {
  ...buttonStyle,
  background: '#6c757d',
  fontSize: '0.8rem',
  marginTop: '0.5rem'
}

export const backButtonStyle = {
  ...buttonStyle,
  background: '#6c757d'
}

export const logoutButtonStyle = {
  ...buttonStyle,
  background: '#dc3545'
}

export const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
}

export const inputStyle = {
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #333',
  background: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  fontFamily: 'monospace'
}

export const errorStyle = {
  color: 'red',
  fontSize: '0.9rem',
  marginTop: '0.5rem'
}

export const errorBannerStyle = {
  background: '#dc3545',
  color: 'white',
  padding: '0.5rem',
  borderRadius: '4px',
  marginBottom: '1rem'
}

export const loadingBannerStyle = {
  background: '#ffc107',
  color: 'black',
  padding: '0.5rem',
  borderRadius: '4px',
  marginBottom: '1rem',
  textAlign: 'center'
}

// 模态框样式
export const modalOverlayStyle = {
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

export const modalStyle = {
  background: '#2d2d2d',
  padding: '2rem',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '500px',
  maxHeight: '80vh',
  overflow: 'auto'
}

export const formGroupStyle = {
  marginBottom: '1rem'
}

export const modalInputStyle = {
  ...inputStyle,
  width: '100%',
  marginTop: '0.5rem'
}

export const modalTextareaStyle = {
  ...modalInputStyle,
  resize: 'vertical'
}

export const modalSelectStyle = {
  ...modalInputStyle
}

export const previewImageStyle = {
  width: '100%',
  maxHeight: '150px',
  objectFit: 'cover',
  marginTop: '0.5rem',
  borderRadius: '4px'
}

export const modalActionsStyle = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'flex-end',
  marginTop: '1rem'
}

export const saveButtonStyle = {
  ...buttonStyle,
  background: '#28a745'
}

export const cancelButtonStyle = {
  ...buttonStyle,
  background: '#6c757d'
}

