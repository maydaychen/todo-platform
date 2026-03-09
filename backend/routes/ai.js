/**
 * AI 配置相关路由
 */
const express = require('express')
const router = express.Router()
const { prisma } = require('../config/db')
const logger = require('../utils/logger')
const { authenticateToken } = require('../middleware/auth')

/**
 * GET /api/ai/configs
 * 获取当前用户的所有 AI 配置
 */
router.get('/configs', authenticateToken, async (req, res) => {
  try {
    const configs = await prisma.aiConfig.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    // 不返回敏感的 API Key
    const sanitizedConfigs = configs.map(config => ({
      ...config,
      apiKey: config.apiKey ? '***' + config.apiKey.slice(-4) : null
    }))
    
    res.json({
      success: true,
      data: sanitizedConfigs
    })
  } catch (error) {
    logger.error('获取 AI 配置失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/ai/configs/current
 * 获取当前启用的 AI 配置
 */
router.get('/configs/current', authenticateToken, async (req, res) => {
  try {
    const config = await prisma.aiConfig.findFirst({
      where: { 
        userId: req.user.id,
        enabled: true 
      }
    })
    
    if (!config) {
      return res.json({
        success: true,
        data: null
      })
    }
    
    res.json({
      success: true,
      data: {
        ...config,
        apiKey: '***' + config.apiKey.slice(-4)
      }
    })
  } catch (error) {
    logger.error('获取当前 AI 配置失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/ai/configs
 * 创建或更新 AI 配置
 */
router.post('/configs', authenticateToken, async (req, res) => {
  try {
    const { provider, apiKey, endpoint, model, enabled } = req.body
    
    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'provider 和 apiKey 是必填项'
      })
    }
    
    // 检查是否已存在该供应商配置
    const existing = await prisma.aiConfig.findFirst({
      where: {
        userId: req.user.id,
        provider
      }
    })
    
    let config
    if (existing) {
      // 更新现有配置
      config = await prisma.aiConfig.update({
        where: { id: existing.id },
        data: {
          apiKey,
          endpoint: endpoint || null,
          model: model || 'qwen3.5-plus',
          enabled: enabled || false
        }
      })
    } else {
      // 创建新配置
      config = await prisma.aiConfig.create({
        data: {
          userId: req.user.id,
          provider,
          apiKey,
          endpoint: endpoint || null,
          model: model || 'qwen3.5-plus',
          enabled: enabled || false
        }
      })
    }
    
    logger.info(`AI 配置已保存：用户 ${req.user.username}, 供应商 ${provider}`)
    
    res.json({
      success: true,
      data: {
        ...config,
        apiKey: '***' + config.apiKey.slice(-4)
      }
    })
  } catch (error) {
    logger.error('保存 AI 配置失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/ai/configs/enable
 * 启用指定供应商，同时禁用其他供应商
 */
router.post('/configs/enable', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.body
    
    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'provider 是必填项'
      })
    }
    
    // 禁用所有供应商
    await prisma.aiConfig.updateMany({
      where: {
        userId: req.user.id,
        enabled: true
      },
      data: { enabled: false }
    })
    
    // 启用指定供应商
    const config = await prisma.aiConfig.update({
      where: {
        userId_provider: {
          userId: req.user.id,
          provider
        }
      },
      data: { enabled: true }
    })
    
    logger.info(`AI 供应商已启用：用户 ${req.user.username}, 供应商 ${provider}`)
    
    res.json({
      success: true,
      data: config
    })
  } catch (error) {
    logger.error('启用 AI 供应商失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/ai/configs/:provider
 * 删除 AI 配置
 */
router.delete('/configs/:provider', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.params
    
    await prisma.aiConfig.delete({
      where: {
        userId_provider: {
          userId: req.user.id,
          provider
        }
      }
    })
    
    logger.info(`AI 配置已删除：用户 ${req.user.username}, 供应商 ${provider}`)
    
    res.json({
      success: true,
      message: '配置已删除'
    })
  } catch (error) {
    logger.error('删除 AI 配置失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/ai/stats
 * 获取 AI 使用统计
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // 总调用次数
    const totalCalls = await prisma.aiUsage.count({
      where: { userId: req.user.id }
    })
    
    // 本月调用
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyCalls = await prisma.aiUsage.count({
      where: {
        userId: req.user.id,
        createdAt: { gte: startOfMonth }
      }
    })
    
    // 生成任务数（通过 metadata 中的 ai_generated 标记）
    const generatedTasks = await prisma.task.count({
      where: {
        userId: req.user.id,
        metadata: {
          contains: 'ai_generated'
        }
      }
    })
    
    // 估算节省时间（假设每次调用节省 10 分钟）
    const timeSaved = totalCalls * 10
    
    // 各供应商统计
    const providerStats = await prisma.aiUsage.groupBy({
      by: ['provider'],
      where: { userId: req.user.id },
      _sum: {
        tokensUsed: true,
        cost: true
      },
      _count: {
        id: true
      }
    })
    
    // 本月各供应商统计
    const monthlyProviderStats = await prisma.aiUsage.groupBy({
      by: ['provider'],
      where: {
        userId: req.user.id,
        createdAt: { gte: startOfMonth }
      },
      _sum: {
        tokensUsed: true,
        cost: true
      },
      _count: {
        id: true
      }
    })
    
    // 每日使用趋势（最近 7 天）
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as calls,
        SUM(tokensUsed) as tokens,
        provider
      FROM todo_platform.ai_usage
      WHERE userId = ${req.user.id}
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(createdAt), provider
      ORDER BY date DESC
    `
    
    res.json({
      success: true,
      data: {
        totalCalls,
        monthlyCalls,
        generatedTasks,
        timeSaved,
        providerStats: providerStats.map(s => ({
          provider: s.provider,
          calls: s._count.id,
          tokensUsed: s._sum.tokensUsed || 0,
          cost: parseFloat(s._sum.cost) || 0
        })),
        monthlyProviderStats: monthlyProviderStats.map(s => ({
          provider: s.provider,
          calls: s._count.id,
          tokensUsed: s._sum.tokensUsed || 0,
          cost: parseFloat(s._sum.cost) || 0
        })),
        dailyStats
      }
    })
  } catch (error) {
    logger.error('获取 AI 统计失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/ai/usage
 * 记录 AI 使用
 */
router.post('/usage', authenticateToken, async (req, res) => {
  try {
    const { provider, action, tokensUsed, cost } = req.body
    
    const usage = await prisma.aiUsage.create({
      data: {
        userId: req.user.id,
        provider,
        action,
        tokensUsed: tokensUsed || 0,
        cost: cost || 0
      }
    })
    
    res.json({
      success: true,
      data: usage
    })
  } catch (error) {
    logger.error('记录 AI 使用失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router
