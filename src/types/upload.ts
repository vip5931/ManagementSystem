// 上传结果接口
export interface UploadResult {
  code: number
  message: string
  data: {
    url: string
    path: string
    name: string
    size: number
  }
} 
