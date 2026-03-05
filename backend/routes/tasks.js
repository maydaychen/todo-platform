const express = require('express')
const router = express.Router()
const { z } = require('zod')
const { prisma } = require('../config/db')
const logger = require('../utils/logger')
const { authenticateToken } = require('../middleware/auth')

// 所有任务路由都需要认证
router.use(authenticateToken)

// 验证 Schema
const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['daily', 'creative']),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  categoryId: z.number().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional() // 创作任务专用
})

const updateTaskSchema = createTaskSchema.partial()

/**
 * GET /api/tasks
 * 获取任务列表
 */
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      status, 
      category, 
      priority,
      search,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query
    
    // 构建查询条件
    const where = {
      userId: req.user.id,
      deletedAt: null // 只显示未删除的
    }
    
    if (type && type !== 'all') {
      where.type = type
    }
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority
    }
    
    if (category && category !== 'all') {
      where.categoryId = parseInt(category)
    }
    
    if (search) {
      where.title = { contains: search }
    }
    
    // 分页
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum
    
    // 排序
    const orderBy = { [sortBy]: sortOrder }
    
    // 查询任务
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: true
        }
      }),
      prisma.task.count({ where })
    ])
    
    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    logger.error('获取任务列表失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

/**
 * GET /api/tasks/:id
 * 获取单个任务
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const task = await prisma.task.findFirst({
      where: { 
        id: parseInt(id),
        userId: req.user.id,
        deletedAt: null
      },
      include: {
        category: true
      }
    })
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: '任务不存在' 
      })
    }
    
    res.json({
      success: true,
      data: task
    })
  } catch (error) {
    logger.error('获取任务失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

/**
 * POST /api/tasks
 * 创建任务
 */
router.post('/', async (req, res) => {
  try {
    const data = createTaskSchema.parse(req.body)
    
    const task = await prisma.task.create({
      data: {
        ...data,
        userId: req.user.id,
        status: 'pending',
        tags: data.tags ? JSON.stringify(data.tags) : null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      },
      include: {
        category: true
      }
    })
    
    logger.info(`任务创建成功：${task.title} (用户：${req.user.username})`)
    
    res.status(201).json({
      success: true,
      data: task,
      message: '任务创建成功'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: error.errors
      })
    }
    
    logger.error('创建任务失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

/**
 * PUT /api/tasks/:id
 * 更新任务
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = updateTaskSchema.parse(req.body)
    
    // 检查任务是否存在且属于当前用户
    const existingTask = await prisma.task.findFirst({
      where: { 
        id: parseInt(id),
        userId: req.user.id,
        deletedAt: null
      }
    })
    
    if (!existingTask) {
      return res.status(404).json({ 
        success: false, 
        error: '任务不存在' 
      })
    }
    
    // 更新任务
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        completedAt: data.status === 'completed' && existingTask.status !== 'completed' 
          ? new Date() 
          : undefined
      },
      include: {
        category: true
      }
    })
    
    logger.info(`任务更新成功：${task.title}`)
    
    res.json({
      success: true,
      data: task,
      message: '任务更新成功'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: '输入验证失败',
        details: error.errors
      })
    }
    
    logger.error('更新任务失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

/**
 * DELETE /api/tasks/:id
 * 删除任务（软删除）
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // 检查任务是否存在且属于当前用户
    const existingTask = await prisma.task.findFirst({
      where: { 
        id: parseInt(id),
        userId: req.user.id,
        deletedAt: null
      }
    })
    
    if (!existingTask) {
      return res.status(404).json({ 
        success: false, 
        error: '任务不存在' 
      })
    }
    
    // 软删除
    await prisma.task.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    })
    
    logger.info(`任务删除成功：ID ${id}`)
    
    res.json({
      success: true,
      message: '任务删除成功'
    })
  } catch (error) {
    logger.error('删除任务失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

/**
 * POST /api/tasks/batch
 * 批量操作
 */
router.post('/batch', async (req, res) => {
  try {
    const { action, ids } = req.body
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供有效的任务 ID 列表' 
      })
    }
    
    const taskIds = ids.map(id => parseInt(id))
    
    switch (action) {
      case 'complete':
        await prisma.task.updateMany({
          where: {
            id: { in: taskIds },
            userId: req.user.id
          },
          data: { 
            status: 'completed',
            completedAt: new Date()
          }
        })
        break
        
      case 'delete':
        await prisma.task.updateMany({
          where: {
            id: { in: taskIds },
            userId: req.user.id
          },
          data: { deletedAt: new Date() }
        })
        break
        
      default:
        return res.status(400).json({ 
          success: false, 
          error: '不支持的操作类型' 
        })
    }
    
    logger.info(`批量操作成功：${action}, 数量：${ids.length}`)
    
    res.json({
      success: true,
      message: `批量${action === 'complete' ? '完成' : '删除'}成功`,
      count: ids.length
    })
  } catch (error) {
    logger.error('批量操作失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

module.exports = router
