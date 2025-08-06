import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  query, 
  where,
  limit,
  startAfter,
  enableNetwork,
  disableNetwork
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll 
} from "firebase/storage";
import { db, storage } from "./firebase";

// 统一数据管理工具
class FirebaseManager {
  constructor(collectionName) {
    this.collectionName = collectionName
    this.cache = new Map()
    this.CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存
  }

  // 获取缓存
  getCached(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  // 设置缓存
  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  // 清除缓存
  clearCache() {
    this.cache.clear()
  }

  // 获取所有数据
  async getAll(options = {}) {
    const { orderByField = 'order', orderDirection = 'asc', whereField, whereValue, limitCount } = options
    const cacheKey = `${this.collectionName}_all_${JSON.stringify(options)}`
    
    console.log(`🔄 [FirebaseManager] 开始获取 ${this.collectionName} 集合数据，选项:`, options)
    
    // 尝试从缓存获取
    const cached = this.getCached(cacheKey)
    if (cached) {
      console.log(`✅ [FirebaseManager] 从缓存获取 ${this.collectionName} 数据，共 ${cached.length} 条`)
      return cached
    }

    try {
      let q = query(collection(db, this.collectionName), orderBy(orderByField, orderDirection))
      
      if (whereField && whereValue !== undefined) {
        q = query(q, where(whereField, "==", whereValue))
      }
      
      if (limitCount) {
        q = query(q, limit(limitCount))
      }
      
      console.log(`📡 [FirebaseManager] 发送Firestore查询: ${this.collectionName}`)
      const querySnapshot = await getDocs(q)
      const data = []
      querySnapshot.forEach((doc) => {
        data.push({ 
          firestoreId: doc.id,  // Firestore文档ID
          ...doc.data() 
        })
      })
      
      console.log(`✅ [FirebaseManager] 成功获取 ${this.collectionName} 数据，共 ${data.length} 条`)
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error(`❌ [FirebaseManager] 获取 ${this.collectionName} 数据失败:`, error)
      return []
    }
  }

  // 获取单个数据
  async getById(id) {
    try {
      console.log(`🔍 [FirebaseManager] 获取 ${this.collectionName} 单个数据，ID: ${id}`)
      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = { 
          firestoreId: docSnap.id,  // Firestore文档ID
          ...docSnap.data() 
        }
        console.log(`✅ [FirebaseManager] ${this.collectionName} 单个数据获取成功，ID: ${id}`)
        return data
      }
      console.log(`❌ [FirebaseManager] ${this.collectionName} 数据不存在，ID: ${id}`)
      return null
    } catch (error) {
      console.error(`❌ [FirebaseManager] 获取 ${this.collectionName} 单个数据失败，ID: ${id}`, error)
      return null
    }
  }

  // 创建数据
  async create(data) {
    try {
      console.log(`🆕 [FirebaseManager] 开始创建 ${this.collectionName} 数据:`, data)
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ [FirebaseManager] ${this.collectionName} 创建成功，ID: ${docRef.id}`)
      this.clearCache() // 清除缓存
      return docRef.id
    } catch (error) {
      console.error(`❌ [FirebaseManager] 创建 ${this.collectionName} 失败:`, error)
      throw error
    }
  }

  // 更新数据
  async update(id, data) {
    try {
      console.log(`🔄 [FirebaseManager] 开始更新 ${this.collectionName}，ID: ${id}`)
      const docRef = doc(db, this.collectionName, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      })
      console.log(`✅ [FirebaseManager] ${this.collectionName} 更新成功`)
      this.clearCache() // 清除缓存
      return true
    } catch (error) {
      console.error(`❌ [FirebaseManager] 更新 ${this.collectionName} 失败:`, error)
      throw error
    }
  }

  // 删除数据
  async delete(id) {
    try {
      console.log(`🗑️ [FirebaseManager] 开始删除 ${this.collectionName}，ID: ${id}`)
      await deleteDoc(doc(db, this.collectionName, id))
      console.log(`✅ [FirebaseManager] ${this.collectionName} 删除成功`)
      this.clearCache() // 清除缓存
      return true
    } catch (error) {
      console.error(`❌ [FirebaseManager] 删除 ${this.collectionName} 失败:`, error)
      throw error
    }
  }

  // 批量操作
  async batchCreate(dataArray) {
    const results = []
    for (const data of dataArray) {
      try {
        const id = await this.create(data)
        results.push({ success: true, id, data })
      } catch (error) {
        results.push({ success: false, error, data })
      }
    }
    return results
  }
}

// 创建管理器实例
export const productsManager = new FirebaseManager('products')
export const cdsManager = new FirebaseManager('cds')
export const productPagesManager = new FirebaseManager('productPages')

// 离线缓存
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 缓存工具函数
const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    // 使用缓存数据
    return cached.data;
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// 网络状态检测
let isOnline = true;
const checkConnection = async () => {
  try {
    await enableNetwork(db);
    isOnline = true;
  } catch (error) {
    isOnline = false;
  }
};

// 重试机制
const withRetry = async (operation, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) {
        // 最后一次重试失败，抛出错误
        throw error;
      }
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// 初始化检查
checkConnection();

// 费用估算工具
const estimateStorageCost = (sizeInBytes) => {
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

// ===== 商品管理 =====

// 获取所有商品（支持分页和缓存）
export const getAllProducts = async (pageSize = 10, lastDoc = null) => {
  return await productsManager.getAll({ limitCount: pageSize })
}

// 获取可见商品（前端商店使用）
export const getVisibleProducts = async () => {
  try {
    return await productsManager.getAll({ whereField: 'visible', whereValue: true })
  } catch (error) {
    console.error('Firebase索引错误，使用简单查询:', error)
    // 如果复合查询失败，使用简单查询然后客户端过滤
    const allProducts = await productsManager.getAll()
    return allProducts.filter(product => product.visible === true)
  }
}

// 创建新商品
export const createProduct = async (productData) => {
  return await productsManager.create(productData)
}

// 更新商品
export const updateProduct = async (productId, productData) => {
  return await productsManager.update(productId, productData)
}

// 删除商品
export const deleteProduct = async (productId) => {
  return await productsManager.delete(productId)
}

// ===== CD管理 =====

// 获取所有CD
export const getAllCDs = async () => {
  return await cdsManager.getAll()
}

// 创建新CD
export const createCD = async (cdData) => {
  return await cdsManager.create(cdData)
}

// 更新CD配置
export const updateCD = async (cdId, cdData) => {
  return await cdsManager.update(cdId, cdData)
}

// 删除CD
export const deleteCD = async (cdId) => {
  return await cdsManager.delete(cdId)
}

// ===== 图片管理 =====

// 上传图片到Firebase Storage（自动压缩省钱）
export const uploadImage = async (file, folder = "images") => {
  try {
    console.log(`📤 开始上传图片: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    // 检查文件大小，大于2MB自动压缩
    let fileToUpload = file;
    if (file.size > 2 * 1024 * 1024) {
      console.log('🗜️ 图片超过2MB，自动压缩中...');
      
      // 简单压缩：创建canvas压缩
      fileToUpload = await new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // 压缩到最大1200px宽度
          const maxWidth = 1200;
          const scale = Math.min(1, maxWidth / img.width);
          
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            console.log(`✅ 压缩完成: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            resolve(compressedFile);
          }, file.type, 0.8);
        };
        
        img.src = URL.createObjectURL(file);
      });
    }
    
    const result = await withRetry(async () => {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${fileToUpload.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        name: fileName,
        originalSize: file.size,
        compressedSize: fileToUpload.size,
        savings: file.size - fileToUpload.size
      };
    });
    
    // 估算费用
    const costEstimate = estimateStorageCost(fileToUpload.size);
    console.log(`💰 预估月费用: ¥${costEstimate.totalCostCNY}`);
    
    return result;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// 获取所有图片
export const getAllImages = async (folder = "images") => {
  try {
    const storageRef = ref(storage, folder);
    const result = await listAll(storageRef);
    
    const images = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url: url
        };
      })
    );
    
    return images;
  } catch (error) {
    console.error("Error getting images:", error);
    return [];
  }
};

// 删除图片
export const deleteImage = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

// ===== 数据迁移工具 =====

// 从现有JSON文件迁移数据到Firebase
export const migrateProductsFromJSON = async () => {
  try {
    const response = await fetch('/products.json');
    const data = await response.json();
    
    const products = data.products;
    const migratedProducts = [];
    
    for (const product of products) {
      const productId = await createProduct(product);
      migratedProducts.push({ id: productId, ...product });
    }
    
    return migratedProducts;
  } catch (error) {
    console.error("Error migrating products:", error);
    throw error;
  }
};

// 初始化CD数据（与现有CD格式匹配）
export const initializeCDs = async () => {
  try {
    const defaultCDs = [
      {
        id: "cd1",
        title: "I Love It When She Ride On Me",
        image: "/cd/album-art.png",
        productLink: "/products/iloveitwhensherideonme",
        order: 1,
        visible: true
      },
      {
        id: "cd2", 
        title: "Oshamambe",
        image: "/cd/album-cover.png",
        productLink: "/products/oshamambe",
        order: 2,
        visible: true
      },
      {
        id: "cd3",
        title: "Upcoming Release",
        image: "/cd/cd-empty-1.png", 
        productLink: "/products/cd3",
        order: 3,
        visible: true
      },
      {
        id: "cd4",
        title: "Digital Dreams EP",
        image: "/cd/cd-placeholder-2.png",
        productLink: "/products/cd4", 
        order: 4,
        visible: true
      },
      {
        id: "cd5",
        title: "Deluxe Edition", 
        image: "/cd/album-art.png",
        productLink: "/products/cd5",
        order: 5,
        visible: true
      }
    ];
    
    const createdCDs = [];
    for (const cd of defaultCDs) {
      const cdId = await createCD(cd);
      createdCDs.push({ id: cdId, ...cd });
    }
    
    return createdCDs;
  } catch (error) {
    console.error("Error initializing CDs:", error);
    throw error;
  }
};

// ===== 产品页面管理 =====

// 获取所有产品页面
export const getAllProductPages = async () => {
  return await productPagesManager.getAll()
}

// 获取单个产品页面
export const getProductPage = async (pageId) => {
  console.log(`🔍 [FirebaseService] 获取产品页面，ID: ${pageId}`)
  try {
    const result = await productPagesManager.getById(pageId)
    if (result) {
      console.log(`✅ [FirebaseService] 产品页面获取成功: ${result.title}`)
    } else {
      console.log(`❌ [FirebaseService] 产品页面不存在: ${pageId}`)
    }
    return result
  } catch (error) {
    console.error(`❌ [FirebaseService] 获取产品页面失败: ${pageId}`, error)
    throw error
  }
}

// 创建产品页面
export const createProductPage = async (pageData) => {
  return await productPagesManager.create(pageData)
}

// 更新产品页面
export const updateProductPage = async (pageId, pageData) => {
  return await productPagesManager.update(pageId, pageData)
}

// 删除产品页面
export const deleteProductPage = async (pageId) => {
  return await productPagesManager.delete(pageId)
}

// 初始化产品页面数据
export const initializeProductPages = async () => {
  try {
    const defaultPages = [
      {
        id: 'iloveitwhensherideonme',
        title: 'I LOVE IT WHEN SHE RIDE ON ME',
                      description: '140g white 12\" vinyl, printed inner sleeve.',
        image: '/cd/album-art.png',
        price: '€23.00',
        trackList: [
          'A1 · HAPPY BOY',
          'A2 · YOU', 
          'A3 · EGO DEATH',
          'A4 · I LOVE IT WHEN SHE RIDE ON ME',
          'B1 · WONDERFUL LIFE',
          'B2 · V.I.P. IS FOR EVERYONE',
          'B3 · HEAVEN JUST A BREATH AWAY'
        ],
        details: {
          catalog: 'YR0189',
          album: 'I LOVE IT WHEN SHE RIDE ON ME',
          releaseType: 'Album',
          releaseDate: '20/09/2024',
          label: 'YEAR0001',
          ar: 'Oskar Ekman',
          writer: 'Frederik Valentin',
          producer: 'Frederik Valentin',
          mixing: 'Frederik Valentin & Emil Emberg',
          master: 'Robin Schmidt (24-96 Mastering)',
          creativeDirector: 'Andre Jofré',
          artDirector: 'Victor Svedberg'
        },
        order: 1
      },
      {
        id: 'oshamambe',
        title: 'OSHAMAMBE',
        description: 'Digital EP release.',
        image: '/cd/album-cover.png',
        price: '€15.00',
        trackList: [
          'A1 · INTRO',
          'A2 · OSHAMAMBE THEME'
        ],
        details: {
          catalog: 'YR0190',
          album: 'OSHAMAMBE',
          releaseType: 'EP',
          releaseDate: '01/10/2024',
          label: 'YEAR0001'
        },
        order: 2
      }
    ];
    
    // 先清空现有数据
    const querySnapshot = await getDocs(collection(db, "productPages"));
    for (const docSnap of querySnapshot.docs) {
      await deleteDoc(doc(db, "productPages", docSnap.id));
    }
    
    // 使用指定的ID创建文档
    for (const page of defaultPages) {
      const { id, ...pageData } = page;
      await setDoc(doc(db, "productPages", id), {
        ...pageData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return defaultPages;
  } catch (error) {
    console.error("Error initializing product pages:", error);
    throw error;
  }
};

// 清除所有缓存
export const clearCache = () => {
  cache.clear();
  console.log('🧹 缓存已清除');
};

// 修复所有错误的图片路径
export const fixImagePaths = async () => {
  try {
    console.log('🔧 开始修复图片路径...')
    
    // 修复商品数据
    const productsQuery = query(collection(db, "products"));
    const productsSnapshot = await getDocs(productsQuery);
    let productsFixed = 0;
    
    for (const docSnap of productsSnapshot.docs) {
      const data = docSnap.data();
      let needsUpdate = false;
      let newImage = data.image;
      
      if (data.image) {
        // 修复缺少/cd/前缀的图片路径
        if (data.image === '/album-art.png') {
          newImage = '/cd/album-art.png';
          needsUpdate = true;
        } else if (data.image === '/album-cover.png') {
          newImage = '/cd/album-cover.png';
          needsUpdate = true;
        } else if (data.image === '/cd-placeholder-1.png') {
          newImage = '/cd/cd-placeholder-1.png';
          needsUpdate = true;
        } else if (data.image === '/cd-placeholder-2.png') {
          newImage = '/cd/cd-placeholder-2.png';
          needsUpdate = true;
        } else if (data.image === '/cd-placeholder-3.png') {
          newImage = '/cd/cd-placeholder-3.png';
          needsUpdate = true;
        } else if (data.image === '/cd-empty-1.png') {
          newImage = '/cd/cd-empty-1.png';
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        try {
          await updateDoc(docSnap.ref, { image: newImage, updatedAt: new Date() });
          console.log(`✅ 修复商品图片路径: ${data.title} (${docSnap.id}) -> ${newImage}`);
          productsFixed++;
        } catch (error) {
          console.error(`❌ 修复商品失败: ${data.title} (${docSnap.id})`, error);
        }
      }
    }
    
    // 修复CD数据
    const cdsQuery = query(collection(db, "cds"));
    const cdsSnapshot = await getDocs(cdsQuery);
    let cdsFixed = 0;
    
    for (const docSnap of cdsSnapshot.docs) {
      const data = docSnap.data();
      let needsUpdate = false;
      let newImage = data.image;
      
      if (data.image) {
        // 修复缺少/cd/前缀的图片路径
        if (data.image === '/album-art.png') {
          newImage = '/cd/album-art.png';
          needsUpdate = true;
        } else if (data.image === '/album-cover.png') {
          newImage = '/cd/album-cover.png';
          needsUpdate = true;
        } else if (data.image === '/cd-placeholder-1.png') {
          newImage = '/cd/cd-placeholder-1.png';
          needsUpdate = true;
        } else if (data.image === '/cd-placeholder-2.png') {
          newImage = '/cd/cd-placeholder-2.png';
          needsUpdate = true;
        } else if (data.image === '/cd-placeholder-3.png') {
          newImage = '/cd/cd-placeholder-3.png';
          needsUpdate = true;
        } else if (data.image === '/cd-empty-1.png') {
          newImage = '/cd/cd-empty-1.png';
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        try {
          await updateDoc(docSnap.ref, { image: newImage, updatedAt: new Date() });
          console.log(`✅ 修复CD图片路径: ${data.title} (${docSnap.id}) -> ${newImage}`);
          cdsFixed++;
        } catch (error) {
          console.error(`❌ 修复CD失败: ${data.title} (${docSnap.id})`, error);
        }
      }
    }
    
    // 修复产品页面数据
    const pagesQuery = query(collection(db, "productPages"));
    const pagesSnapshot = await getDocs(pagesQuery);
    let pagesFixed = 0;
    
    for (const docSnap of pagesSnapshot.docs) {
      const data = docSnap.data();
      let needsUpdate = false;
      let newImage = data.image;
      
      if (data.image) {
        // 修复缺少/cd/前缀的图片路径
        if (data.image === '/album-art.png') {
          newImage = '/cd/album-art.png';
          needsUpdate = true;
        } else if (data.image === '/album-cover.png') {
          newImage = '/cd/album-cover.png';
          needsUpdate = true;
        } else if (data.image === '/cd-placeholder-1.png') {
          newImage = '/cd/cd-placeholder-1.png';
          needsUpdate = true;
        } else if (data.image === '/cd-placeholder-2.png') {
          newImage = '/cd/cd-placeholder-2.png';
          needsUpdate = true;
        } else if (data.image === '/cd-placeholder-3.png') {
          newImage = '/cd/cd-placeholder-3.png';
          needsUpdate = true;
        } else if (data.image === '/cd-empty-1.png') {
          newImage = '/cd/cd-empty-1.png';
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        try {
          await updateDoc(docSnap.ref, { image: newImage, updatedAt: new Date() });
          console.log(`✅ 修复产品页面图片路径: ${data.title} (${docSnap.id}) -> ${newImage}`);
          pagesFixed++;
        } catch (error) {
          console.error(`❌ 修复产品页面失败: ${data.title} (${docSnap.id})`, error);
        }
      }
    }
    
    console.log(`🎉 图片路径修复完成！商品: ${productsFixed}, CD: ${cdsFixed}, 产品页面: ${pagesFixed}`);
    return { productsFixed, cdsFixed, pagesFixed };
  } catch (error) {
    console.error('❌ 修复图片路径失败:', error);
    throw error;
  }
};

// 清理无效数据
export const handleCleanupData = async () => {
  try {
    const invalidIds = [
      'cd-placeholder-1',
      'cd-placeholder-2', 
      'cd-placeholder-3',
      'cd-empty-1'
    ];
    
    console.log('🧹 开始清理无效数据...');
    
    for (const invalidId of invalidIds) {
      try {
        // 检查在products集合中
        const productRef = doc(db, "products", invalidId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          await deleteDoc(productRef);
          console.log(`🗑️ 删除无效产品: ${invalidId}`);
        }
        
        // 检查在cds集合中
        const cdRef = doc(db, "cds", invalidId);
        const cdSnap = await getDoc(cdRef);
        if (cdSnap.exists()) {
          await deleteDoc(cdRef);
          console.log(`🗑️ 删除无效CD: ${invalidId}`);
        }
        
        // 检查在productPages集合中
        const pageRef = doc(db, "productPages", invalidId);
        const pageSnap = await getDoc(pageRef);
        if (pageSnap.exists()) {
          await deleteDoc(pageRef);
          console.log(`🗑️ 删除无效产品页面: ${invalidId}`);
        }
      } catch (error) {
        console.log(`⚠️ 清理 ${invalidId} 时出错:`, error.message);
      }
    }
    
    console.log('✅ 数据清理完成');
    return true;
  } catch (error) {
    console.error("清理数据时出错:", error);
    throw error;
  }
}; 