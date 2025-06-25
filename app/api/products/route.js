import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request) {
  try {
    const { products } = await request.json()
    
    const productsPath = path.join(process.cwd(), 'public', 'products.json')
    const data = { products }
    
    fs.writeFileSync(productsPath, JSON.stringify(data, null, 2), 'utf8')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving products:', error)
    return NextResponse.json({ error: 'Failed to save products' }, { status: 500 })
  }
} 