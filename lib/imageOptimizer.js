// 图片优化工具 - 节省Firebase Storage费用

/**
 * 压缩图片文件
 * @param {File} file - 原始图片文件
 * @param {number} quality - 压缩质量 (0-1)
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @returns {Promise<File>} 压缩后的图片文件
 */
export const compressImage = (file, quality = 0.7, maxWidth = 1200, maxHeight = 1200) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算新尺寸
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // 设置画布尺寸
      canvas.width = width;
      canvas.height = height;
      
      // 绘制并压缩
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });
        
        console.log(`📸 图片压缩完成: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
        resolve(compressedFile);
      }, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 检查图片是否需要压缩
 * @param {File} file 
 * @returns {boolean}
 */
export const shouldCompress = (file) => {
  const maxSize = 2 * 1024 * 1024; // 2MB
  return file.size > maxSize;
};

/**
 * 获取图片预览URL
 * @param {File} file 
 * @returns {string}
 */
export const getPreviewUrl = (file) => {
  return URL.createObjectURL(file);
};

/**
 * 清理预览URL
 * @param {string} url 
 */
export const cleanupPreviewUrl = (url) => {
  URL.revokeObjectURL(url);
};

/**
 * 估算存储费用
 * @param {number} sizeInBytes 
 * @returns {object}
 */
export const estimateStorageCost = (sizeInBytes) => {
  const sizeInGB = sizeInBytes / 1024 / 1024 / 1024;
  const monthlyStorageCost = sizeInGB * 0.026; // $0.026/GB/月
  const estimatedDownloads = 100; // 假设每月100次下载
  const downloadCost = (sizeInBytes * estimatedDownloads) / 1024 / 1024 / 1024 * 0.12;
  
  const totalCostUSD = monthlyStorageCost + downloadCost;
  const totalCostCNY = totalCostUSD * 7.2;
  
  return {
    sizeGB: sizeInGB.toFixed(4),
    storageCostUSD: monthlyStorageCost.toFixed(6),
    downloadCostUSD: downloadCost.toFixed(6),
    totalCostUSD: totalCostUSD.toFixed(6),
    totalCostCNY: totalCostCNY.toFixed(4)
  };
}; 