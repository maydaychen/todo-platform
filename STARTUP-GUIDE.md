# 配置 PM2 开机自启

## 🚀 快速配置

### 方法 1: 执行脚本（推荐）

```bash
cd /home/chenyi/.openclaw/workspace/projects/todo-platform
bash enable-startup.sh
```

### 方法 2: 手动执行命令

```bash
# 1. 配置 systemd 服务
sudo env PATH=$PATH:/usr/bin \
  /home/chenyi/.npm-global/lib/node_modules/pm2/bin/pm2 \
  startup systemd -u chenyi --hp /home/chenyi

# 2. 复制输出的命令并执行（如果需要）
```

### 方法 3: 使用 systemd 服务文件

```bash
# 1. 复制服务文件到 systemd 目录
sudo cp pm2-chenyi.service /etc/systemd/system/

# 2. 重新加载 systemd
sudo systemctl daemon-reload

# 3. 启用服务
sudo systemctl enable pm2-chenyi

# 4. 启动服务
sudo systemctl start pm2-chenyi
```

---

## ✅ 验证配置

### 检查 systemd 服务

```bash
# 查看服务状态
systemctl status pm2-chenyi

# 查看是否启用
systemctl is-enabled pm2-chenyi
```

### 检查 PM2 进程

```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs
```

---

## 🧪 测试开机自启

### 重启系统测试

```bash
# 重启系统
sudo reboot

# 重启后检查
pm2 status
```

### 模拟重启测试

```bash
# 停止所有 PM2 进程
pm2 kill

# 使用 systemd 启动
sudo systemctl start pm2-chenyi

# 检查状态
pm2 status
```

---

## 📋 预期输出

### 成功配置后

```bash
$ pm2 status
┌────┬──────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name             │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼──────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ todo-backend     │ default     │ 1.0.0   │ cluster │ 12345    │ 10h    │ 0    │ online    │ 0%       │ 86.5mb   │ chenyi   │ disabled │
│ 1  │ todo-frontend    │ default     │ 1.0.0   │ cluster │ 12346    │ 10h    │ 0    │ online    │ 0%       │ 97.6mb   │ chenyi   │ disabled │
└────┴──────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

### systemd 服务状态

```bash
$ systemctl status pm2-chenyi
● pm2-chenyi.service - PM2 process manager for TODO Platform
     Loaded: loaded (/etc/systemd/system/pm2-chenyi.service; enabled; preset: disabled)
     Active: active (running) since Thu 2026-03-12 14:00:00 CST
```

---

## 🔧 故障排查

### 服务未启动

```bash
# 查看 systemd 日志
journalctl -u pm2-chenyi -f

# 查看 PM2 日志
pm2 logs
```

### 进程未恢复

```bash
# 手动恢复进程
pm2 resurrect

# 重新启动所有进程
pm2 start all
```

### 权限问题

```bash
# 检查文件权限
ls -la /etc/systemd/system/pm2-chenyi.service

# 重新加载 systemd
sudo systemctl daemon-reload
```

---

## 📝 注意事项

1. **首次配置需要 sudo 密码**
2. **配置完成后无需再次配置**
3. **系统重启后会自动启动**
4. **可以通过 `pm2 save` 更新进程列表**

---

**配置日期**: 2026-03-12  
**维护者**: Haro 🤖
