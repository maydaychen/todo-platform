const express = require('express')
const router = express.Router()
const { prisma } = require('../config/db')
const logger = require('../utils/logger')
const { authenticateToken } = require('../middleware/auth')

// 所有统计路由都需要认证
router.use(authenticateToken)

/**
 * GET /api/stats/summary
 * 获取统计摘要
 */
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.id
    
    // 并行查询所有统计数据
    const [
      totalTasks,
      pendingTasks,
      completedTasks,
      dailyTasks,
      creativeTasks,
      tasksDueToday,
      tasksOverdue
    ] = await Promise.all([
      prisma.task.count({
        where: { userId, deletedAt: null }
      }),
      prisma.task.count({
        where: { userId, status: 'pending', deletedAt: null }
      }),
      prisma.task.count({
        where: { userId, status: 'completed', deletedAt: null }
      }),
      prisma.task.count({
        where: { userId, type: 'daily', deletedAt: null }
      }),
      prisma.task.count({
        where: { userId, type: 'creative', deletedAt: null }
      }),
      prisma.task.count({
        where: { 
          userId, 
          status: 'pending',
          dueDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          },
          deletedAt: null
        }
      }),
      prisma.task.count({
        where: { 
          userId, 
          status: 'pending',
          dueDate: { lt: new Date() },
          deletedAt: null
        }
      })
    ])
    
    res.json({
      success: true,
      data: {
        total: totalTasks,
        byStatus: {
          pending: pendingTasks,
          completed: completedTasks
        },
        byType: {
          daily: dailyTasks,
          creative: creativeTasks
        },
        dueToday: tasksDueToday,
        overdue: tasksOverdue,
        completionRate: totalTasks > 0 
          ? Math.round((completedTasks / totalTasks) * 100) 
          : 0
      }
    })
  } catch (error) {
    logger.error('获取统计数据失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

/**
 * GET /api/stats/weekly
 * 获取周统计数据
 */
router.get('/weekly', async (req, res) => {
  try {
    const userId = req.user.id
    
    // 计算本周起止时间
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    // 查询本周数据
    const [
      weekTotal,
      weekCompleted,
      dailyStats,
      creativeStats
    ] = await Promise.all([
      prisma.task.count({
        where: {
          userId,
          createdAt: { gte: startOfWeek, lte: endOfWeek },
          deletedAt: null
        }
      }),
      prisma.task.count({
        where: {
          userId,
          status: 'completed',
          completedAt: { gte: startOfWeek, lte: endOfWeek },
          deletedAt: null
        }
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: {
          userId,
          type: 'daily',
          createdAt: { gte: startOfWeek, lte: endOfWeek },
          deletedAt: null
        },
        _count: true
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: {
          userId,
          type: 'creative',
          createdAt: { gte: startOfWeek, lte: endOfWeek },
          deletedAt: null
        },
        _count: true
      })
    ])
    
    res.json({
      success: true,
      data: {
        period: {
          start: startOfWeek.toISOString(),
          end: endOfWeek.toISOString()
        },
        total: weekTotal,
        completed: weekCompleted,
        daily: dailyStats,
        creative: creativeStats,
        completionRate: weekTotal > 0 
          ? Math.round((weekCompleted / weekTotal) * 100) 
          : 0
      }
    })
  } catch (error) {
    logger.error('获取周统计数据失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

/**
 * GET /api/stats/monthly
 * 获取月统计数据
 */
router.get('/monthly', async (req, res) => {
  try {
    const userId = req.user.id
    
    // 计算本月起止时间
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    
    // 查询本月数据
    const [
      monthTotal,
      monthCompleted
    ] = await Promise.all([
      prisma.task.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          deletedAt: null
        }
      }),
      prisma.task.count({
        where: {
          userId,
          status: 'completed',
          completedAt: { gte: startOfMonth, lte: endOfMonth },
          deletedAt: null
        }
      })
    ])
    
    res.json({
      success: true,
      data: {
        period: {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString()
        },
        total: monthTotal,
        completed: monthCompleted,
        completionRate: monthTotal > 0 
          ? Math.round((monthCompleted / monthTotal) * 100) 
          : 0
      }
    })
  } catch (error) {
    logger.error('获取月统计数据失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

module.exports = router
