import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'ant-design-vue/es'
import router from '@/router'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // 成功返回
    if (res.code === 0) {
      return res.data
    }
    
    // 错误处理
    switch (res.code) {
      case 400:
        message.error(res.message || '请求参数错误')
        break
      case 401:
        message.error(res.message || '未登录或登录已过期')
        // 清除token
        localStorage.removeItem('token')
        // 跳转登录页
        router.push('/login')
        break
      case 403:
        message.error(res.message || '没有权限')
        break
      case 500:
        message.error(res.message || '服务器错误')
        break
      default:
        message.error(res.message || '请求失败')
    }
    
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message.error('请求参数错误')
          break
        case 401:
          message.error('未登录或登录已过期')
          localStorage.removeItem('token')
          router.push('/login')
          break
        case 403:
          message.error('没有权限')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(`请求失败: ${error.message}`)
      }
    } else {
      message.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

const request = async <T = any>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await service(config)
    return response as T
  } catch (error) {
    return Promise.reject(error)
  }
}

export default request 

