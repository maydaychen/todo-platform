/**
 * 重置用户密码脚本
 * 用法：node scripts/update-user-password.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updatePassword() {
  try {
    const username = 'maydaychen'
    const newPassword = 'gjy!MVX!mcx.etb7vwe'
    
    console.log('🔐 正在更新用户密码...')
    console.log(`   用户名：${username}`)
    console.log(`   新密码：${newPassword}`)
    console.log('')
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username }
    })
    
    if (!user) {
      console.error(`❌ 用户 ${username} 不存在！`)
      await prisma.$disconnect()
      process.exit(1)
    }
    
    // 生成密码哈希
    const passwordHash = await bcrypt.hash(newPassword, 12)
    
    // 更新密码
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    })
    
    console.log('✅ 密码更新成功！')
    console.log('')
    console.log('📝 请使用新密码登录：')
    console.log(`   用户名：${username}`)
    console.log(`   密码：${newPassword}`)
    console.log('')
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ 更新失败:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

updatePassword()
