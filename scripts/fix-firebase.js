#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

console.log('🔥 Firebase快速修复工具');
console.log('====================');

// 检查Firebase CLI是否安装
exec('firebase --version', (error) => {
  if (error) {
    console.log('❌ Firebase CLI未安装');
    console.log('📝 请运行: npm install -g firebase-tools');
    return;
  }
  
  console.log('✅ Firebase CLI已安装');
  
  // 检查是否已登录
  exec('firebase projects:list', (error) => {
    if (error) {
      console.log('❌ 未登录Firebase');
      console.log('📝 请运行: firebase login');
      return;
    }
    
    console.log('✅ Firebase已登录');
    
    // 部署安全规则
    console.log('🚀 部署Firebase安全规则...');
    exec('firebase deploy --only firestore:rules,storage:rules', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ 部署失败:', error.message);
        console.log('📝 请确保项目ID正确');
        return;
      }
      
      console.log('✅ 安全规则部署成功！');
      console.log('🎉 现在可以正常使用管理后台了');
      
      // 提供后续步骤
      console.log('\n📋 后续步骤:');
      console.log('1. 打开网站');
      console.log('2. 点击开发者模式');
      console.log('3. 输入密码: 88888888');
      console.log('4. 进入后台管理');
    });
  });
}); 