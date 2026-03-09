const axios = require('axios')
const logger = require('../utils/logger')

/**
 * 使用阿里云 Qwen 模型生成内容
 * @param {string} prompt - 提示词
 * @param {object} options - 选项
 * @returns {Promise<string>} 生成的内容
 */
async function generateWithQwen(prompt, options = {}) {
  const {
    temperature = 0.7,
    maxTokens = 2000,
    model = 'qwen3.5-plus',
    apiKey
  } = options
  
  if (!apiKey) {
    throw new Error('未配置阿里云 API Key')
  }
  
  try {
    // 阿里云百炼 API 端点（OpenAI 兼容模式）
    const url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    
    const response = await axios.post(
      url,
      {
        model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的写作助手，擅长撰写各类文章。请用中文回复。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 120 秒超时（生成文章需要更长时间）
      }
    )
    
    // 解析响应（OpenAI 兼容格式）
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content
    } else {
      logger.warn('AI API 响应格式异常:', response.data)
      throw new Error('AI 响应格式异常')
    }
  } catch (error) {
    if (error.response) {
      logger.error('Qwen API 错误:', {
        status: error.response.status,
        data: error.response.data
      })
      throw new Error(`AI 服务错误：${error.response.status} - ${JSON.stringify(error.response.data)}`)
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('AI 请求超时，请重试')
    } else {
      logger.error('Qwen API 调用失败:', error.message)
      throw new Error(`AI 服务不可用：${error.message}`)
    }
  }
}

/**
 * 流式生成（可选，用于打字机效果）
 * @param {string} prompt - 提示词
 * @param {function} onChunk - 接收数据块的回调
 * @param {object} options - 选项
 */
async function generateWithQwenStream(prompt, onChunk, options = {}) {
  // 暂时实现为非流式，后续可扩展
  const result = await generateWithQwen(prompt, options)
  onChunk(result)
  return result
}

module.exports = {
  generateWithQwen,
  generateWithQwenStream
}
