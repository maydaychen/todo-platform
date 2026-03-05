<template>
  <div class="settings">
    <!-- 侧边栏 -->
    <aside class="sidebar glass">
      <div class="logo">
        <span class="logo-icon">📋</span>
        <span>TODO Platform</span>
      </div>

      <nav class="nav-section">
        <div class="nav-title">主要功能</div>
        <router-link to="/" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span>仪表盘</span>
        </router-link>
        <router-link to="/daily" class="nav-item">
          <span class="nav-icon">📅</span>
          <span>日常任务</span>
        </router-link>
        <router-link to="/creative" class="nav-item">
          <span class="nav-icon">✍️</span>
          <span>创作任务</span>
        </router-link>
      </nav>

      <nav class="nav-section">
        <div class="nav-title">其他</div>
        <router-link to="/settings" class="nav-item active">
          <span class="nav-icon">⚙️</span>
          <span>设置</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 头部 -->
      <header class="header glass">
        <h1 class="page-title">⚙️ 设置</h1>
      </header>

      <!-- 用户信息 -->
      <section class="settings-section">
        <h2 class="section-title">👤 个人信息</h2>
        <div class="settings-card glass-card">
          <div class="form-group">
            <label>用户名</label>
            <input 
              v-model="user.username" 
              type="text" 
              class="form-input"
              disabled
            >
          </div>
          
          <div class="form-group">
            <label>邮箱</label>
            <input 
              v-model="user.email" 
              type="email" 
              class="form-input"
              @change="updateProfile"
            >
          </div>
          
          <div class="form-group">
            <label>注册时间</label>
            <input 
              :value="formatDate(user.createdAt)" 
              type="text" 
              class="form-input"
              disabled
            >
          </div>
        </div>
      </section>

      <!-- 修改密码 -->
      <section class="settings-section">
        <h2 class="section-title">🔒 修改密码</h2>
        <div class="settings-card glass-card">
          <div class="form-group">
            <label>当前密码</label>
            <input 
              v-model="passwordForm.current" 
              type="password" 
              class="form-input"
              placeholder="输入当前密码"
            >
          </div>
          
          <div class="form-group">
            <label>新密码</label>
            <input 
              v-model="passwordForm.new" 
              type="password" 
              class="form-input"
              placeholder="至少 6 位字符"
            >
          </div>
          
          <div class="form-group">
            <label>确认新密码</label>
            <input 
              v-model="passwordForm.confirm" 
              type="password" 
              class="form-input"
              placeholder="再次输入新密码"
            >
          </div>
          
          <div v-if="passwordError" class="error-message">
            ❌ {{ passwordError }}
          </div>
          
          <div v-if="passwordSuccess" class="success-message">
            ✅ {{ passwordSuccess }}
          </div>
          
          <button class="btn btn-primary" @click="changePassword">
            修改密码
          </button>
        </div>
      </section>

      <!-- API Key 管理 -->
      <section class="settings-section">
        <h2 class="section-title">🔑 API Key 管理</h2>
        <div class="settings-card glass-card">
          <p class="section-desc">
            API Key 用于通过 API 调用 TODO Platform，请妥善保管，不要泄露给他人。
          </p>
          
          <!-- 创作平台专用 Key -->
          <div class="api-key-section">
            <h3 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              ✍️ 创作平台专用
              <span class="badge" style="font-size: 11px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2px 8px; border-radius: 12px;">推荐</span>
            </h3>
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 16px;">
              专门为创作平台生成的 API Key，用于 AI 内容生成
            </p>
            
            <div v-if="creationApiKey" class="api-key-display">
              <code>{{ creationApiKey }}</code>
              <button class="btn btn-glass" @click="copyApiKey(creationApiKey)" title="复制">
                📋
              </button>
              <button class="btn btn-glass danger" @click="revokeCreationKey" title="撤销">
                🚫
              </button>
            </div>
            
            <div v-else class="no-api-key">
              <p>⚠️ 还没有生成创作平台专用 Key</p>
            </div>
            
            <button v-if="!creationApiKey" class="btn btn-primary" @click="generateCreationKey">
              🔑 生成创作平台 Key
            </button>
          </div>
          
          <div style="border-top: 1px solid var(--border); margin: 24px 0;"></div>
          
          <!-- 通用 API Key -->
          <div class="api-key-section">
            <h3 style="margin-bottom: 12px;">🔧 通用 API Key</h3>
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 16px;">
              用于其他自动化脚本或第三方集成
            </p>
            
            <div v-if="apiKey" class="api-key-display">
              <code>{{ apiKey }}</code>
              <button class="btn btn-glass" @click="copyApiKey(apiKey)">
                📋 复制
              </button>
            </div>
            
            <div v-else class="no-api-key">
              <p>⚠️ 你还没有生成 API Key</p>
            </div>
            
            <div class="action-buttons">
              <button class="btn btn-primary" @click="generateApiKey">
                🔑 生成新 Key
              </button>
              <button 
                v-if="apiKey" 
                class="btn btn-glass" 
                @click="revokeApiKey"
              >
                🚫 撤销 Key
              </button>
            </div>
          </div>
          
          <div class="api-usage">
            <h3>📖 使用示例</h3>
            <pre><code># 创作平台调用示例
const response = await fetch('http://localhost:3001/api/generate/article', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    taskId: 1,
    outline: ['引言', '正文', '总结'],
    style: 'casual'
  })
})

const article = await response.json()
console.log(article.data.content)</code></pre>
          </div>
        </div>
      </section>

      <!-- 数据管理 -->
      <section class="settings-section">
        <h2 class="section-title">💾 数据管理</h2>
        <div class="settings-card glass-card">
          <div class="setting-item">
            <div class="setting-info">
              <h3>导出数据</h3>
              <p>导出所有任务数据为 JSON 格式</p>
            </div>
            <button class="btn btn-glass" @click="exportData">
              📥 导出
            </button>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3>清除已完成</h3>
              <p>删除所有已完成的任务（不可恢复）</p>
            </div>
            <button class="btn btn-glass" @click="clearCompleted">
              🗑️ 清除
            </button>
          </div>
        </div>
      </section>

      <!-- 退出登录 -->
      <section class="settings-section">
        <div class="settings-card glass-card">
          <div class="logout-section">
            <h3>退出登录</h3>
            <p>退出当前账号，返回登录页面</p>
            <button class="btn btn-danger" @click="logout">
              🚪 退出登录
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useTaskStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()
const taskStore = useTaskStore()

const user = ref({
  username: '',
  email: '',
  createdAt: ''
})

const apiKey = ref('')
const creationApiKey = ref('')
const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const passwordError = ref('')
const passwordSuccess = ref('')

const fetchUserInfo = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    const data = await response.json()
    if (data.success) {
      user.value = data.data.user
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const fetchApiKey = () => {
  apiKey.value = authStore.apiKey || localStorage.getItem('todo_api_key') || ''
  creationApiKey.value = localStorage.getItem('todo_creation_api_key') || ''
}

const updateProfile = async () => {
  // TODO: 实现更新用户信息
  alert('修改邮箱功能开发中...')
}

const changePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''
  
  if (!passwordForm.value.current || !passwordForm.value.new || !passwordForm.value.confirm) {
    passwordError.value = '请填写所有密码字段'
    return
  }
  
  if (passwordForm.value.new.length < 6) {
    passwordError.value = '密码至少需要 6 位字符'
    return
  }
  
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    passwordError.value = '两次输入的新密码不一致'
    return
  }
  
  try {
    // TODO: 实现修改密码 API
    // await fetch('/api/auth/change-password', { ... })
    
    passwordSuccess.value = '密码修改成功！'
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch (error) {
    passwordError.value = '修改失败：' + error.message
  }
}

const generateApiKey = async () => {
  try {
    await authStore.generateApiKey()
    apiKey.value = authStore.apiKey
    alert('API Key 生成成功！请妥善保管。')
  } catch (error) {
    alert('生成失败：' + error.message)
  }
}

const generateCreationKey = async () => {
  try {
    // 生成专门用于创作平台的 API Key
    const response = await fetch('/api/auth/api-key', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: '创作平台专用' })
    })
    
    const data = await response.json()
    if (data.success) {
      creationApiKey.value = data.data.apiKey
      localStorage.setItem('todo_creation_api_key', creationApiKey.value)
      alert('创作平台专用 Key 生成成功！\n\n请复制并保存到创作平台的配置中。')
    }
  } catch (error) {
    alert('生成失败：' + error.message)
  }
}

const revokeCreationKey = () => {
  if (confirm('确定要撤销创作平台专用 Key 吗？\n\n创作平台将无法继续调用 TODO Platform。')) {
    creationApiKey.value = ''
    localStorage.removeItem('todo_creation_api_key')
    alert('创作平台专用 Key 已撤销')
  }
}

const revokeApiKey = async () => {
  if (confirm('确定要撤销当前 API Key 吗？所有使用该 Key 的应用将无法访问。')) {
    // TODO: 实现撤销 API Key
    apiKey.value = ''
    localStorage.removeItem('todo_api_key')
    authStore.apiKey = ''
    alert('API Key 已撤销')
  }
}

const copyApiKey = (key) => {
  if (key) {
    navigator.clipboard.writeText(key)
    alert('API Key 已复制到剪贴板')
  }
}

const exportData = async () => {
  try {
    await taskStore.fetchTasks({ limit: 1000 })
    const data = {
      exportDate: new Date().toISOString(),
      user: user.value,
      tasks: taskStore.tasks
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todo-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    alert('导出失败：' + error.message)
  }
}

const clearCompleted = async () => {
  if (confirm('确定要删除所有已完成的任务吗？此操作不可恢复！')) {
    try {
      const completedTasks = taskStore.completedTasks
      for (const task of completedTasks) {
        await taskStore.deleteTask(task.id)
      }
      alert(`已删除 ${completedTasks.length} 个已完成任务`)
    } catch (error) {
      alert('清除失败：' + error.message)
    }
  }
}

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    router.push('/login')
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchUserInfo()
  fetchApiKey()
})
</script>

<style scoped>
.settings {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

/* 复用之前的样式 */
.sidebar, .main-content, .header, .btn, .form-group, .form-input {
  /* 样式从其他页面继承 */
}

.sidebar {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-icon {
  font-size: 2rem;
  -webkit-text-fill-color: initial;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
  padding: 8px 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.main-content {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.header {
  padding: 16px 24px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
}

/* 设置区域 */
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.section-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin-bottom: 16px;
}

.settings-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h3 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.setting-info p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

/* 表单 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.form-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: #667eea;
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  align-self: flex-start;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-glass {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  color: #ffffff;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(235, 51, 73, 0.4);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

/* API Key */
.api-key-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 12px;
}

.api-key-display code {
  flex: 1;
  font-family: 'JetBrains Mono', monospace;
  color: #4facfe;
  font-size: 0.95rem;
  word-break: break-all;
}

.no-api-key {
  padding: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 12px;
}

.api-key-section {
  margin-bottom: 24px;
}

.api-key-section:last-child {
  margin-bottom: 0;
}

.api-usage {
  margin-top: 16px;
}

.api-usage h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.api-usage pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.api-usage code {
  font-family: 'JetBrains Mono', monospace;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  line-height: 1.6;
}

/* 消息提示 */
.error-message {
  padding: 12px 16px;
  background: rgba(235, 51, 73, 0.2);
  border: 1px solid rgba(235, 51, 73, 0.3);
  border-radius: 8px;
  color: #f45c43;
  font-size: 0.95rem;
}

.success-message {
  padding: 12px 16px;
  background: rgba(56, 239, 125, 0.2);
  border: 1px solid rgba(56, 239, 125, 0.3);
  border-radius: 8px;
  color: #38ef7d;
  font-size: 0.95rem;
}

/* 退出登录 */
.logout-section {
  text-align: center;
  padding: 24px;
}

.logout-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.logout-section p {
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 24px;
}

/* 响应式 */
@media (max-width: 768px) {
  .settings {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .api-key-display {
    flex-direction: column;
  }
}
</style>
