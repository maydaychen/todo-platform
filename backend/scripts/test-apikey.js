// 测试 API Key 生成
require('dotenv').config()
const { prisma } = require('../config/db')
const bcrypt = require('bcrypt')

async function testApiKeyGeneration() {
  try {
    console.log('🧪 测试 API Key 生成...\n')
    
    // 1. 找到测试用户
    const user = await prisma.user.findFirst({
      where: { username: 'maydaychen' }
    })
    
    if (!user) {
      console.log('❌ 未找到用户 maydaychen')
      return
    }
    
    console.log(`✅ 找到用户：${user.username} (ID: ${user.id})\n`)
    
    // 2. 生成 API Key
    const apiKey = `todo_sk_${Buffer.from(`${Date.now()}-${user.id}`).toString('base64')}`
    console.log(`🔑 生成的 API Key: ${apiKey}\n`)
    
    // 3. 保存到数据库
    const apiKeyRecord = await prisma.apiKey.create({
      data: {
        key: apiKey,
        name: 'Test API Key',
        userId: user.id
      }
    })
    
    console.log(`✅ API Key 已保存到数据库`)
    console.log(`   ID: ${apiKeyRecord.id}`)
    console.log(`   Name: ${apiKeyRecord.name}`)
    console.log(`   Created: ${apiKeyRecord.createdAt}\n`)
    
    // 4. 验证可以查询到
    const verification = await prisma.apiKey.findUnique({
      where: { id: apiKeyRecord.id }
    })
    
    console.log(`✅ 验证成功：数据库中有 ${verification.key === apiKey ? '✓' : '✗'} 记录`)
    console.log('\n🎉 测试完成！API Key 生成功能正常。\n')
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testApiKeyGeneration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
