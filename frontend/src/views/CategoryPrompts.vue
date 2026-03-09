<template>
  <div class="category-prompts">
    <!-- 侧边栏 -->
    <aside class="sidebar glass">
      <div class="logo">
        <Icon name="clipboard" :size="32" />
        <span>TODO Platform</span>
      </div>
      
      <nav class="nav-section">
        <div class="nav-title">导航</div>
        <router-link to="/dashboard" class="nav-item">
          <Icon name="home" :size="20" />
          <span>仪表盘</span>
        </router-link>
        <router-link to="/daily" class="nav-item">
          <Icon name="calendar" :size="20" />
          <span>日常任务</span>
        </router-link>
        <router-link to="/creative" class="nav-item">
          <Icon name="edit" :size="20" />
          <span>创作任务</span>
        </router-link>
      </nav>
      
      <nav class="nav-section">
        <div class="nav-title">其他</div>
        <router-link to="/settings" class="nav-item">
          <Icon name="settings" :size="20" />
          <span>设置</span>
        </router-link>
        <router-link to="/ai" class="nav-item">
          <Icon name="sparkles" :size="20" />
          <span>AI 配置</span>
        </router-link>
        <router-link to="/categories" class="nav-item">
          <Icon name="tag" :size="20" />
          <span>分类管理</span>
        </router-link>
        <router-link to="/category-prompts" class="nav-item active">
          <Icon name="file" :size="20" />
          <span>分类提示词</span>
        </router-link>
      </nav>
    </aside>
    
    <!-- 主内容区 -->
    <main class="main-content">
      <header class="header glass">
        <div class="header-left">
          <h1 class="page-title">
            <Icon name="file" :size="24" style="vertical-align: middle; margin-right: 8px;" />
            分类提示词
          </h1>
        </div>
      </header>
      
      <!-- 说明卡片 -->
      <section class="info-section glass-card">
        <div class="info-content">
          <Icon name="lightbulb" :size="24" style="color: var(--theme-accent);" />
          <div>
            <h3>💡 提示词的作用</h3>
            <p>
              为不同分类配置专用提示词，让 AI 生成内容更符合该分类的特点。
              例如："母婴"分类可以配置育儿相关的提示词，"技术博客"分类可以配置技术写作风格的提示词。
            </p>
          </div>
        </div>
      </section>
      
      <!-- 提示词列表 -->
      <section class="prompts-section">
        <div v-if="loading" class="loading-state">
          <Icon name="refresh" :size="48" class="loading-spinner" style="animation: spin 1s linear infinite;" />
          <p>加载中...</p>
        </div>
        
        <div v-else-if="categories.length === 0" class="empty-state">
          <Icon name="file" :size="64" class="empty-state-icon" />
          <h3>暂无创作任务分类</h3>
          <p>请先在"分类管理"中创建创作任务分类</p>
          <button class="btn btn-primary" @click="$router.push('/categories')">
            <Icon name="plus" :size="18" />
            去创建分类
          </button>
        </div>
        
        <div v-else class="prompts-grid">
          <div 
            v-for="category in categories" 
            :key="category.id" 
            class="prompt-card glass-card"
          >
            <div class="prompt-header">
              <div class="category-info">
                <span class="category-icon">{{ category.icon }}</span>
                <div>
                  <h3>{{ category.name }}</h3>
                  <span class="task-count">{{ category._count?.tasks || 0 }} 个任务</span>
                </div>
              </div>
              <button 
                class="btn btn-primary btn-sm" 
                @click="editPrompt(category)"
                :disabled="editingId === category.id"
              >
                <Icon name="pencil" :size="16" />
                {{ editingId === category.id ? '保存中...' : (hasPrompt(category.id) ? '编辑' : '配置') }}
              </button>
            </div>
            
            <div v-if="editingId === category.id" class="prompt-editor">
              <label class="editor-label">
                <Icon name="file" :size="16" />
                提示词
              </label>
              <textarea 
                v-model="editingPrompt"
                class="form-textarea"
                rows="6"
                placeholder="例如：你是一位专业的母婴领域内容创作者，请用温暖、专业的语气撰写内容..."
              ></textarea>
              <div class="editor-actions">
                <button class="btn btn-glass btn-sm" @click="cancelEdit">取消</button>
                <button class="btn btn-primary btn-sm" @click="savePrompt(category.id)" :disabled="saving">
                  {{ saving ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>
            
            <div v-else class="prompt-preview">
              <div v-if="category.prompt" class="prompt-text">{{ category.prompt }}</div>
              <div v-else class="no-prompt">
                <Icon name="sparkles" :size="20" />
                <span>暂无提示词，点击"配置"添加</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <!-- 自定义消息提示 -->
    <div v-if="showMessage" class="toast-container">
      <div class="toast" :class="`toast-${messageType}`">
        <Icon :name="messageType === 'success' ? 'check' : messageType === 'error' ? 'trash' : 'sparkles'" :size="20" />
        <span>{{ messageText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const categories = ref([])
const editingId = ref(null)
const editingPrompt = ref('')

// 消息提示
const showMessage = ref(false)
const messageText = ref('')
const messageType = ref('success')

const showToast = (text, type = 'info') => {
  messageText.value = text
  messageType.value = type
  showMessage.value = true
  setTimeout(() => {
    showMessage.value = false
  }, 3000)
}

const hasPrompt = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category && category.prompt && category.prompt.trim().length > 0
}

const fetchCategories = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('todo_token')
    const response = await fetch('/api/categories', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      // 只保留创作任务分类
      categories.value = data.data.filter(c => c.type === 'CREATIVE')
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    showToast('获取分类失败', 'error')
  } finally {
    loading.value = false
  }
}

const editPrompt = (category) => {
  editingId.value = category.id
  editingPrompt.value = category.prompt || ''
}

const cancelEdit = () => {
  editingId.value = null
  editingPrompt.value = ''
}

const savePrompt = async (categoryId) => {
  try {
    saving.value = true
    const token = localStorage.getItem('todo_token')
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: editingPrompt.value.trim()
      })
    })
    
    const data = await response.json()
    if (data.success) {
      showToast('提示词保存成功', 'success')
      // 更新本地数据
      const index = categories.value.findIndex(c => c.id === categoryId)
      if (index !== -1) {
        categories.value[index].prompt = editingPrompt.value.trim()
      }
      cancelEdit()
    } else {
      showToast('保存失败：' + data.error, 'error')
    }
  } catch (error) {
    console.error('保存提示词失败:', error)
    showToast('保存失败', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.category-prompts {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

.sidebar {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.logo :deep(.icon) {
  flex-shrink: 0;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.nav-item.active {
  background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
  color: #ffffff;
}

.info-section {
  padding: 20px;
  margin-bottom: 24px;
}

.info-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.info-content h3 {
  margin: 0 0 8px 0;
  font-size: 1rem;
}

.info-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.6;
}

.main-content {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

.header {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
}

.prompts-section {
  flex: 1;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state-icon {
  opacity: 0.3;
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.8);
}

.empty-state p {
  margin: 0 0 24px 0;
  color: rgba(255, 255, 255, 0.5);
}

.prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.prompt-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.category-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.category-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.category-info h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
}

.task-count {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.875rem;
}

.prompt-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editor-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--theme-accent);
  background: rgba(255, 255, 255, 0.08);
}

.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.editor-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.prompt-preview {
  min-height: 100px;
}

.prompt-text {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  white-space: pre-wrap;
  word-break: break-word;
}

.no-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: rgba(255, 255, 255, 0.4);
  gap: 8px;
}

/* 自定义消息提示 */
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: rgba(15, 12, 41, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 500;
  animation: slideIn 0.3s ease;
  min-width: 300px;
}

.toast-success {
  border-color: rgba(56, 239, 125, 0.5);
}

.toast-success :deep(.icon) {
  color: #38ef7d;
}

.toast-error {
  border-color: rgba(244, 92, 67, 0.5);
}

.toast-error :deep(.icon) {
  color: #f45c43;
}

.toast-info {
  border-color: rgba(59, 130, 246, 0.5);
}

.toast-info :deep(.icon) {
  color: var(--theme-accent);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .category-prompts {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: none;
  }
  
  .prompts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
