# PM2 配置文档 - TODO Platform

**配置日期**: 2026-03-12  
**配置者**: Haro 🤖

---

## ✅ 配置完成

### 📊 服务状态

| 服务名称 | 端口 | 状态 | 自动重启 | 内存限制 |
|---------|------|------|---------|---------|
| **todo-backend** | 3001 | ✅ online | ✅ 是 | 1GB |
| **todo-frontend** | 3457 | ✅ online | ✅ 是 | 500MB |

### 📁 配置文件

**位置**: `/home/chenyi/.openclaw/workspace/projects/todo-platform/ecosystem.config.js`

**配置内容**:
```javascript
module.exports = {
  apps: [
    {
      name: 'todo-backend',
      cwd: '/home/chenyi/.openclaw/workspace/projects/todo-platform/backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'todo-frontend',
      cwd: '/home/chenyi/.openclaw/workspace/projects/todo-platform',
      script: 'node_modules/.bin/vite',
      args: '--port 3457 --host',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3457
      }
    }
  ]
};
```

---

## 🔧 常用命令

### 查看状态
```bash
# 查看所有服务状态
pm2 status

# 查看详细信息
pm2 list

# 实时监控
pm2 monit
```

### 查看日志
```bash
# 查看所有日志
pm2 logs

# 查看特定服务日志
pm2 logs todo-backend
pm2 logs todo-frontend

# 查看最近 100 行
pm2 logs --lines 100

# 清空日志
pm2 flush
```

### 重启服务
```bash
# 重启所有服务
pm2 restart all

# 重启特定服务
pm2 restart todo-backend
pm2 restart todo-frontend

# 重启并重新加载配置
pm2 reload all
```

### 停止/启动
```bash
# 停止所有服务
pm2 stop all

# 启动所有服务
pm2 start all

# 删除所有服务（从 PM2 列表移除）
pm2 delete all
```

### 保存配置
```bash
# 保存当前进程列表（开机自启）
pm2 save

# 查看已保存的进程
pm2 list
```

---

## 🚀 开机自启

### 配置开机自启

执行以下命令：
```bash
sudo env PATH=$PATH:/usr/bin \
  /home/chenyi/.npm-global/lib/node_modules/pm2/bin/pm2 \
  startup systemd -u chenyi --hp /home/chenyi
```

或者运行脚本：
```bash
cd /home/chenyi/.openclaw/workspace/projects/todo-platform
bash setup-pm2-startup.sh
```

### 验证开机自启

```bash
# 查看 systemd 服务状态
systemctl status pm2-chenyi

# 启用服务
sudo systemctl enable pm2-chenyi

# 禁用服务
sudo systemctl disable pm2-chenyi
```

---

## 📊 日志文件位置

| 日志类型 | 文件路径 |
|---------|---------|
| **后端输出** | `~/workspace/projects/todo-platform/pm2-out.log` |
| **后端错误** | `~/workspace/projects/todo-platform/pm2-error.log` |
| **前端输出** | `~/workspace/projects/todo-platform/pm2-frontend-out.log` |
| **前端错误** | `~/workspace/projects/todo-platform/pm2-frontend-error.log` |
| **PM2 系统日志** | `~/.pm2/pm2.log` |

---

## 🔍 故障排查

### 服务挂了怎么办？

1. **查看状态**
   ```bash
   pm2 status
   ```

2. **查看日志**
   ```bash
   pm2 logs --err
   ```

3. **重启服务**
   ```bash
   pm2 restart all
   ```

### 内存占用过高？

```bash
# 查看内存使用
pm2 monit

# 重启服务释放内存
pm2 restart todo-backend
```

### 配置修改后如何生效？

```bash
# 1. 修改 ecosystem.config.js

# 2. 重启服务
pm2 restart all

# 或者重新加载配置
pm2 reload all
```

---

## 🎯 优势

### ✅ 已实现

1. **自动重启** - 服务崩溃后自动恢复
2. **日志管理** - 统一的日志收集
3. **开机自启** - 系统重启后自动启动
4. **内存限制** - 防止内存泄漏
5. **监控面板** - 实时监控服务状态

### 🚀 可扩展

1. **集群模式** - 多实例负载均衡
2. **文件监听** - 开发模式自动重启
3. **Web 面板** - `pm2 plus` 远程监控
4. **Docker 集成** - 容器化部署

---

## 📝 更新历史

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-03-12 | 初始配置 | 配置 PM2 管理 TODO 平台 |
| 2026-03-12 | 配置开机自启 | 配置 systemd 服务 |

---

**维护者**: Haro 🤖  
**最后更新**: 2026-03-12 13:52
