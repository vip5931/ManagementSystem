// 奖品类型枚举
export enum PrizeType {
  Normal = 'normal',       // 普通奖品 1-8
  Guaranteed = 'guaranteed', // 保底奖品 9-12
  Exchange = 'exchange'    // 兑换奖品 13-16
}

// 后端返回的期数数据
export interface PeriodData {
  id: number
  name: string
  start_time: string
  end_time: string
  status: number
  created_at: string
  updated_at: string
}

// 前端使用的期数数据
export interface PeriodRecord {
  id: number
  name: string
  startTime: string
  endTime: string
  status: boolean
  createdAt?: string
  updatedAt?: string
  prizes?: PrizeRecord[]
}

// 奖品接口
export interface PrizeRecord {
  id: number
  prizeIndex: number  // 1-16
  prizeType: PrizeType
  imageUrl?: string
  probability: number
  quantity: number  // -1表示无限
  guaranteedCount?: number  // 保底次数
  exchangeMaterialCount?: number  // 兑换所需材料数量
}

// API响应接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 上传结果接口
export interface UploadResponse {
  code: number
  message: string
  data: {
    url: string
    path: string
    name: string
    size: number
  }
} 
