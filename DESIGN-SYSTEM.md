# TODO Platform 设计系统文档

**版本**: v1.0.0  
**风格**: Glassmorphism (毛玻璃)  
**创建日期**: 2026-03-04  
**设计工具**: UI-UX-Pro-Max Skill

---

## 🎨 设计系统概览

### 设计理念
- **透明感**: 毛玻璃效果营造轻盈、现代的视觉体验
- **层次感**: 通过模糊度和透明度区分层级
- **沉浸感**: 深色背景 + 渐变色彩，减少视觉疲劳
- **科技感**: 符合技术类产品的调性

---

## 🌈 色彩系统

### 主色板

| 色彩类型 | 名称 | 色值/渐变 | 使用场景 |
|---------|------|----------|---------|
| **Primary** | 蓝紫渐变 | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | 主按钮、激活状态、品牌色 |
| **Daily** | 天空蓝渐变 | `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)` | 日常任务标识、工作分类 |
| **Creative** | 紫罗兰渐变 | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | 创作任务标识、创意分类 |
| **Success** | 翡翠绿渐变 | `linear-gradient(135deg, #11998e 0%, #38ef7d 100%)` | 完成状态、成功提示 |
| **Danger** | 珊瑚红渐变 | `linear-gradient(135deg, #eb3349 0%, #f45c43 100%)` | 删除、警告、高优先级 |
| **Warning** | 琥珀黄 | `#ffc107` | 中等优先级、提醒 |

### 背景系统

| 层级 | 名称 | 色值 | 使用场景 |
|------|------|------|---------|
| **BG-1** | 深色渐变 | `linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)` | 页面主背景 |
| **BG-2** | 毛玻璃基础 | `rgba(255, 255, 255, 0.1)` | 卡片、容器背景 |
| **BG-3** | 毛玻璃悬浮 | `rgba(255, 255, 255, 0.15)` | 悬浮态、Hover 态 |
| **BG-4** | 毛玻璃边框 | `rgba(255, 255, 255, 0.2)` | 边框、分割线 |

### 文字系统

| 层级 | 名称 | 色值 | 使用场景 |
|------|------|------|---------|
| **Text-1** | 主文字 | `#ffffff` | 标题、重要内容 |
| **Text-2** | 次要文字 | `rgba(255, 255, 255, 0.7)` | 正文、描述 |
| **Text-3** | 弱化文字 | `rgba(255, 255, 255, 0.5)` | 占位符、辅助信息 |

---

## 🔤 字体系统

### 字体栈

```css
font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
```

### 字号阶梯

| 用途 | 字号 | 字重 | 行高 |
|------|------|------|------|
| 超大标题 | 2rem (32px) | 700 | 1.4 |
| 大标题 | 1.75rem (28px) | 700 | 1.4 |
| 标题 | 1.25rem (20px) | 600 | 1.5 |
| 副标题 | 1.05rem (17px) | 500 | 1.5 |
| 正文 | 1rem (16px) | 400 | 1.6 |
| 小字 | 0.875rem (14px) | 400 | 1.5 |
| 辅助文字 | 0.75rem (12px) | 400/600 | 1.4 |

### 字重使用规范

| 字重 | 数值 | 使用场景 |
|------|------|---------|
| Light | 300 | 大段文字（可选） |
| Regular | 400 | 正文、描述 |
| Medium | 500 | 标题、按钮文字 |
| SemiBold | 600 | 小标题、标签 |
| Bold | 700 | 主标题、强调 |

---

## 📐 间距系统

### 基础单位：4px

```
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
--spacing-3xl: 64px
```

### 使用规范

| 场景 | 间距 | 示例 |
|------|------|------|
| 元素内部紧凑 | 4px | 标签内边距 |
| 元素内部标准 | 8px | 按钮内边距 |
| 相关元素间距 | 16px | 卡片内元素间距 |
| 区块间距 | 24px | 章节间距 |
| 大区块间距 | 32px | 主要模块间距 |

---

## 🔲 圆角系统

| 级别 | 数值 | 使用场景 |
|------|------|---------|
| 小圆角 | 4px | 标签、小按钮 |
| 中圆角 | 8px | 按钮、输入框 |
| 大圆角 | 12px | 卡片内元素 |
| 超大圆角 | 16px | 主卡片、容器 |
| 圆形 | 50% | 头像、复选框 |

---

## ✨ 效果系统

### 毛玻璃效果（核心）

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

### 阴影层级

| 层级 | 阴影值 | 使用场景 |
|------|--------|---------|
| 轻阴影 | `0 2px 8px rgba(0,0,0,0.1)` | 悬浮元素 |
| 中阴影 | `0 4px 16px rgba(0,0,0,0.15)` | 卡片 |
| 重阴影 | `0 8px 32px rgba(31,38,135,0.37)` | 毛玻璃卡片 |
| 悬浮阴影 | `0 12px 48px rgba(0,0,0,0.25)` | 模态框、下拉菜单 |

### 渐变按钮

```css
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 8px 24px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
```

### 悬浮效果

```css
.glass-card {
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}
```

---

## 🎭 组件样式规范

### 任务卡片

```css
.task-card {
  padding: 24px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: start;
  border-left: 4px solid; /* 日常：#4facfe, 创作：#667eea */
}

.task-card.daily {
  border-left-color: #4facfe;
}

.task-card.creative {
  border-left-color: #667eea;
}
```

### 状态标签

```css
/* 创作状态 */
.status-idea {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.status-outline {
  background: rgba(79, 172, 254, 0.2);
  color: #4facfe;
}

.status-draft {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-done {
  background: rgba(56, 239, 125, 0.2);
  color: #38ef7d;
}

/* 优先级 */
.priority-high {
  background: rgba(235, 51, 73, 0.2);
  color: #f45c43;
}

.priority-medium {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.priority-low {
  background: rgba(56, 239, 125, 0.2);
  color: #38ef7d;
}
```

### 复选框

```css
.task-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-checkbox:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.2);
}

.task-checkbox.checked {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-color: transparent;
}

.task-checkbox.checked::after {
  content: '✓';
  color: white;
  font-weight: 700;
}
```

---

## 📱 响应式断点

| 断点 | 宽度 | 布局变化 |
|------|------|---------|
| Mobile | < 768px | 侧边栏隐藏，单列布局 |
| Tablet | 768px - 1024px | 侧边栏可折叠，双列布局 |
| Desktop | > 1024px | 完整双列布局 |

### 移动端适配要点

1. 侧边栏改为底部导航或汉堡菜单
2. 统计卡片改为单列
3. 任务卡片操作按钮常驻显示
4. 搜索框占满宽度

---

## 🎬 动画系统

### 入场动画

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-card {
  animation: fadeIn 0.3s ease;
}
```

### 过渡时间

| 类型 | 时间 | 使用场景 |
|------|------|---------|
| 快速 | 0.15s | 按钮 Hover、小图标 |
| 标准 | 0.2s | 常规交互 |
| 慢速 | 0.3s | 卡片、大元素 |
| 极慢 | 0.5s | 页面过渡 |

---

## ♿ 无障碍设计

### 对比度要求

- 主文字与背景：≥ 4.5:1 (WCAG AA)
- 大文字与背景：≥ 3:1
- 当前设计：白色文字 on 深色背景 = 16:1 ✅

### 键盘导航

- 所有交互元素可 Tab 聚焦
- 聚焦状态有明显视觉反馈
- 支持 Enter/Space 触发按钮

### 屏幕阅读器

- 图标按钮添加 `aria-label`
- 状态变化有文字描述
- 表单元素有 `label` 关联

---

## 🎨 配色心理学

| 颜色 | 情感联想 | 在 TODO 中的运用 |
|------|---------|----------------|
| 蓝紫渐变 | 专业、创意、科技感 | 主品牌色、创作任务 |
| 天空蓝 | 清新、日常、平静 | 日常任务 |
| 翡翠绿 | 完成、成功、安全 | 已完成状态 |
| 珊瑚红 | 紧急、重要、警告 | 高优先级、删除操作 |
| 琥珀黄 | 注意、中等、提醒 | 中优先级、草稿状态 |

---

## 📋 设计检查清单

### 视觉一致性

- [ ] 所有卡片使用统一的毛玻璃效果
- [ ] 渐变方向一致（135deg）
- [ ] 圆角大小统一（16px 主卡片，8px 按钮）
- [ ] 间距遵循 4px 基准

### 交互反馈

- [ ] 所有可点击元素有 Hover 态
- [ ] 按钮有 Active 态
- [ ] 加载状态有视觉反馈
- [ ] 错误状态有明显提示

### 响应式

- [ ] 移动端布局正常
- [ ] 触摸目标 ≥ 44px
- [ ] 文字在小屏幕可读
- [ ] 图片/图标适配不同分辨率

### 性能

- [ ] 毛玻璃效果不过度使用（影响性能）
- [ ] 动画有 `will-change` 优化
- [ ] 图片懒加载
- [ ] CSS 压缩

---

## 🔧 开发实现建议

### CSS 变量优先

所有设计 token 使用 CSS 变量，方便主题切换：

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --glass-bg: rgba(255, 255, 255, 0.1);
  /* ... */
}
```

### 深色模式准备

虽然当前设计是深色主题，但变量化后可以轻松扩展浅色模式：

```css
[data-theme="light"] {
  --bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  --glass-bg: rgba(0, 0, 0, 0.05);
  --text-primary: #1a1a1a;
  /* ... */
}
```

### Tailwind 配置（如使用）

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'daily-gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
}
```

---

## 📚 参考资源

### 设计灵感

- [Glassmorphism UI Design](https://dribbble.com/search/glassmorphism)
- [Dark UI Design](https://dribbble.com/search/dark%20ui)
- [Task Management UI](https://dribbble.com/search/task%20management)

### 工具

- [Coolors - 配色生成](https://coolors.co/)
- [WebGradients - 渐变背景](https://webgradients.com/)
- [Glassmorphism CSS Generator](https://glassmorphism.com/)

---

**文档状态**: 初稿完成  
**维护者**: Haro 🤖  
**下次更新**: 根据实际开发调整
