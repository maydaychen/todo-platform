# 创作平台集成指南

**更新日期**: 2026-03-04  
**版本**: v1.0.0

---

## 🎯 集成场景

创作平台需要调用 TODO Platform 的 AI 生成功能：
- 生成文章大纲
- 生成完整文章
- 扩写/润色内容

---

## 🔑 第一步：获取 API Key

### 1. 登录 TODO Platform
访问：http://localhost:3457  
账号：maydaychen / Admin@123456

### 2. 进入设置页面
点击左侧导航栏的 **⚙️ 设置**

### 3. 生成创作平台专用 Key
在 **API Key 管理** 区域：
1. 找到 **✍️ 创作平台专用** 部分
2. 点击 **🔑 生成创作平台 Key**
3. 复制生成的 API Key

```
示例：todo_sk_MTc3MjYzODM1My0x
```

### 4. 保存到创作平台
将 API Key 配置到创作平台的环境变量或配置文件中：

```bash
# 创作平台的 .env 文件
TODO_API_KEY=todo_sk_MTc3MjYzODM1My0x
TODO_API_URL=http://localhost:3001/api
```

---

## 📖 API 调用示例

### 1. 生成文章大纲

```javascript
// 创作平台调用示例
async function generateOutline(title, category = '') {
  const response = await fetch(`${TODO_API_URL}/generate/outline`, {
    method: 'POST',
    headers: {
      'X-API-Key': TODO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title,
      category: category
    })
  })
  
  const data = await response.json()
  
  if (data.success) {
    return data.data.outline // ['引言', '第一章', '第二章', '总结']
  } else {
    throw new Error(data.error)
  }
}

// 使用
const outline = await generateOutline(
  'OpenClaw 自动化心得分享',
  '技术博客'
)
console.log(outline)
```

### 2. 生成完整文章

```javascript
async function generateArticle(taskId, outline, style = 'casual') {
  const response = await fetch(`${TODO_API_URL}/generate/article`, {
    method: 'POST',
    headers: {
      'X-API-Key': TODO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      taskId: taskId,
      outline: outline,
      style: style,
      wordCount: 2000
    })
  })
  
  const data = await response.json()
  
  if (data.success) {
    return {
      title: data.data.title,
      content: data.data.content,
      wordCount: data.data.wordCount
    }
  } else {
    throw new Error(data.error)
  }
}

// 使用
const article = await generateArticle(
  1, // taskId
  ['引言', '安装配置', '使用场景', '总结'],
  'casual',
  2000
)
console.log(article.content)
```

### 3. 扩写/润色

```javascript
async function expandContent(text, action = 'expand') {
  const response = await fetch(`${TODO_API_URL}/generate/expand`, {
    method: 'POST',
    headers: {
      'X-API-Key': TODO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      action: action // 'expand', 'polish', 'summarize'
    })
  })
  
  const data = await response.json()
  
  if (data.success) {
    return data.data.result
  } else {
    throw new Error(data.error)
  }
}

// 使用
const expanded = await expandContent(
  '这是一段简短的内容',
  'expand'
)
console.log(expanded)
```

---

## 🔌 完整集成代码

### Python 示例

```python
import requests

TODO_API_URL = 'http://localhost:3001/api'
TODO_API_KEY = 'todo_sk_MTc3MjYzODM1My0x'

headers = {
    'X-API-Key': TODO_API_KEY,
    'Content-Type': 'application/json'
}

def generate_outline(title, category=''):
    """生成文章大纲"""
    response = requests.post(
        f'{TODO_API_URL}/generate/outline',
        headers=headers,
        json={'title': title, 'category': category}
    )
    data = response.json()
    
    if data['success']:
        return data['data']['outline']
    else:
        raise Exception(data['error'])

def generate_article(task_id, outline, style='casual'):
    """生成完整文章"""
    response = requests.post(
        f'{TODO_API_URL}/generate/article',
        headers=headers,
        json={
            'taskId': task_id,
            'outline': outline,
            'style': style,
            'wordCount': 2000
        }
    )
    data = response.json()
    
    if data['success']:
        return data['data']
    else:
        raise Exception(data['error'])

# 使用示例
outline = generate_outline('OpenClaw 自动化心得', '技术博客')
print('大纲:', outline)

article = generate_article(1, outline, 'casual')
print('文章:', article['content'])
```

### Node.js 示例

```javascript
const TODO_API_URL = 'http://localhost:3001/api';
const TODO_API_KEY = 'todo_sk_MTc3MjYzODM1My0x';

async function generateOutline(title, category = '') {
  const response = await fetch(`${TODO_API_URL}/generate/outline`, {
    method: 'POST',
    headers: {
      'X-API-Key': TODO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, category })
  });
  
  const data = await response.json();
  
  if (data.success) {
    return data.data.outline;
  } else {
    throw new Error(data.error);
  }
}

async function generateArticle(taskId, outline, style = 'casual') {
  const response = await fetch(`${TODO_API_URL}/generate/article`, {
    method: 'POST',
    headers: {
      'X-API-Key': TODO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      taskId,
      outline,
      style,
      wordCount: 2000
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.error);
  }
}

// 使用示例
(async () => {
  const outline = await generateOutline('OpenClaw 自动化心得', '技术博客');
  console.log('大纲:', outline);
  
  const article = await generateArticle(1, outline, 'casual');
  console.log('文章:', article.content);
})();
```

---

## 📊 API 响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    "outline": ["引言", "正文", "总结"],
    "fullText": "..."
  },
  "message": "大纲生成成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "AI 生成失败：API Key 无效"
}
```

---

## 🔐 安全建议

### 1. 专用 Key
- ✅ 为创作平台生成**专用 API Key**
- ✅ 与通用 API Key 分开管理
- ✅ 便于撤销和追踪

### 2. 环境变量
```bash
# ✅ 正确：使用环境变量
TODO_API_KEY=${process.env.TODO_API_KEY}

# ❌ 错误：硬编码在代码中
const API_KEY = 'todo_sk_...'
```

### 3. 访问控制
- 限制 API Key 的权限（后续可添加）
- 设置调用频率限制
- 记录 API 调用日志

### 4. 定期轮换
- 定期更换 API Key
- 撤销不再使用的 Key
- 监控异常调用

---

## 🐛 常见问题

### Q1: API Key 无效
**原因**: Key 错误或已撤销  
**解决**: 重新生成并复制正确的 Key

### Q2: 跨域错误
**原因**: 浏览器 CORS 限制  
**解决**: 
- 后端已配置 CORS
- 确保访问地址正确
- 使用服务器端调用（不是浏览器）

### Q3: 调用失败
**原因**: 网络问题或服务未启动  
**解决**:
```bash
# 检查后端服务
curl http://localhost:3001/health

# 检查 API Key
curl -H "X-API-Key: YOUR_KEY" http://localhost:3001/api/tasks
```

---

## 📚 完整 API 文档

查看：`REQUIREMENTS.md` - API 设计章节

---

**集成者**: Haro 🤖  
**状态**: ✅ 可以开始集成
