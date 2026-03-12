#!/bin/bash
# PM2 开机自启配置脚本

echo "🔧 配置 PM2 开机自启..."

# 执行 PM2 startup 命令
sudo env PATH=$PATH:/usr/bin /home/chenyi/.npm-global/lib/node_modules/pm2/bin/pm2 startup systemd -u chenyi --hp /home/chenyi

echo ""
echo "✅ PM2 开机自启配置完成！"
echo ""
echo "📊 验证命令："
echo "  pm2 status          # 查看服务状态"
echo "  pm2 logs            # 查看日志"
echo "  pm2 monit           # 监控面板"
echo ""
echo "📝 常用命令："
echo "  pm2 restart all     # 重启所有服务"
echo "  pm2 stop all        # 停止所有服务"
echo "  pm2 delete all      # 删除所有服务"
echo "  pm2 save            # 保存当前进程列表"
