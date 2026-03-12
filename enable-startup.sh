#!/bin/bash
# PM2 开机自启配置脚本

echo "🔧 配置 PM2 开机自启..."
echo ""

# 执行 PM2 startup 命令
sudo env PATH=$PATH:/usr/bin /home/chenyi/.npm-global/lib/node_modules/pm2/bin/pm2 startup systemd -u chenyi --hp /home/chenyi

echo ""
echo "✅ PM2 开机自启配置完成！"
echo ""
echo "📊 验证命令："
echo "  systemctl status pm2-chenyi    # 查看服务状态"
echo "  pm2 status                     # 查看进程状态"
echo "  pm2 logs                       # 查看日志"
echo ""
echo "🎯 现在 TODO 平台会在系统重启后自动启动！"
