const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const { prisma } = require('../config/db')
const logger = require('../utils/logger')
const { authenticateToken } = require('../middleware/auth')

// 验证 Schema
const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6)
})

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email().optional()
})

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req, res) => {
  try {
    // 验证输入
    const { username, password } = loginSchema.parse(req.body)
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username }
    })
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: '用户名或密码错误' 
      })
    }
    
    // 验证密码
    const validPassword = await bcrypt.compare(password, user.passwordHash)
    
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        error: '用户名或密码错误' 
      })
    }
    
    // 生成 JWT Token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    )
    
    logger.info(`用户登录成功：${username}`)
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      },
      message: '登录成功'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: error.errors
      })
    }
    
    logger.error('登录失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', async (req, res) => {
  try {
    // 验证输入
    const { username, password, email } = registerSchema.parse(req.body)
    
    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: '用户名已存在' 
      })
    }
    
    // 加密密码
    const passwordHash = await bcrypt.hash(password, 12)
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        email
      }
    })
    
    logger.info(`用户注册成功：${username}`)
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      },
      message: '注册成功'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: error.errors
      })
    }
    
    logger.error('注册失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

/**
 * POST /api/auth/api-key
 * 生成 API Key（需要登录）
 */
router.post('/api-key', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body
    
    // 生成 API Key
    const apiKey = `todo_sk_${Buffer.from(`${Date.now()}-${req.user.id}`).toString('base64')}`
    
    // 创建 API Key 记录
    const apiKeyRecord = await prisma.apiKey.create({
      data: {
        key: apiKey,
        name: name || 'Default API Key',
        userId: req.user.id
      }
    })
    
    logger.info(`API Key 创建成功：用户 ${req.user.username}`)
    
    res.json({
      success: true,
      data: {
        apiKey,
        id: apiKeyRecord.id,
        name: apiKeyRecord.name,
        createdAt: apiKeyRecord.createdAt
      },
      message: 'API Key 创建成功，请妥善保管'
    })
  } catch (error) {
    logger.error('创建 API Key 失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          createdAt: req.user.createdAt
        }
      }
    })
  } catch (error) {
    logger.error('获取用户信息失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

module.exports = router
