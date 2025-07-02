import {
  contentStyle,
  sectionHeaderStyle,
  imageGridStyle,
  imageCardStyle,
  imageStyle,
  uploadButtonStyle,
  copyButtonStyle
} from './adminStyles'

export default function ImageManagement({ images, publicImages, onUpload }) {
  return (
    <div style={contentStyle}>
      <div style={sectionHeaderStyle}>
        <h2>图片管理</h2>
        <label style={uploadButtonStyle}>
          上传图片
          <input type="file" accept="image/*" onChange={onUpload} style={{ display: 'none' }} />
        </label>
      </div>
      <h3>Firebase存储的图片</h3>
      <div style={imageGridStyle}>
        {images.map(image => (
          <div key={image.id} style={imageCardStyle}>
            <img src={image.url} alt={image.name} style={imageStyle} />
            <p>{image.name}</p>
            <button onClick={() => navigator.clipboard.writeText(image.url)} style={copyButtonStyle}>复制链接</button>
          </div>
        ))}
      </div>
      <h3>Public文件夹中的图片</h3>
      <div style={imageGridStyle}>
        {publicImages.map(path => (
          <div key={path} style={imageCardStyle}>
            <img src={path} alt={path} style={imageStyle} />
            <p>{path}</p>
            <button onClick={() => navigator.clipboard.writeText(path)} style={copyButtonStyle}>复制路径</button>
          </div>
        ))}
      </div>
    </div>
  )
}
