# TODO Platform 快速启动指南

## 📋 前置条件

1. **Node.js** v18+ 
2. **阿里云 MariaDB** 数据库（已配置）
3. **阿里云百炼 API Key**（可选，用于 AI 生成）

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd /home/chenyi/.openclaw/workspace/projects/todo-platform
npm install
```

### 2. 环境变量（已配置）

`.env` 文件已创建，包含：
- ✅ 数据库连接（阿里云 MariaDB）
- ✅ JWT 密钥
- ⚠️ AI API Key（需要你自己填写）

编辑 `.env` 添加阿里云 API Key（可选）：
```env
ALIYUN_API_KEY=你的阿里云百炼 API Key
```

### 3. 数据库初始化（已完成）

数据库已初始化，包含：
- ✅ 默认用户：`maydaychen`
- ✅ 默认密码：`Admin@123456`
- ✅ 示例数据：3 个任务 + 5 个分类

### 4. 启动服务

#### 方式一：同时启动前后端（推荐）

```bash
npm start
```

- 前端：http://localhost:3457
- 后端：http://localhost:3001

#### 方式二：分别启动

```bash
# 终端 1 - 启动后端
npm run server

# 终端 2 - 启动前端
npm run dev
```

---

## 🎯 访问系统

1. 打开浏览器访问：http://localhost:3457
2. 登录账号：
   - **用户名**: `maydaychen`
   - **密码**: `Admin@123456`
3. 首次登录后建议修改密码！

---

## 📁 项目结构

```
todo-platform/
├── backend/
│   ├── server.js              # 后端入口
│   ├── routes/                # API 路由
│   │   ├── auth.js           # 认证路由
│   │   ├── tasks.js          # 任务路由
│   │   ├── generate.js       # AI 生成路由
│   │   └── stats.js          # 统计路由
│   ├── middleware/
│   │   └── auth.js           # 认证中间件
│   ├── services/
│   │   └── aiService.js      # AI 服务
│   ├── config/
│   │   └── db.js             # 数据库配置
│   ├── utils/
│   │   └── logger.js         # 日志工具
│   └── scripts/
│       └── init-db.js        # 数据库初始化
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── stores/
│   │   │   └── index.js
│   │   └── views/
│   │       ├── Login.vue
│   │       ├── Dashboard.vue
│   │       ├── DailyTasks.vue
│   │       ├── CreativeTasks.vue
│   │       └── Settings.vue
│   └── public/
│       └── favicon.svg
├── prisma/
│   └── schema.prisma         # 数据库模型
├── .env                      # 环境变量
├── .env.example              # 环境变量模板
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🔌 API 文档

### 认证相关

```bash
# 登录
POST /api/auth/login
{
  "username": "maydaychen",
  "password": "Admin@123456"
}

# 生成 API Key
POST /api/auth/api-key
Authorization: Bearer <token>
```

### 任务管理

```bash
# 获取任务列表
GET /api/tasks?type=daily&status=pending

# 创建任务
POST /api/tasks
{
  "title": "新任务",
  "type": "daily",
  "priority": "high",
  "dueDate": "2026-03-05T10:00:00Z"
}

# 更新任务
PUT /api/tasks/:id
{
  "status": "completed"
}

# 删除任务
DELETE /api/tasks/:id
```

### AI 生成

```bash
# 生成大纲
POST /api/generate/outline
{
  "taskId": 1,
  "title": "文章标题"
}

# 生成全文
POST /api/generate/article
{
  "taskId": 1,
  "outline": ["引言", "正文", "总结"],
  "style": "casual"
}
```

---

## 🛠️ 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器（前后端）
npm start

# 仅启动后端
npm run server

# 仅启动前端
npm run dev

# 构建前端
npm run build

# 数据库操作
npx prisma generate        # 生成 Prisma 客户端
npx prisma studio          # 打开数据库管理界面
npx prisma db push         # 推送数据库结构
```

---

## 🔐 安全建议

1. **修改默认密码** - 首次登录后立即修改
2. **保管 API Key** - 不要提交到 Git
3. **生产环境** - 使用强 JWT_SECRET
4. **定期备份** - 备份阿里云数据库

---

## 🐛 常见问题

### 后端启动失败

```bash
# 检查数据库连接
cd /home/chenyi/.openclaw/workspace/projects/todo-platform
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

### 前端无法连接后端

确保后端在运行：
```bash
curl http://localhost:3001/health
```

### 端口被占用

```bash
# 查看占用端口的进程
lsof -i :3457
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

---

## 📞 需要帮助？

查看文档：
- `REQUIREMENTS.md` - 需求规格说明
- `GAP-ANALYSIS.md` - 查漏补缺分析
- `DESIGN-SYSTEM.md` - 设计系统规范

---

**祝使用愉快！** 🤖
