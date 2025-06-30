#!/usr/bin/env node

console.log('💰 Firebase Storage 成本计算器');
console.log('================================');

// 免费额度
const FREE_STORAGE = 5; // GB
const FREE_DOWNLOAD = 1; // GB  
const FREE_UPLOADS = 20000; // 次
const FREE_DOWNLOADS = 50000; // 次

// 付费价格（美元）
const STORAGE_PRICE = 0.026; // $/GB/月
const DOWNLOAD_PRICE = 0.12; // $/GB
const UPLOAD_PRICE = 0.000004; // $/操作
const DOWNLOAD_OP_PRICE = 0.0000004; // $/操作

function calculateCost(storage_gb, download_gb, uploads, downloads) {
  let cost = 0;
  let breakdown = [];
  
  // 存储费用
  if (storage_gb > FREE_STORAGE) {
    const extra_storage = storage_gb - FREE_STORAGE;
    const storage_cost = extra_storage * STORAGE_PRICE;
    cost += storage_cost;
    breakdown.push(`存储: ${extra_storage}GB × $${STORAGE_PRICE} = $${storage_cost.toFixed(4)}`);
  } else {
    breakdown.push(`存储: ${storage_gb}GB (免费)`);
  }
  
  // 下载流量费用
  if (download_gb > FREE_DOWNLOAD) {
    const extra_download = download_gb - FREE_DOWNLOAD;
    const download_cost = extra_download * DOWNLOAD_PRICE;
    cost += download_cost;
    breakdown.push(`下载: ${extra_download}GB × $${DOWNLOAD_PRICE} = $${download_cost.toFixed(4)}`);
  } else {
    breakdown.push(`下载: ${download_gb}GB (免费)`);
  }
  
  // 上传操作费用
  if (uploads > FREE_UPLOADS) {
    const extra_uploads = uploads - FREE_UPLOADS;
    const upload_cost = extra_uploads * UPLOAD_PRICE;
    cost += upload_cost;
    breakdown.push(`上传操作: ${extra_uploads}次 × $${UPLOAD_PRICE} = $${upload_cost.toFixed(4)}`);
  } else {
    breakdown.push(`上传操作: ${uploads}次 (免费)`);
  }
  
  return { cost, breakdown };
}

// 常见场景估算
console.log('\n📊 常见使用场景成本估算:');
console.log('--------------------------------');

const scenarios = [
  {
    name: '个人博客 (轻度使用)',
    storage: 1,    // 1GB 图片
    download: 0.5, // 500MB 下载
    uploads: 100,  // 100次上传/月
    downloads: 1000 // 1000次查看/月
  },
  {
    name: '小型电商 (中度使用)', 
    storage: 3,    // 3GB 商品图片
    download: 2,   // 2GB 下载
    uploads: 500,  // 500次上传/月
    downloads: 5000 // 5000次查看/月
  },
  {
    name: '大型网站 (重度使用)',
    storage: 10,   // 10GB 媒体文件
    download: 15,  // 15GB 下载
    uploads: 2000, // 2000次上传/月
    downloads: 20000 // 20000次查看/月
  }
];

scenarios.forEach(scenario => {
  const result = calculateCost(scenario.storage, scenario.download, scenario.uploads, scenario.downloads);
  const rmb_cost = (result.cost * 7.2).toFixed(2); // 假设汇率1:7.2
  
  console.log(`\n🎯 ${scenario.name}:`);
  console.log(`   月费用: $${result.cost.toFixed(4)} (约 ¥${rmb_cost})`);
  console.log(`   详细:`);
  result.breakdown.forEach(item => {
    console.log(`     - ${item}`);
  });
});

console.log('\n💡 省钱小贴士:');
console.log('- 压缩图片减少存储空间');
console.log('- 使用CDN缓存减少下载次数');
console.log('- 定期清理不用的文件');
console.log('- 设置存储规则限制滥用');

console.log('\n⚠️  注意: 对于您的音乐网站来说，月费用预计在 ¥0-5 元之间'); 