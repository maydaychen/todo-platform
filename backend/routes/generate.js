const express = require('express')
const router = express.Router()
const { z } = require('zod')
const { prisma } = require('../config/db')
const logger = require('../utils/logger')
const { authenticateToken } = require('../middleware/auth')
const { generateWithQwen } = require('../services/aiService')

// 所有生成路由都需要认证
router.use(authenticateToken)

/**
 * POST /api/generate/outline
 * AI 生成大纲
 */
router.post('/outline', async (req, res) => {
  try {
    const { taskId, title, category } = req.body
    
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供标题' 
      })
    }
    
    // 构建 Prompt
    const prompt = `请为以下主题生成一个文章大纲：
    
主题：${title}
${category ? `分类：${category}` : ''}

要求：
1. 生成 3-6 个主要章节
2. 每个章节用简短的标题概括
3. 适合${category === '技术博客' ? '技术读者' : '普通读者'}阅读
4. 只返回大纲章节标题，用 JSON 数组格式，例如：["引言", "第一章", "第二章", "总结"]`

    // 调用 AI
    const result = await generateWithQwen(prompt, {
      temperature: 0.7,
      maxTokens: 500
    })
    
    // 尝试解析 JSON
    let outline = []
    try {
      // 提取 JSON 部分
      const jsonMatch = result.match(/\[.*\]/s)
      if (jsonMatch) {
        outline = JSON.parse(jsonMatch[0])
      } else {
        // 如果不是 JSON 格式，按行分割
        outline = result.split('\n').filter(line => line.trim()).slice(0, 6)
      }
    } catch (e) {
      outline = ['引言', '正文', '总结']
    }
    
    // 如果提供了 taskId，更新任务
    if (taskId) {
      await prisma.task.update({
        where: { id: parseInt(taskId) },
        data: {
          metadata: JSON.stringify({ outline })
        }
      })
    }
    
    logger.info(`大纲生成成功：${title}`)
    
    res.json({
      success: true,
      data: {
        outline,
        fullText: result
      },
      message: '大纲生成成功'
    })
  } catch (error) {
    logger.error('生成大纲失败:', error)
    res.status(500).json({ 
      success: false, 
      error: 'AI 生成失败：' + error.message 
    })
  }
})

/**
 * POST /api/generate/article
 * AI 生成全文
 */
router.post('/article', async (req, res) => {
  try {
    const { taskId, outline, style = 'casual', wordCount = 2000 } = req.body
    
    if (!outline || !Array.isArray(outline) || outline.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供大纲' 
      })
    }
    
    // 获取任务信息（如果有 taskId）
    let taskTitle = ''
    let taskDescription = ''
    
    if (taskId) {
      const task = await prisma.task.findFirst({
        where: { 
          id: parseInt(taskId),
          userId: req.user.id
        }
      })
      
      if (task) {
        taskTitle = task.title
        taskDescription = task.description || ''
      }
    }
    
    // 构建 Prompt
    const prompt = `请根据以下大纲撰写一篇文章：

${taskTitle ? `标题：${taskTitle}` : ''}
${taskDescription ? `描述：${taskDescription}` : ''}

大纲：
${outline.map((item, index) => `${index + 1}. ${item}`).join('\n')}

要求：
1. 文章风格：${style === 'casual' ? '轻松幽默' : style === 'formal' ? '正式专业' : '通俗易懂'}
2. 字数：约${wordCount}字
3. 语言：中文
4. 结构清晰，每段有明确的主题
5. 适当使用例子和比喻让内容更生动
6. 如果是技术文章，请提供实用的代码示例`

    // 调用 AI
    const article = await generateWithQwen(prompt, {
      temperature: 0.8,
      maxTokens: 4000
    })
    
    // 更新任务状态
    if (taskId) {
      await prisma.task.update({
        where: { id: parseInt(taskId) },
        data: {
          status: 'draft',
          metadata: JSON.stringify({ 
            outline,
            article,
            generatedAt: new Date().toISOString()
          })
        }
      })
    }
    
    logger.info(`文章生成成功：${taskTitle || '无标题'}`)
    
    res.json({
      success: true,
      data: {
        title: taskTitle || '未命名文章',
        content: article,
        wordCount: article.length,
        outline
      },
      message: '文章生成成功'
    })
  } catch (error) {
    logger.error('生成文章失败:', error)
    res.status(500).json({ 
      success: false, 
      error: 'AI 生成失败：' + error.message 
    })
  }
})

/**
 * POST /api/generate/expand
 * AI 扩写/润色
 */
router.post('/expand', async (req, res) => {
  try {
    const { text, action = 'expand', context } = req.body
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供文本' 
      })
    }
    
    let prompt = ''
    
    if (action === 'expand') {
      prompt = `请扩写以下内容，使其更加详细和丰富：

原文：
${text}

${context ? `上下文：${context}` : ''}

要求：
1. 保持原意不变
2. 添加更多细节和例子
3. 字数扩展到原文的 2-3 倍
4. 语言流畅自然`
    } else if (action === 'polish') {
      prompt = `请润色以下内容，使其更加流畅和专业：

原文：
${text}

要求：
1. 修正语法错误
2. 优化句子结构
3. 提升可读性
4. 保持原意不变`
    } else if (action === 'summarize') {
      prompt = `请总结以下内容，提取核心要点：

原文：
${text}

要求：
1. 简洁明了
2. 保留关键信息
3. 字数控制在原文的 20% 以内`
    }
    
    const result = await generateWithQwen(prompt, {
      temperature: 0.7,
      maxTokens: 2000
    })
    
    res.json({
      success: true,
      data: {
        original: text,
        result,
        action
      },
      message: '处理成功'
    })
  } catch (error) {
    logger.error('AI 扩写失败:', error)
    res.status(500).json({ 
      success: false, 
      error: 'AI 处理失败：' + error.message 
    })
  }
})

module.exports = router
