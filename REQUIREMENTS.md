# TODO 平台需求规格说明书

**版本**: v1.0.0  
**创建日期**: 2026-03-04  
**作者**: Haro 🤖  
**状态**: 初稿待审核

---

## 📋 目录

1. [项目概述](#1-项目概述)
2. [功能需求](#2-功能需求)
3. [非功能需求](#3-非功能需求)
4. [系统架构](#4-系统架构)
5. [API 设计](#5-api-设计)
6. [数据模型](#6-数据模型)
7. [UI/UX 设计](#7-uiux-设计)
8. [安全设计](#8-安全设计)
9. [部署方案](#9-部署方案)
10. [待确认事项](#10-待确认事项)

---

## 1. 项目概述

### 1.1 项目背景
构建一个双模块 TODO 管理平台，分为「日常任务」和「创作任务」两大模块，支持 API 优先调用，可与 n8n、Home Assistant、Telegram Bot 等系统深度集成。

### 1.2 核心价值
- **双轨制管理**: 日常任务与创作任务分离，不同工作流
- **API 优先**: 所有功能可通过 API 调用，不依赖网页
- **自动化集成**: 与现有系统（n8n、HA、Telegram）无缝对接
- **创作加速**: 一键 AI 生成文章，从灵感到发布全流程

### 1.3 目标用户
- 主要用户：陈总（个人使用）
- 扩展用户：家人（可选多用户支持）

### 1.4 技术栈
| 组件 | 技术选型 | 说明 |
|------|---------|------|
| 后端 | Node.js + Express | 与 OpenClaw Manager 一致 |
| 数据库 | MariaDB | 阿里云服务器（复用现有） |
| 前端 | Vue 3 + Tailwind CSS | 毛玻璃风格，响应式 |
| 认证 | JWT + API Key | 双认证模式 |
| 部署 | Docker | 本地部署，3457 端口 |

---

## 2. 功能需求

### 2.1 日常任务模块

| ID | 功能 | 描述 | 优先级 |
|----|------|------|--------|
| D1 | 创建任务 | 支持标题、描述、截止日期、优先级、标签 | P0 |
| D2 | 编辑任务 | 修改任务所有属性 | P0 |
| D3 | 删除任务 | 软删除（可恢复） | P0 |
| D4 | 完成任务 | 标记完成/未完成 | P0 |
| D5 | 任务列表 | 支持筛选（全部/待办/已完成）、排序、搜索 | P0 |
| D6 | 任务分类 | 自定义分类（工作、家庭、购物等） | P1 |
| D7 | 重复任务 | 支持每日/每周/每月重复 | P1 |
| D8 | 提醒通知 | 截止日期前提醒（Telegram/邮件） | P1 |
| D9 | 子任务 | 支持任务分解为子任务 | P2 |
| D10 | 附件 | 支持上传图片、文件 | P2 |

### 2.2 创作任务模块

| ID | 功能 | 描述 | 优先级 |
|----|------|------|--------|
| C1 | 创建创作任务 | 支持标题、类型、大纲、素材 | P0 |
| C2 | 创作状态管理 | idea → outline → draft → review → done | P0 |
| C3 | 大纲编辑 | 可视化大纲编辑（拖拽排序） | P1 |
| C4 | 素材收集 | 链接、图片、笔记收集 | P1 |
| C5 | AI 生成大纲 | 根据标题自动生成大纲 | P1 |
| C6 | AI 生成全文 | 根据大纲一键生成文章 | P0 |
| C7 | 文章编辑 | 富文本编辑器（Markdown 支持） | P1 |
| C8 | 版本管理 | 保存历史版本，可回滚 | P2 |
| C9 | 导出功能 | 导出 Markdown、PDF、Word | P1 |
| C10 | 一键发布 | 发布到公众号、博客等平台 | P2 |

### 2.3 系统功能

| ID | 功能 | 描述 | 优先级 |
|----|------|------|--------|
| S1 | 用户认证 | JWT Token + API Key | P0 |
| S2 | 用户管理 | 多用户支持（可选） | P2 |
| S3 | API 文档 | 在线 API 文档（Swagger/OpenAPI） | P1 |
| S4 | 操作日志 | 记录所有 API 调用 | P1 |
| S5 | 数据备份 | 自动备份数据库 | P1 |
| S6 | 数据统计 | 任务完成统计、创作统计 | P2 |

---

## 3. 非功能需求

### 3.1 性能要求
- API 响应时间 < 200ms（95% 请求）
- 页面加载时间 < 2s
- 支持并发用户数：10+（个人使用，低并发）

### 3.2 可用性要求
- 服务可用性 > 99%
- 数据持久化，不丢失
- 支持离线操作（本地存储，联网同步）

### 3.3 安全要求
- 所有 API 需认证
- 密码加密存储（bcrypt）
- API Key 可轮换、可撤销
- 敏感操作需二次确认

### 3.4 可维护性
- 代码注释完整
- 日志记录详细
- 支持热更新（不中断服务）

### 3.5 兼容性
- 浏览器：Chrome、Firefox、Safari、Edge（最新 2 个版本）
- 移动端：响应式设计，支持手机浏览器
- API：RESTful 标准，支持任意 HTTP 客户端

---

## 4. 系统架构

### 4.1 架构图

```
┌─────────────────────────────────────────────────────────┐
│                      客户端层                              │
├─────────────┬─────────────┬─────────────┬───────────────┤
│   Web UI    │ Telegram Bot│   n8n       │   自定义脚本   │
└──────┬──────┴──────┬──────┴──────┬──────┴───────┬───────┘
       │             │             │              │
       └─────────────┴──────┬──────┴──────────────┘
                            │
                    ┌───────▼───────┐
                    │   Nginx       │  反向代理、SSL
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │  Express API  │  业务逻辑
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │   SQLite      │  数据存储
                    └───────────────┘
```

### 4.2 目录结构

```
/workspace/projects/todo-platform/
├── backend/
│   ├── app.js                 # Express 主入口
│   ├── server.js              # 服务器配置
│   ├── routes/
│   │   ├── tasks.js           # 任务路由（日常 + 创作）
│   │   ├── auth.js            # 认证路由
│   │   ├── generate.js        # AI 生成路由
│   │   └── stats.js           # 统计路由
│   ├── controllers/
│   │   ├── taskController.js
│   │   ├── authController.js
│   │   ├── generateController.js
│   │   └── statsController.js
│   ├── models/
│   │   ├── Task.js            # 任务模型
│   │   ├── User.js            # 用户模型
│   │   └── ApiKey.js          # API Key 模型
│   ├── middleware/
│   │   ├── auth.js            # 认证中间件
│   │   ├── rateLimit.js       # 限流中间件
│   │   └── logger.js          # 日志中间件
│   ├── services/
│   │   ├── aiService.js       # AI 服务（调用 Qwen）
│   │   ├── notificationService.js
│   │   └── backupService.js
│   ├── config/
│   │   ├── db.js              # 数据库配置
│   │   └── index.js           # 全局配置
│   └── utils/
│       └── helpers.js
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css          # 毛玻璃样式
│   ├── js/
│   │   ├── app.js
│   │   ├── daily.js           # 日常任务逻辑
│   │   └── creative.js        # 创作任务逻辑
│   └── assets/
├── docs/
│   └── API.md                 # API 文档
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── scripts/
│   ├── init-db.js             # 数据库初始化
│   └── backup.js              # 备份脚本
├── .env.example
├── package.json
└── README.md
```

---

## 5. API 设计

### 5.1 认证

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "maydaychen",
  "password": "your_password"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400
  }
}
```

```http
POST /api/auth/api-key
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "apiKey": "todo_sk_abc123...",
    "createdAt": "2026-03-04T10:00:00Z"
  }
}
```

### 5.2 任务管理

```http
# 获取任务列表
GET /api/tasks?type=daily&status=pending&sort=dueDate

# 创建任务
POST /api/tasks
{
  "title": "买奶粉",
  "type": "daily",
  "dueDate": "2026-03-05T10:00:00Z",
  "priority": "high",
  "tags": ["购物", "宝宝"],
  "categoryId": "family"
}

# 更新任务
PUT /api/tasks/:id
{
  "title": "买奶粉和尿不湿",
  "status": "completed"
}

# 删除任务
DELETE /api/tasks/:id

# 批量操作
POST /api/tasks/batch
{
  "action": "complete",
  "ids": ["1", "2", "3"]
}
```

### 5.3 创作任务专属

```http
# 获取创作清单
GET /api/tasks/creative?status=draft

# AI 生成大纲
POST /api/generate/outline
{
  "taskId": "123",
  "title": "OpenClaw 自动化心得",
  "model": "qwen3.5-plus"
}

# AI 生成全文
POST /api/generate/article
{
  "taskId": "123",
  "outline": ["引言", "安装", "使用", "总结"],
  "style": "casual",
  "wordCount": 2000
}

# 导出文章
GET /api/tasks/:id/export?format=markdown
```

### 5.4 统计

```http
# 获取统计数据
GET /api/stats/summary?period=week
GET /api/stats/completion-rate?period=month
```

---

## 6. 数据模型

### 6.1 Task 表

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('daily', 'creative')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
  dueDate DATETIME,
  completedAt DATETIME,
  categoryId INTEGER,
  parentId INTEGER,  -- 子任务关联
  tags TEXT,  -- JSON 数组 ["购物", "宝宝"]
  metadata TEXT,  -- JSON，创作任务专用（大纲、素材等）
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME,  -- 软删除
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);
```

### 6.2 Category 表

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('daily', 'creative')),
  color TEXT,  -- 分类颜色
  icon TEXT,   -- 分类图标
  userId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 6.3 User 表

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  email TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 6.4 ApiKey 表

```sql
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  name TEXT,  -- Key 名称（用于标识用途）
  userId INTEGER,
  lastUsedAt DATETIME,
  expiresAt DATETIME,
  revoked BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## 7. UI/UX 设计

### 7.1 设计风格：毛玻璃（Glassmorphism）

**设计特点**:
- 半透明背景 + 模糊效果
- 明亮渐变色彩
- 轻盈的层次感
- 圆角卡片设计

### 7.2 配色方案

| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色调 | 蓝紫渐变 | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` |
| 日常任务 | 蓝色系 | `#4facfe` → `#00f2fe` |
| 创作任务 | 紫色系 | `#667eea` → `#764ba2` |
| 完成状态 | 绿色系 | `#11998e` → `#38ef7d` |
| 高优先级 | 红色系 | `#eb3349` → `#f45c43` |
| 背景 | 深色渐变 | `#0f0c29` → `#302b63` → `#24243e` |
| 卡片背景 | 半透明白 | `rgba(255, 255, 255, 0.1)` |
| 文字主色 | 白色 | `#ffffff` |
| 文字次要 | 浅灰 | `rgba(255, 255, 255, 0.7)` |

### 7.3 字体

- **主字体**: Inter (无衬线，现代感)
- **代码字体**: JetBrains Mono
- **中文字体**: Noto Sans SC

### 7.4 核心效果

```css
/* 毛玻璃效果 */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

/* 悬浮效果 */
.glass-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* 按钮渐变 */
.gradient-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 10px 20px;
  font-weight: 600;
}
```

### 7.5 页面布局

**首页布局**:
```
┌────────────────────────────────────────────────────┐
│  Header (Logo + 搜索 + 用户头像)                      │
├──────────────┬─────────────────────────────────────┤
│              │                                     │
│   侧边栏     │           主内容区                   │
│  - 日常任务  │   ┌─────────────┬─────────────┐     │
│  - 创作任务  │   │  今日任务   │  即将到期    │     │
│  - 分类      │   ├─────────────┴─────────────┤     │
│  - 标签      │   │                           │     │
│  - 统计      │   │       任务列表             │     │
│              │   │                           │     │
│              │   └───────────────────────────┘     │
└──────────────┴─────────────────────────────────────┘
```

**任务卡片设计**:
```
┌─────────────────────────────────────────┐
│  ☐ 买奶粉                    🏷️购物 🏷️宝宝 │
│     明天 10:00               🔴 高优先级  │
│     描述：检查库存，买 A2 品牌...        │
│                              [编辑] [删除]│
└─────────────────────────────────────────┘
```

**创作任务卡片设计**:
```
┌─────────────────────────────────────────┐
│  📝 OpenClaw 自动化心得                  │
│     状态：大纲完成 🟡                    │
│     分类：技术博客                        │
│     大纲：[引言] [安装] [使用] [总结]    │
│                              [编辑] [AI 生成]│
└─────────────────────────────────────────┘
```

---

## 8. 安全设计

### 8.1 认证安全
- 密码使用 bcrypt 加密（salt rounds: 12）
- JWT Token 有效期 24 小时
- API Key 永不过期（但可手动撤销）
- 支持多 API Key（不同用途）

### 8.2 接口安全
- 所有 API 需认证（公开接口除外）
- 速率限制：60 次/分钟/IP
- 输入验证（防止 SQL 注入、XSS）
- CORS 配置（仅允许信任域名）

### 8.3 数据安全
- 数据库文件权限 600
- 敏感数据不记录日志
- 定期备份（每日凌晨 3 点）
- 备份文件加密存储

---

## 9. 部署方案

### 9.1 Docker 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  todo-platform:
    build: ./backend
    container_name: todo-platform
    restart: always
    ports:
      - "18346:3000"
    volumes:
      - ./data:/app/data  # 数据库持久化
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your_secret
      - DB_PATH=/app/data/todo.db
    networks:
      - openclaw-network

  nginx:
    image: nginx:alpine
    container_name: todo-nginx
    restart: always
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - todo-platform
    networks:
      - openclaw-network

networks:
  openclaw-network:
    external: true
```

### 9.2 Nginx 配置

```nginx
server {
    listen 443 ssl;
    server_name todo.maydaychenhome.top;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location / {
        proxy_pass http://todo-platform:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /app/frontend;
        expires 30d;
    }
}
```

### 9.3 访问地址
- 本地访问：http://localhost:3457
- 内网访问：http://192.168.3.67:3457

---

## 10. 待确认事项

### 10.1 功能相关
- [x] 多用户支持：不需要（单用户设计）
- [x] AI 模型：Qwen3.5-plus
- [x] 一键发布：不需要（手动发布）
- [x] 移动端：响应式网页（PC + 手机浏览器）

### 10.2 技术相关
- [x] 数据库：阿里云 MariaDB
- [ ] 实时通知：暂不需要
- [ ] 文件存储：本地存储

### 10.3 UI 相关
- [x] 毛玻璃风格：确认使用
- [ ] 深色/浅色模式：深色模式（暂不需要切换）
- [ ] 自定义主题：不需要

### 10.4 部署相关
- [x] 端口：3457
- [x] 域名：不需要（本地 IP 直连）
- [x] SSL 证书：不需要（内网访问）

---

## 附录

### A. 开发优先级
1. **Phase 1 (MVP)**: 基础任务管理 + API + 简单 UI
2. **Phase 2**: 创作模块 + AI 生成
3. **Phase 3**: 高级功能（统计、通知、发布）

### B. 参考项目
- Microsoft TODO (功能参考)
- Notion (创作模块参考)
- Things 3 (UI 参考)

### C. 相关文件
- [UI 设计原型](./frontend/index.html) - 待创建
- [API 文档](./docs/API.md) - 待创建
- [部署指南](./DEPLOYMENT.md) - 待创建

---

**文档状态**: 初稿完成，待陈总审核  
**下次更新**: 根据反馈调整需求
