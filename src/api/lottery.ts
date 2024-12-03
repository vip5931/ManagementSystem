import request from '@/utils/request'
import type { PeriodRecord, PrizeRecord } from '@/types'

// 获取期数列表
export function getPeriods() {
  return request({
    url: '/lottery/periods',
    method: 'get'
  })
}

// 创建期数
export function createPeriod(data: Partial<PeriodRecord>) {
  return request({
    url: '/lottery/periods',
    method: 'post',
    data
  })
}

// 更新期数状态
export function updatePeriodStatus(id: number, status: boolean) {
  return request({
    url: `/lottery/periods/${id}`,
    method: 'put',
    data: { status }
  })
}

// 获取奖品配置
export function getPrizes(periodId: number) {
  return request({
    url: `/lottery/prizes/${periodId}`,
    method: 'get'
  })
}

// 保存奖品配置
export function savePrizes(periodId: number, prizes: PrizeRecord[]) {
  return request({
    url: `/lottery/prizes/${periodId}`,
    method: 'post',
    data: { prizes }
  })
} 
