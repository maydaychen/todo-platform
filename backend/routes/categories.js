/**
 * 分类管理路由
 */
const express = require('express')
const router = express.Router()
const { prisma } = require('../config/db')
const logger = require('../utils/logger')
const { authenticateToken } = require('../middleware/auth')

// 所有路由都需要认证
router.use(authenticateToken)

/**
 * GET /api/categories
 * 获取所有分类
 */
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        name: true,
        type: true,
        icon: true,
        color: true,
        prompt: true,
        createdAt: true,
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    logger.error('获取分类失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/categories
 * 创建分类
 */
router.post('/', async (req, res) => {
  try {
    const { name, type, icon, color, prompt } = req.body
    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: '分类名称和类型是必填项'
      })
    }
    
    // 检查是否已存在同名分类
    const existing = await prisma.category.findFirst({
      where: {
        userId: req.user.id,
        name,
        type
      }
    })
    
    if (existing) {
      return res.status(400).json({
        success: false,
        error: '该分类已存在'
      })
    }
    
    const category = await prisma.category.create({
      data: {
        userId: req.user.id,
        name,
        type,
        icon: icon || '📁',
        color: color || '#4facfe',
        prompt: prompt || null
      }
    })
    
    logger.info(`分类创建成功：${name} (用户：${req.user.username})`)
    
    res.status(201).json({
      success: true,
      data: category,
      message: '分类创建成功'
    })
  } catch (error) {
    logger.error('创建分类失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/categories/:id
 * 更新分类
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, type, icon, color, prompt } = req.body
    
    // 检查分类是否存在且属于当前用户
    const existing = await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    })
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: '分类不存在'
      })
    }
    
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : existing.name,
        type: type || existing.type,
        icon: icon !== undefined ? icon : existing.icon,
        color: color !== undefined ? color : existing.color,
        prompt: prompt !== undefined ? prompt : existing.prompt
      }
    })
    
    logger.info(`分类更新成功：${category.name} (用户：${req.user.username})`)
    
    res.json({
      success: true,
      data: category,
      message: '分类更新成功'
    })
  } catch (error) {
    logger.error('更新分类失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/categories/:id
 * 删除分类
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // 检查分类是否存在且属于当前用户
    const existing = await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    })
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: '分类不存在'
      })
    }
    
    // 删除分类（任务会保留，但 categoryId 会设为 null）
    await prisma.category.delete({
      where: { id: parseInt(id) }
    })
    
    logger.info(`分类删除成功：${existing.name} (用户：${req.user.username})`)
    
    res.json({
      success: true,
      message: '分类删除成功'
    })
  } catch (error) {
    logger.error('删除分类失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router
