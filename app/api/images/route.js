import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public')
    const files = fs.readdirSync(publicDir)
    
    // 过滤图片文件
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase()
        return imageExtensions.includes(ext)
      })
      .map(file => `/${file}`)
    
    return NextResponse.json(images)
  } catch (error) {
    console.error('Error reading images:', error)
    return NextResponse.json({ error: 'Failed to read images' }, { status: 500 })
  }
} 