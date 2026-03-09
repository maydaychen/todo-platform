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
    const { taskId, title, categoryId } = req.body
    
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供标题' 
      })
    }
    
    // 获取分类信息和提示词
    let categoryPrompt = ''
    let categoryName = ''
    
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { 
          id: parseInt(categoryId),
          userId: req.user.id
        }
      })
      
      if (category) {
        categoryName = category.name
        
        // 检查分类是否有配置提示词
        if (!category.prompt || category.prompt.trim() === '') {
          return res.status(400).json({
            success: false,
            error: `分类「${category.name}」未配置提示词`,
            message: '请先为该分类配置 AI 提示词，或选择其他分类',
            needPrompt: true,
            categoryId: category.id,
            categoryName: category.name
          })
        }
        
        categoryPrompt = category.prompt
      }
    }
    
    // 如果没有分类或分类没有提示词，返回错误
    if (!categoryPrompt) {
      return res.status(400).json({
        success: false,
        error: '未配置分类提示词',
        message: '请先为任务选择分类并配置 AI 提示词',
        needPrompt: true
      })
    }
    
    // 构建 Prompt
    let prompt = ''
    
    if (categoryPrompt) {
      // 使用分类专用提示词
      prompt = `${categoryPrompt}

请根据以上要求，为以下主题生成一个文章大纲：

主题：${title}
${categoryName ? `分类：${categoryName}` : ''}

要求：
1. 生成 3-6 个主要章节
2. 每个章节用简短的标题概括
3. 只返回大纲章节标题，用 JSON 数组格式，例如：["引言", "第一章", "第二章", "总结"]`
    } else {
      // 使用默认提示词
      prompt = `请为以下主题生成一个文章大纲：
    
主题：${title}
${categoryName ? `分类：${categoryName}` : ''}

要求：
1. 生成 3-6 个主要章节
2. 每个章节用简短的标题概括
3. 只返回大纲章节标题，用 JSON 数组格式，例如：["引言", "第一章", "第二章", "总结"]`
    }
    
    // 获取用户的 AI 配置
    const aiConfig = await prisma.aiConfig.findFirst({
      where: {
        userId: req.user.id,
        provider: 'aliyun',
        enabled: true
      }
    })
    
    if (!aiConfig || !aiConfig.apiKey) {
      return res.status(400).json({
        success: false,
        error: '未配置阿里云 API Key，请先在 AI 配置页面设置'
      })
    }
    
    // 调用 AI
    const result = await generateWithQwen(prompt, {
      temperature: 0.7,
      maxTokens: 500,
      model: aiConfig.model || 'qwen3.5-plus',
      apiKey: aiConfig.apiKey
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
    const { taskId, outline, style = 'casual', wordCount = 1000, categoryId } = req.body
    
    if (!outline || !Array.isArray(outline) || outline.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供大纲' 
      })
    }
    
    // 获取任务信息（如果有 taskId）
    let taskTitle = ''
    let taskDescription = ''
    
    // 获取分类提示词
    let categoryPrompt = ''
    let categoryName = ''
    
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
        
        // 获取任务的分类
        if (task.categoryId) {
          const category = await prisma.category.findFirst({
            where: { 
              id: task.categoryId,
              userId: req.user.id
            }
          })
          
          if (category) {
            categoryName = category.name
            
            // 检查分类是否有配置提示词
            if (!category.prompt || category.prompt.trim() === '') {
              return res.status(400).json({
                success: false,
                error: `分类「${category.name}」未配置提示词`,
                message: '请先为该分类配置 AI 提示词，或选择其他分类',
                needPrompt: true,
                categoryId: category.id,
                categoryName: category.name
              })
            }
            
            categoryPrompt = category.prompt
          }
        }
      }
    }
    
    // 如果提供了 categoryId 但没有 taskId，直接获取分类提示词
    if (!categoryPrompt && categoryId) {
      const category = await prisma.category.findFirst({
        where: { 
          id: parseInt(categoryId),
          userId: req.user.id
        }
      })
      
      if (category) {
        categoryName = category.name
        
        // 检查分类是否有配置提示词
        if (!category.prompt || category.prompt.trim() === '') {
          return res.status(400).json({
            success: false,
            error: `分类「${category.name}」未配置提示词`,
            message: '请先为该分类配置 AI 提示词，或选择其他分类',
            needPrompt: true,
            categoryId: category.id,
            categoryName: category.name
          })
        }
        
        categoryPrompt = category.prompt
      }
    }
    
    // 如果没有分类或分类没有提示词，返回错误
    if (!categoryPrompt) {
      return res.status(400).json({
        success: false,
        error: '未配置分类提示词',
        message: '请先为任务选择分类并配置 AI 提示词',
        needPrompt: true
      })
    }
    
    // 构建 Prompt
    let prompt = ''
    
    if (categoryPrompt) {
      // 使用分类专用提示词
      prompt = `${categoryPrompt}

请根据以上要求，结合以下大纲撰写一篇文章：

${taskTitle ? `标题：${taskTitle}` : ''}
${taskDescription ? `描述：${taskDescription}` : ''}
${categoryName ? `分类：${categoryName}` : ''}

大纲：
${outline.map((item, index) => `${index + 1}. ${item}`).join('\n')}

要求：
1. 文章风格：${style === 'casual' ? '轻松幽默' : style === 'formal' ? '正式专业' : '通俗易懂'}
2. 字数：约${wordCount}字
3. 语言：中文
4. 结构清晰，每段有明确的主题
5. 适当使用例子和比喻让内容更生动`
    } else {
      // 使用默认提示词
      prompt = `请根据以下大纲撰写一篇文章：

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
    }
    
    // 获取用户的 AI 配置
    const aiConfig = await prisma.aiConfig.findFirst({
      where: {
        userId: req.user.id,
        provider: 'aliyun',
        enabled: true
      }
    })
    
    if (!aiConfig || !aiConfig.apiKey) {
      return res.status(400).json({
        success: false,
        error: '未配置阿里云 API Key，请先在 AI 配置页面设置'
      })
    }
    
    // 调用 AI
    const article = await generateWithQwen(prompt, {
      temperature: 0.8,
      maxTokens: 4000,
      model: aiConfig.model || 'qwen3.5-plus',
      apiKey: aiConfig.apiKey
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
