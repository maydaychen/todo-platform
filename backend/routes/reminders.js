/**
 * 任务提醒路由
 */
const express = require('express')
const router = express.Router()
const { prisma } = require('../config/db')
const logger = require('../utils/logger')
const { authenticateToken } = require('../middleware/auth')
const axios = require('axios')

// 所有路由都需要认证
router.use(authenticateToken)

/**
 * GET /api/reminders/upcoming
 * 获取即将到期的任务
 */
router.get('/upcoming', async (req, res) => {
  try {
    const { hours = 24 } = req.query
    const now = new Date()
    const future = new Date(now.getTime() + parseInt(hours) * 60 * 60 * 1000)
    
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.id,
        status: 'PENDING',
        dueDate: {
          gte: now,
          lte: future
        },
        deletedAt: null
      },
      include: {
        category: true
      },
      orderBy: {
        dueDate: 'asc'
      }
    })
    
    res.json({
      success: true,
      data: {
        tasks,
        count: tasks.length,
        hours: parseInt(hours)
      }
    })
  } catch (error) {
    logger.error('获取即将到期任务失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/reminders/overdue
 * 获取已逾期的任务
 */
router.get('/overdue', async (req, res) => {
  try {
    const now = new Date()
    
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.id,
        status: 'PENDING',
        dueDate: {
          lt: now
        },
        deletedAt: null
      },
      include: {
        category: true
      },
      orderBy: {
        dueDate: 'asc'
      }
    })
    
    res.json({
      success: true,
      data: {
        tasks,
        count: tasks.length
      }
    })
  } catch (error) {
    logger.error('获取逾期任务失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/reminders/send
 * 发送 Telegram 提醒
 */
router.post('/send', async (req, res) => {
  try {
    const { telegramChatId, type = 'upcoming', hours = 24 } = req.body
    
    if (!telegramChatId) {
      return res.status(400).json({
        success: false,
        error: '请提供 Telegram Chat ID'
      })
    }
    
    // 获取任务
    let tasks = []
    let title = ''
    
    if (type === 'overdue') {
      const result = await router.handle({ url: '/api/reminders/overdue', user: req.user }, null, () => {})
      tasks = result.data.tasks
      title = `⚠️ 您有 ${tasks.length} 个任务已逾期！`
    } else {
      const result = await router.handle({ url: '/api/reminders/upcoming?hours=' + hours, user: req.user }, null, () => {})
      tasks = result.data.tasks
      title = `📅 未来 ${hours} 小时内有 ${tasks.length} 个任务即将到期`
    }
    
    if (tasks.length === 0) {
      return res.json({
        success: true,
        data: {
          sent: false,
          reason: '没有需要提醒的任务'
        }
      })
    }
    
    // 构建消息
    let message = `${title}\n\n`
    
    tasks.forEach((task, index) => {
      const dueDate = new Date(task.dueDate)
      const categoryIcon = task.category?.icon || '📁'
      const categoryName = task.category?.name || '未分类'
      
      message += `${index + 1}. ${task.title}\n`
      message += `   ${categoryIcon} ${categoryName}\n`
      message += `   ⏰ 截止：${dueDate.toLocaleString('zh-CN', { 
        month: 'numeric', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })}\n\n`
    })
    
    message += `\n👉 登录 TODO Platform 查看详情`
    
    // 发送 Telegram 消息
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN
    const telegramBotUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`
    
    await axios.post(telegramBotUrl, {
      chat_id: telegramChatId,
      text: message,
      parse_mode: 'Markdown'
    })
    
    logger.info(`提醒发送成功：${tasks.length} 个任务，ChatID: ${telegramChatId}`)
    
    res.json({
      success: true,
      data: {
        sent: true,
        count: tasks.length,
        type
      }
    })
  } catch (error) {
    logger.error('发送提醒失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/reminders/settings
 * 获取提醒设置
 */
router.get('/settings', async (req, res) => {
  try {
    // 从用户元数据中获取提醒设置
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    })
    
    res.json({
      success: true,
      data: {
        userId: user.id,
        reminderEnabled: true,
        telegramChatId: null, // TODO: 从用户配置读取
        reminderHours: 24,
        remindOverdue: true
      }
    })
  } catch (error) {
    logger.error('获取提醒设置失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router
