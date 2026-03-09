/**
 * 导出路由 - 导出 AI 生成的内容到 NAS
 */
const express = require('express')
const router = express.Router()
const fs = require('fs').promises
const path = require('path')
const { prisma } = require('../config/db')
const logger = require('../utils/logger')
const { authenticateToken } = require('../middleware/auth')

// NAS 导出目录
const NAS_EXPORT_DIR = '/mnt/nas-openclaw/todo-articles'

// 确保导出目录存在
async function ensureExportDir() {
  try {
    await fs.access(NAS_EXPORT_DIR)
  } catch {
    await fs.mkdir(NAS_EXPORT_DIR, { recursive: true })
  }
}

// 所有路由都需要认证
router.use(authenticateToken)

/**
 * POST /api/export/nas
 * 导出 AI 生成的文章到 NAS
 */
router.post('/nas', async (req, res) => {
  try {
    const { taskId, title, content, format = 'markdown' } = req.body
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: '请提供标题和内容'
      })
    }
    
    // 确保导出目录存在
    await ensureExportDir()
    
    // 生成文件名（使用时间戳避免重复）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const safeTitle = title.replace(/[^\w\u4e00-\u9fa5]/g, '_').slice(0, 50)
    const filename = `${timestamp}_${safeTitle}.md`
    const filepath = path.join(NAS_EXPORT_DIR, filename)
    
    // 获取任务信息（如果有 taskId）
    let taskInfo = ''
    let categoryName = ''
    
    if (taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: parseInt(taskId),
          userId: req.user.id
        },
        include: {
          category: true
        }
      })
      
      if (task) {
        categoryName = task.category?.name || '未分类'
        taskInfo = `## 任务信息
- **标题**: ${task.title}
- **分类**: ${categoryName}
- **创建时间**: ${task.createdAt.toLocaleString('zh-CN')}
- **导出时间**: ${new Date().toLocaleString('zh-CN')}

---

`
      }
    }
    
    // 构建 Markdown 内容
    const markdownContent = `# ${title}

${taskInfo}${content}

---

*本文由 TODO Platform AI 生成*
`
    
    // 写入文件
    await fs.writeFile(filepath, markdownContent, 'utf8')
    
    // 获取文件状态
    const stats = await fs.stat(filepath)
    
    logger.info(`文章导出成功：${filename} (${stats.size} bytes)`)
    
    res.json({
      success: true,
      data: {
        filename,
        filepath,
        size: stats.size,
        title,
        category: categoryName,
        exportedAt: new Date().toISOString()
      },
      message: '文章已成功导出到 NAS'
    })
  } catch (error) {
    logger.error('导出到 NAS 失败:', error)
    res.status(500).json({
      success: false,
      error: '导出失败：' + error.message
    })
  }
})

/**
 * GET /api/export/nas/list
 * 获取已导出的文章列表
 */
router.get('/nas/list', async (req, res) => {
  try {
    await ensureExportDir()
    
    const files = await fs.readdir(NAS_EXPORT_DIR)
    const fileList = []
    
    for (const filename of files) {
      if (filename.endsWith('.md')) {
        const filepath = path.join(NAS_EXPORT_DIR, filename)
        const stats = await fs.stat(filepath)
        
        // 解析文件名获取标题
        const parts = filename.split('_')
        const timestamp = parts[0]
        const title = parts.slice(1).join('_').replace('.md', '').replace(/_/g, ' ')
        
        fileList.push({
          filename,
          title: title || '未命名文章',
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        })
      }
    }
    
    // 按时间倒序
    fileList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    res.json({
      success: true,
      data: fileList,
      count: fileList.length
    })
  } catch (error) {
    logger.error('获取导出列表失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/export/nas/:filename
 * 删除已导出的文章
 */
router.delete('/nas/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const filepath = path.join(NAS_EXPORT_DIR, filename)
    
    // 安全检查：确保文件在导出目录内
    if (!filepath.startsWith(NAS_EXPORT_DIR)) {
      return res.status(400).json({
        success: false,
        error: '无效的文件路径'
      })
    }
    
    await fs.unlink(filepath)
    
    logger.info(`导出文件已删除：${filename}`)
    
    res.json({
      success: true,
      message: '文件已删除'
    })
  } catch (error) {
    logger.error('删除导出文件失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router
