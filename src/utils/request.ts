import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import type { ResponseData } from '@/types/api'
import { message } from 'ant-design-vue/es'

const service = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 15000,
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    message.error('请求发送失败')
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ResponseData>) => {
    const { data } = response
    if (data.code !== 200) {
      message.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return data.data
  },
  (error) => {
    const { response } = error
    let msg = '请求失败'
    if (response && response.data) {
      msg = response.data.message
    }
    message.error(msg)
    return Promise.reject(error)
  }
)

export default service 
