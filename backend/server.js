// 后端服务器入口文件
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')

// 导入路由
const authRoutes = require('./routes/auth')
const taskRoutes = require('./routes/tasks')
const generateRoutes = require('./routes/generate')
const statsRoutes = require('./routes/stats')

// 导入数据库
const { prisma } = require('./config/db')

// 导入日志
const logger = require('./utils/logger')

const app = express()
const PORT = process.env.PORT || 3001

// ===== 中间件 =====

// 安全头
app.use(helmet({
  contentSecurityPolicy: false, // 开发模式暂时关闭
  crossOriginEmbedderPolicy: false
}))

// CORS 配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3457',
  credentials: true
}))

// 解析 JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  })
  next()
})

// 速率限制
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 60, // 最多 60 次请求
  message: { success: false, error: '请求过于频繁，请稍后再试' }
})
app.use('/api', limiter)

// ===== 路由 =====

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'TODO Platform API is running',
    timestamp: new Date().toISOString()
  })
})

// API 路由
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/generate', generateRoutes)
app.use('/api/stats', statsRoutes)

// 404 处理
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: '接口不存在' 
  })
})

// 全局错误处理
app.use((err, req, res, next) => {
  logger.error('全局错误:', err)
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message
  })
})

// ===== 启动服务器 =====

async function startServer() {
  try {
    // 测试数据库连接
    await prisma.$connect()
    logger.info('✅ 数据库连接成功')
    
    // 启动服务器
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 服务器启动成功`)
      logger.info(`📍 端口：${PORT}`)
      logger.info(`🌐 地址：http://localhost:${PORT}`)
      logger.info(`🔗 健康检查：http://localhost:${PORT}/health`)
    })
  } catch (error) {
    logger.error('启动失败:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  logger.info('正在关闭服务器...')
  await prisma.$disconnect()
  logger.info('服务器已关闭')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('收到 SIGTERM 信号')
  await prisma.$disconnect()
  process.exit(0)
})

startServer()
