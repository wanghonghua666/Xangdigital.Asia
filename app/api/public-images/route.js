import { readdir } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const publicDir = join(process.cwd(), 'public')
    const images = []
    
    // 递归扫描文件夹
    async function scanDirectory(dir, basePath = '') {
      try {
        const items = await readdir(dir, { withFileTypes: true })
        
        for (const item of items) {
          const fullPath = join(dir, item.name)
          const relativePath = basePath ? `${basePath}/${item.name}` : item.name
          
          if (item.isDirectory()) {
            // 递归扫描子目录
            await scanDirectory(fullPath, relativePath)
          } else if (item.isFile()) {
            // 检查是否是图片文件
            const ext = item.name.toLowerCase().split('.').pop()
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
              images.push(`/${relativePath}`)
            }
          }
        }
      } catch (error) {
        console.error(`扫描目录失败: ${dir}`, error)
      }
    }
    
    // 开始扫描
    await scanDirectory(publicDir)
    
    // 按路径排序
    images.sort()
    
    console.log(`📁 [API] 扫描到 ${images.length} 张图片`)
    
    return NextResponse.json({ 
      success: true, 
      images,
      count: images.length 
    })
    
  } catch (error) {
    console.error('❌ [API] 扫描图片失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      images: [] 
    }, { status: 500 })
  }
} 