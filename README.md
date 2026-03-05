# TODO Platform

📋 **智能任务管理平台** - 集成 AI 内容生成的现代化任务管理系统

---

## ✨ 特性亮点

### 🎯 核心功能

- **📅 日常任务管理** - 创建、编辑、删除、筛选日常任务
- **✍️ 创作任务管理** - 支持创作任务的状态流转（草稿→大纲→创作中→已完成）
- **🤖 AI 内容生成** - 集成阿里云 Qwen3.5-plus，自动生成创作内容
- **📊 数据统计面板** - 实时展示任务统计、完成率、到期提醒
- **🔐 双重认证系统** - JWT Token + API Key 双重安全保障
- **🎨 毛玻璃设计** - 现代化 Glassmorphism UI，支持响应式布局
- **📱 移动端优化** - 完美支持手机和平板访问
- **🎨 主题切换** - 6 种蓝色系主题，一键随机切换

### 🚀 新增特性

- ✅ **扁平化图标系统** - 26+ 个自定义 SVG 线性图标
- ✅ **移动端底部导航** - 便捷的移动端操作体验
- ✅ **背景主题切换** - 点击随机切换不同蓝色主题
- ✅ **API Key 管理** - 创作平台专用 Key，独立管理
- ✅ **搜索和筛选** - 强大的任务搜索和状态筛选

---

## 📸 界面预览

### 仪表盘
![Dashboard](./screenshots/dashboard.png)
*实时查看任务统计和最近任务*

### 创作任务
![Creative Tasks](./screenshots/creative.png)
*AI 辅助创作，状态流转管理*

### 移动端
![Mobile](./screenshots/mobile.png)
*响应式设计，完美适配手机*

### 主题切换
![Themes](./screenshots/themes.png)
*6 种蓝色系主题，激发创作灵感*

---

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- MySQL/MariaDB >= 10.0
- npm 或 yarn

### 安装步骤

```bash
# 1. 克隆仓库
git clone <repository-url>
cd todo-platform

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的数据库和 API 配置

# 4. 初始化数据库
npx prisma generate
npx prisma db push

# 5. 启动后端服务
node backend/server.js

# 6. 启动前端开发服务器
npm run dev

# 7. 访问应用
# 浏览器打开：http://localhost:3457
```

### 生产环境部署

```bash
# 1. 构建前端
cd frontend
npm run build

# 2. 配置 Nginx 反向代理
# 参考：nginx.conf.example

# 3. 使用 PM2 守护进程
pm2 start npm --name "todo-frontend" -- run dev
pm2 start node --name "todo-backend" -- backend/server.js
pm2 save
pm2 startup
```

---

## 📖 使用指南

### 注册和登录

1. 访问 http://localhost:3457
2. 使用默认账号登录：
   - 用户名：`maydaychen`
   - 密码：`Admin@123456`
3. 登录后自动生成 API Key

### API Key 管理

1. 点击左侧导航栏 **⚙️ 设置**
2. 进入 **🔑 API Key 管理** 区域
3. 生成专用 Key：
   - **创作平台专用** - 用于创作平台调用
   - **通用 API Key** - 用于其他自动化脚本

### 创建任务

#### 日常任务
1. 点击 **📅 日常任务**
2. 点击 **➕ 新建任务**
3. 填写任务信息：
   - 标题（必填）
   - 描述
   - 优先级（低/中/高）
   - 截止日期
   - 分类
4. 点击 **创建**

#### 创作任务
1. 点击 **✍️ 创作任务**
2. 点击 **➕ 新建任务**
3. 选择创作类型：
   - 📱 小红书笔记
   - 📝 公众号文章
   - 🎬 视频脚本
   - 📊 数据分析
   - 💡 创意写作
4. 填写创作需求
5. 使用 **✨ AI 生成** 功能辅助创作

### AI 内容生成

1. 创建创作任务后，任务状态为 **💡 灵感收集**
2. 点击任务卡片上的 **✨** 按钮
3. 系统自动调用阿里云 Qwen 生成内容
4. 生成过程：
   - 💡 灵感收集 → 📝 大纲生成 → ✍️ 内容创作 → 📄 草稿完成
5. 查看和编辑生成的内容

### 主题切换

1. 点击头部导航栏的 **🎨 灵感蓝** 按钮
2. 每次点击随机切换到一个新的蓝色主题
3. 主题自动保存，刷新页面不丢失

**可用主题**：
- 灵感蓝
- 深海蓝
- 星空蓝
- 冰川蓝
- 午夜蓝
- 极光蓝

---

## 🏗️ 技术架构

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端 | Vue 3 | 3.4.x |
| 前端 | Vite | 5.4.x |
| 前端 | Pinia | 2.1.x |
| 前端 | Vue Router | 4.3.x |
| 前端 | Tailwind CSS | 3.4.x |
| 后端 | Node.js | 18+ |
| 后端 | Express | 4.18.x |
| 数据库 | Prisma ORM | 5.x |
| 数据库 | MySQL/MariaDB | 10.x |
| AI | 阿里云百炼 | Qwen3.5-plus |

### 项目结构

```
todo-platform/
├── backend/                # 后端服务
│   ├── server.js          # Express 服务器
│   ├── routes/            # API 路由
│   ├── middleware/        # 中间件
│   └── services/          # 业务逻辑
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── views/         # 页面
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── router/        # 路由配置
│   │   └── style.css      # 全局样式
│   └── index.html
├── prisma/                # 数据库配置
│   └── schema.prisma      # Prisma 模型
├── .env                   # 环境变量（不提交）
├── .env.example           # 环境变量示例
├── .gitignore            # Git 忽略文件
├── package.json          # 依赖配置
├── vite.config.js        # Vite 配置
└── docker-compose.yml    # Docker 配置
```

### API 接口

#### 认证
```
POST /api/auth/login          # 用户登录
POST /api/auth/generate-key   # 生成 API Key
GET  /api/auth/me             # 获取当前用户
```

#### 任务
```
GET    /api/tasks             # 获取任务列表
POST   /api/tasks             # 创建任务
GET    /api/tasks/:id         # 获取任务详情
PUT    /api/tasks/:id         # 更新任务
DELETE /api/tasks/:id         # 删除任务
GET    /api/tasks/stats       # 获取统计数据
```

#### AI 生成
```
POST /api/generate/article    # 生成文章
POST /api/generate/outline    # 生成大纲
POST /api/generate/ideas      # 生成创意
```

---

## 🎨 设计系统

### 配色方案

**主题色系**（动态切换）：
- 主色：`var(--theme-primary)` - 深蓝
- 辅色：`var(--theme-secondary)` - 中蓝
- 强调色：`var(--theme-accent)` - 亮蓝

**功能色**：
- 成功：`#38ef7d` - 绿色
- 警告：`#ffc107` - 黄色
- 危险：`#f45c43` - 红色
- 信息：`#3b82f6` - 蓝色

### 图标系统

**扁平化 SVG 图标**：
- 2px 线性描边
- 无填充色
- 简洁几何形状
- 可自定义大小

**图标库**：
- home, calendar, edit, settings
- search, refresh, plus, trash
- pencil, sparkles, check, clock
- palette, clipboard, rocket 等 26+ 个

### 毛玻璃效果

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

---

## 🔒 安全说明

### 环境变量

**敏感信息不提交**：
- `.env` 文件已加入 `.gitignore`
- 使用 `.env.example` 作为配置模板
- 生产环境使用独立配置

### 认证系统

**双重认证**：
- JWT Token - 用户会话认证
- API Key - API 调用认证
- 支持 Key 撤销和重新生成

### 数据库

**连接安全**：
- 使用环境变量存储数据库凭据
- 建议使用只读账号进行查询
- 定期备份数据库

### 最佳实践

1. **修改默认密码** - 首次登录后立即修改
2. **定期轮换 API Key** - 每 3-6 个月更换
3. **使用 HTTPS** - 生产环境必须启用
4. **限制 CORS** - 仅允许信任的域名
5. **监控日志** - 定期检查异常访问

---

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动后端（开发模式）
node backend/server.js

# 启动前端（热重载）
npm run dev

# 访问 http://localhost:3457
```

### 数据库迁移

```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送 schema 到数据库
npx prisma db push

# 创建迁移
npx prisma migrate dev --name init

# 查看数据库
npx prisma studio
```

### 构建生产版本

```bash
# 构建前端
cd frontend
npm run build

# 构建输出在 dist/ 目录
```

### 代码规范

```bash
# 代码格式化
npm run format

# 代码检查
npm run lint
```

---

## 📝 更新日志

### v1.0.0 (2026-03-05)

**初始版本**

- ✅ 完整的任务管理系统
- ✅ AI 内容生成功能
- ✅ 用户认证和 API Key 管理
- ✅ 毛玻璃设计风格
- ✅ 响应式布局
- ✅ 移动端优化
- ✅ 主题切换功能
- ✅ 扁平化图标系统

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [OpenClaw](https://github.com/openclaw/openclaw) - AI 助手框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [阿里云百炼](https://bailian.console.aliyun.com/) - AI 服务

---

**🎉 Happy Productivity!**
