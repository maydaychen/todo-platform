/**
 * AI Token 使用记录
 * 在每次 AI 调用后记录 Token 使用情况
 */

const { prisma } = require('../config/db')
const logger = require('./logger')

/**
 * 记录 AI 使用
 * @param {Object} params
 * @param {number} params.userId - 用户 ID
 * @param {string} params.provider - 供应商 (aliyun, xiaomi, longcat, etc.)
 * @param {string} params.action - 操作类型 (generate_outline, generate_article, etc.)
 * @param {number} params.tokensUsed - 使用的 Token 数
 * @param {number} params.cost - 费用（元）
 */
async function recordAiUsage({ userId, provider, action, tokensUsed = 0, cost = 0 }) {
  try {
    await prisma.aiUsage.create({
      data: {
        userId,
        provider,
        action,
        tokensUsed,
        cost
      }
    })
    
    logger.info(`AI 使用记录：用户 ${userId}, 供应商 ${provider}, 操作 ${action}, Tokens ${tokensUsed}`)
  } catch (error) {
    logger.error('记录 AI 使用失败:', error)
    // 不抛出错误，避免影响主流程
  }
}

/**
 * 估算 Token 费用
 * @param {string} provider - 供应商
 * @param {number} tokens - Token 数量
 * @param {Object} options - 额外选项
 * @param {string} options.type - 类型：input/output/cached_input/cached_output
 * @param {string} options.mode - 模式：standard/batch (阿里云专用)
 * @returns {number} 费用（元）
 */
function estimateCost(provider, tokens, options = {}) {
  const { type = 'input', mode = 'standard' } = options
  
  // 小米 AI 价格（每 1M tokens）
  const xiaomiPrices = {
    input: 0.7,              // 输入 ¥0.7 / 1M tokens
    cached_input: 0.07,      // 输入（命中缓存）¥0.07 / 1M tokens
    output: 2.1              // 输出 ¥2.1 / 1M tokens
  }
  
  // 阿里云百炼价格（每 1K tokens）
  const aliyunPrices = {
    input: 0.0008,                    // 输入 0.0008 元/每千 tokens
    batch_input: 0.0004,              // 输入（Batch）0.0004 元/每千 tokens
    cached_input_create: 0.001,       // 显式缓存创建 0.001 元/每千 tokens
    cached_input_hit: 0.00008,        // 显式缓存命中 0.00008 元/每千 tokens
    output: 0.0048,                   // 输出 0.0048 元/每千 tokens
    batch_output: 0.0024              // 输出（Batch）0.0024 元/每千 tokens
  }
  
  // 其他供应商价格（每 1K tokens）
  const otherPrices = {
    longcat: 0.001,
    openai: 0.03,      // GPT-4: $0.03/1K tokens ≈ ¥0.21
    deepseek: 0.001
  }
  
  let cost = 0
  
  if (provider === 'xiaomi') {
    const pricePer1M = xiaomiPrices[type] || xiaomiPrices.input
    cost = (tokens / 1000000) * pricePer1M
  } else if (provider === 'aliyun') {
    let pricePer1K = 0
    
    if (mode === 'batch') {
      pricePer1K = type === 'output' ? aliyunPrices.batch_output : aliyunPrices.batch_input
    } else if (type === 'cached_input_create') {
      pricePer1K = aliyunPrices.cached_input_create
    } else if (type === 'cached_input_hit') {
      pricePer1K = aliyunPrices.cached_input_hit
    } else if (type === 'output') {
      pricePer1K = aliyunPrices.output
    } else {
      pricePer1K = aliyunPrices.input
    }
    
    cost = (tokens / 1000) * pricePer1K
  } else {
    const pricePer1K = otherPrices[provider] || 0.001
    cost = (tokens / 1000) * pricePer1K
  }
  
  return cost
}

module.exports = {
  recordAiUsage,
  estimateCost
}
