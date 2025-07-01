const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBOQhpL5_OtcF-FDo9V8oBmhGKMLJrKSJM",
  authDomain: "xangdigitalasia.firebaseapp.com",
  projectId: "xangdigitalasia",
  storageBucket: "xangdigitalasia.firebasestorage.app",
  messagingSenderId: "308426831313",
  appId: "1:308426831313:web:2b8e56e3cb08bfab7b9bec"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const defaultCDs = [
  {
    title: "I Love It When She Ride On Me",
    image: "/cd/album-art.png",
    productLink: "/products/iloveitwhensherideonme",
    order: 1,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "OSHAMAMBE",
          image: "/cd/album-cover.png", 
    productLink: "/products/oshamambe",
    order: 2,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Album 3",
    image: "/cd/cd-empty-1.png",
    productLink: "/products/cd3", 
    order: 3,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Digital Dreams EP",
    image: "/cd/cd-placeholder-2.png",
    productLink: "/products/cd4",
    order: 4,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Deluxe Edition",
    image: "/cd/album-art.png",
    productLink: "/products/cd5",
    order: 5,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function initializeCDs() {
  try {
    console.log('🔥 开始初始化CD数据...');
    
    // 清空现有CD数据
    const cdsSnapshot = await getDocs(collection(db, "cds"));
    for (const cdDoc of cdsSnapshot.docs) {
      await deleteDoc(doc(db, "cds", cdDoc.id));
      console.log(`🗑️ 删除旧CD: ${cdDoc.data().title}`);
    }
    
    // 添加默认CD数据
    for (const cd of defaultCDs) {
      const docRef = await addDoc(collection(db, "cds"), cd);
      console.log(`✅ 添加CD: ${cd.title} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 CD数据初始化完成！');
    console.log('现在您可以在管理页面的"CD轮播管理"中编辑这些CD的顺序、图片和链接了。');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  }
}

initializeCDs(); 