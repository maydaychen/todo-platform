/**
 * 数据导出/导入路由
 */
const express = require('express')
const router = express.Router()
const { prisma } = require('../config/db')
const logger = require('../utils/logger')
const { authenticateToken } = require('../middleware/auth')

// 所有路由都需要认证
router.use(authenticateToken)

/**
 * GET /api/export/data
 * 导出用户所有数据
 */
router.get('/data', async (req, res) => {
  try {
    const userId = req.user.id
    
    // 导出所有任务
    const tasks = await prisma.task.findMany({
      where: { userId, deletedAt: null },
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // 导出所有分类
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    })
    
    // 导出 AI 配置
    const aiConfigs = await prisma.aiConfig.findMany({
      where: { userId }
    })
    
    // 构建导出数据
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: {
        id: userId,
        username: req.user.username,
        email: req.user.email
      },
      data: {
        tasks,
        categories,
        aiConfigs
      },
      stats: {
        totalTasks: tasks.length,
        totalCategories: categories.length,
        totalAiConfigs: aiConfigs.length
      }
    }
    
    logger.info(`数据导出成功：用户 ${req.user.username}`)
    
    res.json({
      success: true,
      data: exportData
    })
  } catch (error) {
    logger.error('数据导出失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/import/data
 * 导入数据
 */
router.post('/data', async (req, res) => {
  try {
    const userId = req.user.id
    const { data, options = {} } = req.body
    
    if (!data || !data.data) {
      return res.status(400).json({
        success: false,
        error: '无效的导入数据格式'
      })
    }
    
    const { tasks = [], categories = [], aiConfigs = [] } = data.data
    const { 
      importTasks = true, 
      importCategories = true,
      importAiConfigs = false,
      skipExisting = true 
    } = options
    
    const result = {
      tasks: { imported: 0, skipped: 0, failed: 0 },
      categories: { imported: 0, skipped: 0, failed: 0 },
      aiConfigs: { imported: 0, skipped: 0, failed: 0 }
    }
    
    // 导入分类（先导入分类，因为任务依赖分类）
    if (importCategories) {
      const categoryMap = {} // 旧 ID -> 新 ID 映射
      
      for (const category of categories) {
        try {
          // 检查是否已存在同名分类
          const existing = await prisma.category.findFirst({
            where: {
              userId,
              name: category.name,
              type: category.type
            }
          })
          
          if (existing && skipExisting) {
            categoryMap[category.id] = existing.id
            result.categories.skipped++
            continue
          }
          
          // 创建新分类
          const newCategory = await prisma.category.create({
            data: {
              userId,
              name: category.name,
              type: category.type,
              icon: category.icon,
              color: category.color,
              prompt: category.prompt
            }
          })
          
          categoryMap[category.id] = newCategory.id
          result.categories.imported++
        } catch (error) {
          logger.error(`导入分类失败：${category.name}`, error)
          result.categories.failed++
        }
      }
      
      // 将分类映射保存到临时存储，供任务导入使用
      req.categoryMap = categoryMap
    }
    
    // 导入任务
    if (importTasks) {
      for (const task of tasks) {
        try {
          // 检查是否已存在同名任务
          const existing = await prisma.task.findFirst({
            where: {
              userId,
              title: task.title,
              type: task.type
            }
          })
          
          if (existing && skipExisting) {
            result.tasks.skipped++
            continue
          }
          
          // 映射分类 ID
          let categoryId = null
          if (task.categoryId && req.categoryMap) {
            categoryId = req.categoryMap[task.categoryId] || null
          }
          
          // 创建新任务
          await prisma.task.create({
            data: {
              userId,
              title: task.title,
              description: task.description,
              type: task.type,
              status: task.status,
              priority: task.priority,
              categoryId,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              tags: task.tags,
              metadata: task.metadata
            }
          })
          
          result.tasks.imported++
        } catch (error) {
          logger.error(`导入任务失败：${task.title}`, error)
          result.tasks.failed++
        }
      }
    }
    
    // 导入 AI 配置
    if (importAiConfigs) {
      for (const config of aiConfigs) {
        try {
          // 检查是否已存在同提供商配置
          const existing = await prisma.aiConfig.findFirst({
            where: {
              userId,
              provider: config.provider
            }
          })
          
          if (existing && skipExisting) {
            result.aiConfigs.skipped++
            continue
          }
          
          // 创建新配置
          await prisma.aiConfig.create({
            data: {
              userId,
              provider: config.provider,
              apiKey: config.apiKey,
              endpoint: config.endpoint,
              model: config.model,
              enabled: config.enabled
            }
          })
          
          result.aiConfigs.imported++
        } catch (error) {
          logger.error(`导入 AI 配置失败：${config.provider}`, error)
          result.aiConfigs.failed++
        }
      }
    }
    
    logger.info(`数据导入成功：用户 ${req.user.username}`, result)
    
    res.json({
      success: true,
      data: result,
      message: '数据导入成功'
    })
  } catch (error) {
    logger.error('数据导入失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/export/stats
 * 获取导出统计
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id
    
    const [taskCount, categoryCount, aiConfigCount] = await Promise.all([
      prisma.task.count({
        where: { userId, deletedAt: null }
      }),
      prisma.category.count({
        where: { userId }
      }),
      prisma.aiConfig.count({
        where: { userId }
      })
    ])
    
    res.json({
      success: true,
      data: {
        tasks: taskCount,
        categories: categoryCount,
        aiConfigs: aiConfigCount,
        totalSize: '估算中...' // TODO: 计算实际大小
      }
    })
  } catch (error) {
    logger.error('获取导出统计失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router
