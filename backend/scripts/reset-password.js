// 重置密码脚本
require('dotenv').config()
const { prisma } = require('../config/db')
const bcrypt = require('bcrypt')

async function resetPassword() {
  try {
    console.log('🔄 开始重置密码...\n')

    // 查找用户
    const user = await prisma.user.findFirst({
      where: { username: 'maydaychen' }
    })
    
    if (!user) {
      console.log('❌ 未找到用户 maydaychen')
      console.log('当前数据库中的用户:')
      const users = await prisma.user.findMany()
      users.forEach(u => {
        console.log(`  - ${u.username} (${u.email})`)
      })
      return
    }

    // 重置密码
    const newPassword = 'Admin@123456'
    const passwordHash = await bcrypt.hash(newPassword, 12)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    })
    
    console.log('✅ 密码重置成功!\n')
    console.log('═══════════════════════════════════════')
    console.log('  用户名：maydaychen')
    console.log('  密码：Admin@123456')
    console.log('═══════════════════════════════════════\n')
    console.log('⚠️  首次登录后请立即修改密码！\n')
    
  } catch (error) {
    console.error('❌ 错误:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
