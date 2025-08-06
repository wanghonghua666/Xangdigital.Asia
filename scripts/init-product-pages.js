const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDocs, collection, deleteDoc } = require('firebase/firestore');

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

const defaultProductPages = [
  {
    id: 'iloveitwhensherideonme',
    title: 'I LOVE IT WHEN SHE RIDE ON ME',
    description: '140g white 12\" vinyl, printed inner sleeve.',
    image: '/cd/album-art.png',
    price: '€23.00',
    visible: true,
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
    visible: true,
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

async function initializeProductPages() {
  try {
    console.log('🔥 开始初始化产品页面数据...');
    
    // 清空现有产品页面数据
    const pagesSnapshot = await getDocs(collection(db, "productPages"));
    for (const pageDoc of pagesSnapshot.docs) {
      await deleteDoc(doc(db, "productPages", pageDoc.id));
      console.log(`🗑️ 删除旧页面: ${pageDoc.data().title}`);
    }
    
    // 添加默认产品页面数据
    for (const page of defaultProductPages) {
      const { id, ...pageData } = page;
      await setDoc(doc(db, "productPages", id), {
        ...pageData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ 添加产品页面: ${page.title} (ID: ${id})`);
    }
    
    console.log('🎉 产品页面数据初始化完成！');
    console.log('现在您可以在管理页面的"产品页面管理"中编辑这些页面的详细内容了。');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  }
}

initializeProductPages(); 