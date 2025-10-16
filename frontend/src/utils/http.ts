// 基于 axios 的 Http 静态类封装
// 中文注释：统一管理请求实例、拦截器与常用方法，后续直接使用 Http.post 等方式发起请求

import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios'

// 中文注释：创建 axios 实例（可根据环境变量设置基础地址）
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api', // 默认走 /api 前缀，按需在开发服务器做代理
  timeout: 15000,
  withCredentials: false,
})

// 中文注释：请求拦截器 —— 统一注入鉴权信息、公共头等
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 示例：从本地存储读取 token 注入到请求头
    const token = localStorage.getItem('token')
    // 统一设置请求头（兼容 AxiosHeaders 与普通对象两种情况）
    const setHeader = (k: string, v: string) => {
      const h: any = config.headers
      if (h?.set && typeof h.set === 'function') h.set(k, v)
      else config.headers = { ...(config.headers as any), [k]: v } as any
    }
    if (token) setHeader('Authorization', `Bearer ${token}`)
    setHeader('X-Requested-With', 'XMLHttpRequest')
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 中文注释：响应拦截器 —— 统一处理业务错误码、网络错误等
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 约定后端返回格式：{ code, data, message }
    // 这里演示直接返回 data，具体逻辑按你的后端接口约定调整
    return response.data
  },
  (error) => {
    // 可在此根据 error.response?.status 做统一处理（如 401/403/500）
    // 例如：token 失效 -> 跳转登录 / 清空本地状态
    return Promise.reject(error)
  },
)

export class Http {
  // 中文注释：GET 请求
  static get<T = any>(url: string, config?: AxiosRequestConfig) {
    return service.get<T>(url, config)
  }

  // 中文注释：POST 请求
  static post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return service.post<T>(url, data, config)
  }

  // 中文注释：PUT 请求
  static put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return service.put<T>(url, data, config)
  }

  // 中文注释：DELETE 请求
  static delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return service.delete<T>(url, config)
  }
}

export default Http
