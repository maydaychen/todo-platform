const jwt = require('jsonwebtoken')
const { prisma } = require('../config/db')
const logger = require('../utils/logger')

// JWT 验证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: '未提供认证令牌' 
      })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: '用户不存在' 
      })
    }
    
    req.user = user
    next()
  } catch (error) {
    logger.error('JWT 验证失败:', error.message)
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: '认证令牌已过期' 
      })
    }
    
    return res.status(403).json({ 
      success: false, 
      error: '无效的认证令牌' 
    })
  }
}

// API Key 验证中间件
const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key']
    
    if (!apiKey) {
      return res.status(401).json({ 
        success: false, 
        error: '未提供 API Key' 
      })
    }
    
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    })
    
    if (!apiKeyRecord) {
      return res.status(401).json({ 
        success: false, 
        error: '无效的 API Key' 
      })
    }
    
    if (apiKeyRecord.revoked) {
      return res.status(401).json({ 
        success: false, 
        error: 'API Key 已撤销' 
      })
    }
    
    if (apiKeyRecord.expiresAt && new Date(apiKeyRecord.expiresAt) < new Date()) {
      return res.status(401).json({ 
        success: false, 
        error: 'API Key 已过期' 
      })
    }
    
    // 更新最后使用时间
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() }
    })
    
    req.user = apiKeyRecord.user
    req.apiKey = apiKeyRecord
    next()
  } catch (error) {
    logger.error('API Key 验证失败:', error.message)
    return res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
}

// 可选认证（JWT 或 API Key 都可以）
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const apiKey = req.headers['x-api-key']
  
  if (authHeader) {
    return authenticateToken(req, res, next)
  } else if (apiKey) {
    return validateApiKey(req, res, next)
  }
  
  // 无需认证
  next()
}

module.exports = {
  authenticateToken,
  validateApiKey,
  optionalAuth
}
