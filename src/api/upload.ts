import request from '@/utils/request'

interface UploadResult {
  filename: string
  path: string
  size: number
  mimetype: string
}

/**
 * 上传单个文件
 * @param file 文件对象
 * @param type 文件类型，默认 'all'，可选值：'image'、'all'
 */
export const uploadFile = (file: File, type: 'image' | 'all' = 'all') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  return request<UploadResult>({
    url: '/upload/file',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
} 
