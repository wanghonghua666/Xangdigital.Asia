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
    console.log('🌐 网络连接正常');
  } catch (error) {
    isOnline = false;
    console.log('📴 网络连接断开，使用离线模式');
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
  const cacheKey = `products_${pageSize}_${lastDoc?.id || 'first'}`;
  
  // 尝试从缓存获取（仅第一页）
  if (!lastDoc) {
    const cached = getCached(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  try {
    const result = await withRetry(async () => {
      let q = query(collection(db, "products"), orderBy("order", "asc"));
      
      if (pageSize) {
        q = query(q, limit(pageSize));
      }
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      
      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      return {
        products,
        lastDoc: lastVisible,
        hasMore: querySnapshot.docs.length === pageSize
      };
    });
    
    // 缓存第一页结果
    if (!lastDoc) {
      setCache(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    console.error("Error getting products:", error);
    
    // 如果网络失败，尝试返回过期的缓存
    if (!lastDoc) {
      const expiredCache = cache.get(cacheKey);
      if (expiredCache) {
        console.log('⚠️ 返回过期缓存数据');
        return expiredCache.data;
      }
    }
    
    throw error;
  }
};

// 获取可见商品（前端商店使用）
export const getVisibleProducts = async () => {
  try {
    const q = query(
      collection(db, "products"), 
      where("visible", "==", true),
      orderBy("order", "asc")
    );
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (error) {
    console.error("Error getting visible products:", error);
    // 如果Firebase失败，返回空数组，让UI处理fallback
    return [];
  }
};

// 创建新商品
export const createProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, "products"), {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// 更新商品
export const updateProduct = async (productId, productData) => {
  try {
    // 先检查文档是否存在
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // 如果文档不存在，创建新文档
      console.log(`📝 文档不存在，创建新文档: products/${productId}`);
      await setDoc(docRef, {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // 文档存在，正常更新
      await updateDoc(docRef, {
        ...productData,
        updatedAt: new Date()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// 删除商品
export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, "products", productId));
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// ===== CD管理 =====

// 获取所有CD配置（带缓存）
export const getAllCDs = async () => {
  const cacheKey = 'cds';
  
  // 尝试从缓存获取
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const cds = await withRetry(async () => {
      const q = query(collection(db, "cds"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const cds = [];
      querySnapshot.forEach((doc) => {
        cds.push({ id: doc.id, ...doc.data() });
      });
      return cds;
    });
    
    // 缓存结果
    setCache(cacheKey, cds);
    return cds;
  } catch (error) {
    console.error("Error getting CDs:", error);
    
    // 如果网络失败，尝试返回过期的缓存
    const expiredCache = cache.get(cacheKey);
    if (expiredCache) {
      console.log('⚠️ 返回过期缓存数据');
      return expiredCache.data;
    }
    
    // 如果Firebase失败，返回空数组
    return [];
  }
};

// 创建新CD
export const createCD = async (cdData) => {
  try {
    const docRef = await addDoc(collection(db, "cds"), {
      ...cdData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating CD:", error);
    throw error;
  }
};

// 更新CD配置
export const updateCD = async (cdId, cdData) => {
  try {
    const docRef = doc(db, "cds", cdId);
    await updateDoc(docRef, {
      ...cdData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error updating CD:", error);
    throw error;
  }
};

// 删除CD
export const deleteCD = async (cdId) => {
  try {
    await deleteDoc(doc(db, "cds", cdId));
    return true;
  } catch (error) {
    console.error("Error deleting CD:", error);
    throw error;
  }
};

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

// ===== 产品页面数据管理 =====

// 获取所有产品页面数据
export const getAllProductPages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "productPages"));
    const productPages = [];
    querySnapshot.forEach((doc) => {
      productPages.push({ id: doc.id, ...doc.data() });
    });
    return productPages.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error getting product pages:", error);
    return [];
  }
};

// 根据ID获取单个产品页面数据
export const getProductPage = async (pageId) => {
  try {
    const docRef = doc(db, "productPages", pageId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting product page:", error);
    return null;
  }
};

// 创建产品页面数据
export const createProductPage = async (pageData) => {
  try {
    const docRef = await addDoc(collection(db, "productPages"), {
      ...pageData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating product page:", error);
    throw error;
  }
};

// 更新产品页面数据
export const updateProductPage = async (pageId, pageData) => {
  try {
    const docRef = doc(db, "productPages", pageId);
    await updateDoc(docRef, {
      ...pageData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error updating product page:", error);
    throw error;
  }
};

// 删除产品页面数据
export const deleteProductPage = async (pageId) => {
  try {
    await deleteDoc(doc(db, "productPages", pageId));
    return true;
  } catch (error) {
    console.error("Error deleting product page:", error);
    throw error;
  }
};

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