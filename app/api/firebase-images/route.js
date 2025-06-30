import { 
  uploadImage, 
  getAllImages, 
  deleteImage 
} from "../../../lib/firebaseService"

// GET - 获取图片列表
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'images'

    const images = await getAllImages(folder)
    return Response.json({ images })
  } catch (error) {
    console.error("Error fetching images:", error)
    return Response.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    )
  }
}

// POST - 上传图片
export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'images'

    if (!file) {
      return Response.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return Response.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }

    const result = await uploadImage(file, folder)
    return Response.json(result)
  } catch (error) {
    console.error("Error uploading image:", error)
    return Response.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}

// DELETE - 删除图片
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get('path')
    
    if (!imagePath) {
      return Response.json(
        { error: "Image path is required" },
        { status: 400 }
      )
    }

    await deleteImage(imagePath)
    return Response.json({ message: "Image deleted successfully" })
  } catch (error) {
    console.error("Error deleting image:", error)
    return Response.json(
      { error: "Failed to delete image" },
      { status: 500 }
    )
  }
} 