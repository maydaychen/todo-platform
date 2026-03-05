# TODO Platform - 内网访问问题解决

**时间**: 2026-03-04 23:48  
**状态**: ✅ 已解决

---

## 🐛 问题描述

无法通过内网访问 TODO Platform：
- ❌ http://192.168.3.67:3457 返回 404
- ❌ Vite 进程异常

---

## 🔍 原因分析

**根本原因**: Vite 配置文件错误

1. **publicDir 配置错误**
   ```javascript
   // ❌ 错误配置
   publicDir: 'frontend/public'
   ```

2. **缺少 root 配置**
   - Vite 默认从项目根目录找 index.html
   - 我们的 index.html 在 frontend/ 目录

---

## ✅ 解决方案

修改 `vite.config.js`：

```javascript
export default defineConfig({
  root: 'frontend',  // ✅ 添加：指定前端目录
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend/src')
    }
  },
  server: {
    port: 3457,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '192.168.3.67',
      'maydaychenhome.top',
      'www.maydaychenhome.top'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../dist',  // ✅ 修改：输出到上一级目录
    assetsDir: 'static'
  },
  publicDir: 'public'  // ✅ 修改：相对于 root 目录
})
```

---

## 🎯 访问测试

### ✅ 本地访问
```bash
curl http://localhost:3457/
```
**结果**: ✅ 正常返回 HTML

### ✅ 内网访问
```bash
curl http://192.168.3.67:3457/
```
**结果**: ✅ 正常返回 HTML

### ✅ 服务状态
```
➜  Local:   http://localhost:3457/
➜  Network: http://192.168.3.67:3457/
```

---

## 📋 访问地址

| 类型 | 地址 | 状态 |
|------|------|------|
| 本地 | http://localhost:3457 | ✅ 正常 |
| 内网 | http://192.168.3.67:3457 | ✅ 正常 |
| 外网 | https://www.maydaychenhome.top:18457 | ⏳ 等待 Nginx 配置 |

---

## 🔧 服务状态

| 服务 | 端口 | 状态 |
|------|------|------|
| 后端 API | 3001 | ✅ 运行中 |
| 前端 Vite | 3457 | ✅ 运行中 |
| 数据库 | 阿里云 MariaDB | ✅ 正常 |

---

## 📝 关键修改

### vite.config.js
1. 添加 `root: 'frontend'` - 指定前端源码目录
2. 修改 `publicDir: 'public'` - 相对于 root 目录
3. 修改 `build.outDir: '../dist'` - 输出到项目根目录的 dist

---

**解决者**: Haro 🤖  
**状态**: ✅ 内网访问正常，可以开始使用
