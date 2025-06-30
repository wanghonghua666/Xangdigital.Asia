#!/usr/bin/env node

const { exec } = require('child_process');

console.log('🚀 部署Firebase安全规则');
console.log('====================');

// 检查Firebase CLI
exec('firebase --version', (error) => {
  if (error) {
    console.log('❌ Firebase CLI未安装');
    console.log('📝 请运行: npm install -g firebase-tools');
    console.log('📝 然后运行: firebase login');
    return;
  }
  
  console.log('✅ Firebase CLI已安装');
  
  // 部署规则
  console.log('🚀 正在部署安全规则...');
  exec('firebase deploy --only firestore:rules,storage:rules', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ 部署失败:', error.message);
      console.log('\n🔧 可能的解决方案:');
      console.log('1. 确保已登录: firebase login');
      console.log('2. 检查项目配置: firebase use --list');
      console.log('3. 手动在控制台部署: https://console.firebase.google.com');
      return;
    }
    
    console.log('✅ 安全规则部署成功！');
    console.log('\n📋 当前规则设置:');
    console.log('- Firestore: 允许所有操作（30天有效期）');
    console.log('- Storage: 允许图片上传和读取（30天有效期）');
    console.log('- 自动压缩: 超过2MB的图片会自动压缩');
    
    console.log('\n🎉 现在可以正常上传图片了！');
    console.log('💰 预估费用: 每月¥0-5元（大多数情况下免费）');
  });
}); 