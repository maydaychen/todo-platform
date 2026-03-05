# TODO Platform - 图标扁平化改造

**更新日期**: 2026-03-05  
**状态**: 🔄 进行中

---

## ✅ 已完成

### 1. 创建通用图标组件
- **文件**: `frontend/src/components/Icon.vue`
- **图标数量**: 20+ 个扁平化线性图标
- **特点**:
  - 2px 线性描边
  - 无填充色
  - 简洁几何形状
  - 可自定义大小和描边宽度

### 2. 移动端导航改造
- **文件**: `frontend/src/components/MobileNav.vue`
- **替换内容**:
  - 🏠 → `<Icon name="home" />`
  - 📅 → `<Icon name="calendar" />`
  - ✍️ → `<Icon name="edit" />`
  - ⚙️ → `<Icon name="settings" />`

---

## 📋 Emoji 到 SVG 映射表

| Emoji | 图标名称 | 用途 | 替换为 |
|-------|---------|------|--------|
| 📋 | clipboard | 项目 logo | `<Icon name="clipboard" />` |
| 🏠 | home | 首页/仪表盘 | `<Icon name="home" />` |
| 📅 | calendar | 日常任务/日历 | `<Icon name="calendar" />` |
| ✍️ | edit | 创作/编辑 | `<Icon name="edit" />` |
| ⚙️ | settings | 设置 | `<Icon name="settings" />` |
| 🔑 | key | API Key | `<Icon name="key" />` |
| 👤 | user | 用户/个人信息 | `<Icon name="user" />` |
| 🔒 | lock | 密码/安全 | `<Icon name="lock" />` |
| 🔍 | search | 搜索 | `<Icon name="search" />` |
| ➕ | plus | 添加/新建 | `<Icon name="plus" />` |
| 🔄 | refresh | 刷新 | `<Icon name="refresh" />` |
| 🗑️ | trash | 删除 | `<Icon name="trash" />` |
| ✏️ | pencil | 编辑 | `<Icon name="pencil" />` |
| ✨ | sparkles | AI 生成 | `<Icon name="sparkles" />` |
| 📊 | chart | 统计 | `<Icon name="chart" />` |
| 📝 | file-text | 文档/创作 | `<Icon name="file-text" />` |
| 📂 | folder | 文件夹/分类 | `<Icon name="folder" />` |
| 🌍 | globe | 全局 | `<Icon name="globe" />` |
| 💡 | lightbulb | 灵感 | `<Icon name="lightbulb" />` |
| 📄 | file | 文件/草稿 | `<Icon name="file" />` |
| ✅ | check | 完成 | `<Icon name="check" />` |
| ⏰ | clock | 时间/截止 | `<Icon name="clock" />` |
| 🛒 | cart | 购物 | `<Icon name="cart" />` |
| 🏷️ | tag | 标签 | `<Icon name="tag" />` |
| 💼 | briefcase | 工作 | `<Icon name="briefcase" />` |
| 📔 | book | 生活记录 | `<Icon name="book" />` |
| 📁 | folder | 数据管理 | `<Icon name="folder" />` |
| 📥 | download | 导出/下载 | `<Icon name="download" />` |
| 🚪 | logout | 退出 | `<Icon name="logout" />` |
| 💾 | database | 数据库 | `<Icon name="database" />` |
| 🚀 | rocket | 启动/提交 | `<Icon name="rocket" />` |
| 📋 | copy | 复制 | `<Icon name="copy" />` |
| 🚫 | revoke | 撤销 | `<Icon name="revoke" />` |

---

## 🔧 需要修改的文件

### Dashboard.vue
- [ ] Logo 图标
- [ ] 导航图标（🏠📅✍️⚙️）
- [ ] 操作图标（🔍🔄➕）
- [ ] 统计图标（📅⏰✍️✅）
- [ ] 任务操作（✏️✨🗑️）

### DailyTasks.vue
- [ ] 导航图标
- [ ] 操作图标
- [ ] 任务图标

### CreativeTasks.vue
- [ ] 导航图标
- [ ] 状态图标（💡📝📄✅）
- [ ] 操作图标

### Settings.vue
- [ ] 导航图标
- [ ] 设置项图标（👤🔒🔑💾🚪）

### Login.vue
- [ ] Logo 图标
- [ ] 表单图标（👤🔒）

---

## 📐 图标使用规范

### 基本用法
```vue
<Icon name="home" :size="20" />
```

### 常用尺寸
- **小图标**: `:size="16"` - 按钮内、标签旁
- **中图标**: `:size="20"` - 导航、列表
- **大图标**: `:size="24"` - 卡片标题
- **超大图标**: `:size="48"` - 空状态、加载

### 描边宽度
- **默认**: `stroke-width="2"`（大多数情况）
- **粗体**: `stroke-width="2.5"` - 强调
- **细体**: `stroke-width="1.5"` - 精致

---

## 🎨 配色方案

### 图标颜色继承
```css
.icon {
  color: currentColor; /* 继承父元素文字颜色 */
}
```

### 状态颜色
| 状态 | 颜色 | 用途 |
|------|------|------|
| 默认 | `rgba(255,255,255,0.5)` | 未激活 |
| Hover | `rgba(255,255,255,0.7)` | 悬停 |
| 激活 | `#3b82f6` | 当前页面 |
| 成功 | `#38ef7d` | 完成状态 |
| 警告 | `#ffc107` | 中等优先级 |
| 危险 | `#f45c43` | 删除/高优先级 |

---

## 🚀 批量替换脚本

```bash
# 查找所有使用 emoji 的 Vue 文件
grep -r "📋\|🏠\|📅\|✍️\|⚙️" frontend/src --include="*.vue"

# 统计需要替换的数量
grep -r "📋\|🏠\|📅\|✍️\|⚙️" frontend/src --include="*.vue" | wc -l
```

---

## 📝 改造步骤

1. **创建图标组件** ✅
2. **更新移动端导航** ✅
3. **更新侧边栏导航** ⏳
4. **更新所有页面图标** ⏳
5. **测试所有页面** ⏳
6. **清理 emoji 使用** ⏳

---

**改造者**: Haro 🤖  
**进度**: 10% (2/20 文件)
