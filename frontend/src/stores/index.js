import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = '/api'

// 获取 API Key（从 localStorage 或环境变量）
const getApiKey = () => {
  return localStorage.getItem('todo_api_key') || ''
}

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'X-API-Key': getApiKey()
  }
})

// 添加请求拦截器，自动附加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('todo_token')
    const apiKey = localStorage.getItem('todo_api_key')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理 401 错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 清除本地存储
      localStorage.removeItem('todo_token')
      localStorage.removeItem('todo_api_key')
      localStorage.removeItem('todo_user')
      
      // 跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
    filter: {
      type: 'all', // all, daily, creative
      status: 'all', // all, pending, completed
      category: 'all'
    }
  }),

  getters: {
    filteredTasks: (state) => {
      let tasks = state.tasks
      
      if (state.filter.type !== 'all') {
        tasks = tasks.filter(t => t.type === state.filter.type)
      }
      
      if (state.filter.status !== 'all') {
        if (state.filter.status === 'pending') {
          tasks = tasks.filter(t => t.status !== 'completed')
        } else {
          tasks = tasks.filter(t => t.status === state.filter.status)
        }
      }
      
      return tasks
    },
    
    dailyTasks: (state) => state.tasks.filter(t => t.type === 'DAILY' || t.type === 'daily'),
    creativeTasks: (state) => state.tasks.filter(t => t.type === 'CREATIVE' || t.type === 'creative'),
    pendingTasks: (state) => state.tasks.filter(t => t.status !== 'completed'),
    completedTasks: (state) => state.tasks.filter(t => t.status === 'completed')
  },

  actions: {
    async fetchTasks(params = {}) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.get('/tasks', { params })
        this.tasks = response.data.data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching tasks:', error)
      } finally {
        this.loading = false
      }
    },

    async createTask(taskData) {
      try {
        const response = await api.post('/tasks', taskData)
        this.tasks.push(response.data.data)
        return response.data.data
      } catch (error) {
        console.error('Error creating task:', error)
        throw error
      }
    },

    async updateTask(id, taskData) {
      console.log('updateTask - 请求:', id, taskData)
      try {
        const response = await api.put(`/tasks/${id}`, taskData)
        console.log('updateTask - 响应数据:', response.data.data)
        console.log('updateTask - 响应中的 status:', response.data.data.status)
        // 直接替换整个任务对象，确保响应式更新
        const index = this.tasks.findIndex(t => t.id === id)
        if (index !== -1) {
          console.log('updateTask - 更新前 tasks[' + index + '].status:', this.tasks[index].status)
          this.tasks[index] = { ...response.data.data }
          console.log('updateTask - 更新后 tasks[' + index + '].status:', this.tasks[index].status)
        }
        return response.data.data
      } catch (error) {
        console.error('updateTask - 错误:', error)
        console.error('updateTask - 错误详情:', error.response?.data)
        throw error
      }
    },

    async deleteTask(id) {
      try {
        await api.delete(`/tasks/${id}`)
        this.tasks = this.tasks.filter(t => t.id !== id)
      } catch (error) {
        console.error('Error deleting task:', error)
        throw error
      }
    },

    async toggleTaskStatus(id) {
      const task = this.tasks.find(t => t.id === id)
      console.log('toggleTaskStatus - 找到任务:', task)
      if (task) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed'
        console.log('toggleTaskStatus - 新状态:', newStatus)
        try {
          const result = await this.updateTask(id, { status: newStatus })
          console.log('toggleTaskStatus - 更新结果:', result)
          return result
        } catch (error) {
          console.error('toggleTaskStatus - 更新失败:', error)
          throw error
        }
      }
    },

    async generateOutline(taskId, title, categoryId = null) {
      try {
        const response = await api.post('/generate/outline', { 
          taskId, 
          title,
          categoryId
        })
        return response.data.data
      } catch (error) {
        console.error('Error generating outline:', error)
        throw error
      }
    },

    async generateArticle(taskId, outline, style = 'casual', categoryId = null) {
      try {
        const response = await api.post('/generate/article', { 
          taskId, 
          outline,
          style,
          categoryId
        })
        return response.data.data
      } catch (error) {
        console.error('Error generating article:', error)
        throw error
      }
    },

    setFilter(filter) {
      this.filter = { ...this.filter, ...filter }
    }
  }
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('todo_token') || '',
    apiKey: localStorage.getItem('todo_api_key') || '',
    user: JSON.parse(localStorage.getItem('todo_user') || 'null')
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    apiKey: (state) => state.apiKey
  },

  actions: {
    async login(username, password) {
      try {
        const response = await api.post('/auth/login', { username, password })
        this.token = response.data.data.token
        this.user = response.data.data.user
        localStorage.setItem('todo_token', this.token)
        localStorage.setItem('todo_user', JSON.stringify(this.user))
        
        // 自动更新 axios 的 Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        
        // 如果没有 API Key，自动生成一个
        if (!this.apiKey) {
          try {
            await this.generateApiKey()
          } catch (error) {
            console.error('Failed to generate API key:', error)
          }
        }
        
        return response.data
      } catch (error) {
        console.error('Error logging in:', error)
        if (error.response) {
          throw new Error(error.response.data.error || '登录失败')
        }
        throw error
      }
    },

    async generateApiKey() {
      try {
        const response = await api.post('/auth/api-key')
        this.apiKey = response.data.data.apiKey
        localStorage.setItem('todo_api_key', this.apiKey)
        // 更新 axios 的 X-API-Key header
        api.defaults.headers.common['X-API-Key'] = this.apiKey
        return response.data
      } catch (error) {
        console.error('Error generating API key:', error)
        throw error
      }
    },

    async fetchUser() {
      try {
        const response = await api.get('/auth/me')
        this.user = response.data.data.user
        localStorage.setItem('todo_user', JSON.stringify(this.user))
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('todo_token')
      localStorage.removeItem('todo_user')
    }
  }
})
