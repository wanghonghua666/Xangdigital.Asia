import { 
  getAllProducts, 
  getVisibleProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "../../../lib/firebaseService"

// GET - 获取产品列表
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const visibleOnly = searchParams.get('visible') === 'true'
    const pageSize = parseInt(searchParams.get('pageSize')) || null
    const lastDocId = searchParams.get('lastDoc') || null

    let result
    if (visibleOnly) {
      const products = await getVisibleProducts()
      result = { products, hasMore: false }
    } else {
      result = await getAllProducts(pageSize, lastDocId)
    }

    return Response.json(result)
  } catch (error) {
    console.error("Error fetching products:", error)
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST - 创建新产品
export async function POST(request) {
  try {
    const productData = await request.json()
    
    // 验证必需字段
    if (!productData.title) {
      return Response.json(
        { error: "Product title is required" },
        { status: 400 }
      )
    }

    const productId = await createProduct(productData)
    return Response.json({ id: productId, ...productData })
  } catch (error) {
    console.error("Error creating product:", error)
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}

// PUT - 更新产品
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')
    
    if (!productId) {
      return Response.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const productData = await request.json()
    await updateProduct(productId, productData)
    
    return Response.json({ message: "Product updated successfully" })
  } catch (error) {
    console.error("Error updating product:", error)
    return Response.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

// DELETE - 删除产品
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')
    
    if (!productId) {
      return Response.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    await deleteProduct(productId)
    return Response.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return Response.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
} 