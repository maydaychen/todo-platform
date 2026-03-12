/**
 * 数据库初始化脚本
 * 用法：node scripts/init-db.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function initDatabase() {
  try {
    console.log('🔧 开始初始化数据库...')
    
    // 从环境变量读取初始用户信息
    const username = process.env.INITIAL_USERNAME || 'maydaychen'
    const password = process.env.INITIAL_PASSWORD || 'ChangeMe@123456' // 首次登录后请修改
    const email = process.env.INITIAL_EMAIL || 'maydaychenyi@gmail.com'
    
    const passwordHash = await bcrypt.hash(password, 12)
    
    // 创建默认用户
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        email,
        role: 'admin',
        apiKey: `sk_${Buffer.from(`${username}-${Date.now()}`).toString('base64')}`
      }
    })
    
    console.log('✅ 数据库初始化成功！')
    console.log('')
    console.log('📝 默认管理员账号：')
    console.log(`   用户名：${username}`)
    console.log(`   密码：${password} (首次登录后请修改)`)
    console.log(`   API Key: ${user.apiKey}`)
    console.log('')
    console.log('⚠️ 安全提示：')
    console.log('   请在 .env 文件中设置 INITIAL_PASSWORD 环境变量')
    console.log('   不要在代码中硬编码密码！')
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ 初始化失败:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

initDatabase()
