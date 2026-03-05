<template>
  <div class="creative-tasks">
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
        <router-link to="/creative" class="nav-item active">
          <span class="nav-icon">✍️</span>
          <span>创作任务</span>
        </router-link>
      </nav>

      <nav class="nav-section">
        <div class="nav-title">其他</div>
        <router-link to="/settings" class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span>设置</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 头部 -->
      <header class="header glass">
        <div class="header-left">
          <h1 class="page-title">✍️ 创作任务</h1>
          <div class="search-box glass">
            <span>🔍</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="search-input" 
              placeholder="搜索创作任务..."
              @keyup.enter="handleSearch"
            >
          </div>
        </div>
        <div class="header-right">
          <button class="btn btn-glass" @click="refreshData" title="刷新">
            🔄
          </button>
          <button class="btn btn-primary" @click="showNewTaskModal = true">
            <span>➕</span>
            <span>新建创作</span>
          </button>
        </div>
      </header>

      <!-- 状态筛选 -->
      <section class="status-tabs glass-card">
        <button 
          class="status-tab" 
          :class="{ active: statusFilter === 'all' }"
          @click="statusFilter = 'all'"
        >
          全部
        </button>
        <button 
          class="status-tab" 
          :class="{ active: statusFilter === 'idea' }"
          @click="statusFilter = 'idea'"
        >
          💡 灵感
        </button>
        <button 
          class="status-tab" 
          :class="{ active: statusFilter === 'outline' }"
          @click="statusFilter = 'outline'"
        >
          📝 大纲
        </button>
        <button 
          class="status-tab" 
          :class="{ active: statusFilter === 'draft' }"
          @click="statusFilter = 'draft'"
        >
          📄 草稿
        </button>
        <button 
          class="status-tab" 
          :class="{ active: statusFilter === 'done' }"
          @click="statusFilter = 'done'"
        >
          ✅ 完成
        </button>
      </section>

      <!-- 任务列表 -->
      <section class="tasks-section">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner">⏳</div>
          <p>加载中...</p>
        </div>

        <div v-else-if="filteredTasks.length === 0" class="empty-state">
          <div class="empty-state-icon">✍️</div>
          <div class="empty-state-title">还没有创作任务</div>
          <p>点击"新建创作"开始你的第一个创作项目吧！</p>
        </div>

        <div v-else class="task-list">
          <div 
            v-for="task in filteredTasks" 
            :key="task.id" 
            class="task-card glass-card"
          >
            <div class="task-content">
              <div class="task-header">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-status" :class="`status-${getTaskStatus(task)}`">
                  {{ statusText(getTaskStatus(task)) }}
                </div>
              </div>
              
              <div v-if="task.description" class="task-description">
                {{ task.description }}
              </div>
              
              <div v-if="hasOutline(task)" class="outline-preview">
                <div class="outline-label">📋 大纲</div>
                <div class="outline-items">
                  <span 
                    v-for="(item, index) in getOutline(task)" 
                    :key="index"
                    class="outline-item"
                  >
                    {{ item }}
                  </span>
                </div>
              </div>
              
              <div class="task-meta">
                <span class="task-tag">
                  📝 {{ task.category?.name || '未分类' }}
                </span>
                <span class="task-date">
                  📅 创建于 {{ formatDate(task.createdAt) }}
                </span>
              </div>
            </div>
            
            <div class="task-actions">
              <button class="task-action-btn" @click="editTask(task)" title="编辑">
                ✏️
              </button>
              <button 
                class="task-action-btn ai-btn" 
                @click="showGenerateModal(task)" 
                title="AI 生成"
              >
                ✨
              </button>
              <button class="task-action-btn delete" @click="deleteTask(task)" title="删除">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- AI 生成弹窗 -->
    <div v-if="showGenerate" class="modal-overlay" @click="showGenerate = false">
      <div class="modal glass" @click.stop>
        <div class="modal-header">
          <h2>✨ AI 辅助创作</h2>
          <button class="modal-close" @click="showGenerate = false">×</button>
        </div>
        
        <div class="modal-body">
          <div class="generate-options">
            <button 
              class="generate-option"
              @click="generateOutline"
              :disabled="generating"
            >
              <div class="option-icon">📝</div>
              <div class="option-title">生成大纲</div>
              <div class="option-desc">根据标题自动生成文章大纲</div>
            </button>
            
            <button 
              class="generate-option"
              @click="generateArticle"
              :disabled="generating || !hasOutline(selectedTask)"
            >
              <div class="option-icon">📄</div>
              <div class="option-title">生成全文</div>
              <div class="option-desc">根据大纲生成完整文章</div>
            </button>
            
            <button 
              class="generate-option"
              @click="expandContent"
              :disabled="generating"
            >
              <div class="option-icon">🔍</div>
              <div class="option-title">扩写润色</div>
              <div class="option-desc">对已有内容进行扩写和润色</div>
            </button>
          </div>
          
          <div v-if="generating" class="generating-state">
            <div class="generating-spinner">🤖</div>
            <p>AI 正在创作中，请稍候...</p>
          </div>
          
          <div v-if="generatedContent" class="generated-content">
            <h3>生成结果</h3>
            <div class="content-preview">{{ generatedContent }}</div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-glass" @click="showGenerate = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- 新建/编辑任务弹窗 -->
    <div v-if="showNewTaskModal" class="modal-overlay" @click="showNewTaskModal = false">
      <div class="modal glass" @click.stop>
        <div class="modal-header">
          <h2>{{ editingTask ? '编辑创作' : '新建创作' }}</h2>
          <button class="modal-close" @click="showNewTaskModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>标题 *</label>
            <input 
              v-model="newTask.title" 
              type="text" 
              class="form-input"
              placeholder="输入创作主题"
            >
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea 
              v-model="newTask.description" 
              class="form-input"
              rows="3"
              placeholder="创作思路、要点等（可选）"
            ></textarea>
          </div>

          <div class="form-group">
            <label>分类</label>
            <select v-model="newTask.categoryId" class="form-input">
              <option :value="null">无</option>
              <option v-for="cat in creativeCategories" :key="cat.id" :value="cat.id">
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-glass" @click="showNewTaskModal = false">取消</button>
          <button class="btn btn-primary" @click="saveTask" :disabled="!newTask.title">
            {{ editingTask ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore, useAuthStore } from '@/stores'

const taskStore = useTaskStore()
const authStore = useAuthStore()

const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const showNewTaskModal = ref(false)
const editingTask = ref(null)
const showGenerate = ref(false)
const selectedTask = ref(null)
const generating = ref(false)
const generatedContent = ref('')

const newTask = ref({
  title: '',
  description: '',
  categoryId: null
})

const creativeCategories = computed(() => {
  return [
    { id: 4, name: '技术博客', icon: '📝' },
    { id: 5, name: '生活记录', icon: '📔' }
  ]
})

const filteredTasks = computed(() => {
  let tasks = taskStore.creativeTasks
  
  // 状态筛选
  if (statusFilter.value !== 'all') {
    tasks = tasks.filter(t => getTaskStatus(t) === statusFilter.value)
  }
  
  // 搜索
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query))
    )
  }
  
  return tasks
})

const getTaskStatus = (task) => {
  if (task.metadata) {
    try {
      const meta = JSON.parse(task.metadata)
      if (meta.article) return 'done'
      if (meta.outline) return 'outline'
    } catch {}
  }
  
  if (task.status === 'completed') return 'done'
  if (task.status === 'in_progress') return 'draft'
  return 'idea'
}

const statusText = (status) => {
  const map = {
    idea: '💡 灵感',
    outline: '📝 大纲',
    draft: '📄 草稿',
    done: '✅ 完成'
  }
  return map[status] || status
}

const hasOutline = (task) => {
  if (task.metadata) {
    try {
      const meta = JSON.parse(task.metadata)
      return meta.outline && meta.outline.length > 0
    } catch {}
  }
  return false
}

const getOutline = (task) => {
  if (task.metadata) {
    try {
      const meta = JSON.parse(task.metadata)
      return meta.outline || []
    } catch {}
  }
  return []
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const fetchTasks = async () => {
  loading.value = true
  try {
    await taskStore.fetchTasks({ type: 'creative', limit: 100 })
  } catch (error) {
    console.error('获取任务失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchTasks()
}

const handleSearch = () => {
  // 搜索已经在 computed 中处理
}

const editTask = (task) => {
  editingTask.value = task
  newTask.value = {
    title: task.title,
    description: task.description || '',
    categoryId: task.categoryId
  }
  showNewTaskModal.value = true
}

const deleteTask = async (task) => {
  if (confirm(`确定要删除"${task.title}"吗？`)) {
    await taskStore.deleteTask(task.id)
  }
}

const saveTask = async () => {
  try {
    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value.id, newTask.value)
    } else {
      await taskStore.createTask({
        ...newTask.value,
        type: 'creative'
      })
    }
    
    showNewTaskModal.value = false
    editingTask.value = null
    newTask.value = { title: '', description: '', categoryId: null }
    fetchTasks()
  } catch (error) {
    alert('保存失败：' + error.message)
  }
}

const showGenerateModal = (task) => {
  selectedTask.value = task
  showGenerate.value = true
  generatedContent.value = ''
}

const generateOutline = async () => {
  if (!selectedTask.value) return
  
  generating.value = true
  try {
    const result = await taskStore.generateOutline(
      selectedTask.value.id,
      selectedTask.value.title
    )
    generatedContent.value = '大纲生成成功！\n\n' + result.outline.join('\n')
    fetchTasks()
  } catch (error) {
    alert('生成失败：' + error.message)
  } finally {
    generating.value = false
  }
}

const generateArticle = async () => {
  if (!selectedTask.value) return
  
  generating.value = true
  try {
    const outline = getOutline(selectedTask.value)
    const result = await taskStore.generateArticle(
      selectedTask.value.id,
      outline
    )
    generatedContent.value = result.content.substring(0, 500) + '...'
    fetchTasks()
  } catch (error) {
    alert('生成失败：' + error.message)
  } finally {
    generating.value = false
  }
}

const expandContent = async () => {
  alert('扩写功能开发中...')
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.creative-tasks {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

/* 复用 DailyTasks 的样式 */
.sidebar, .main-content, .header, .btn, .task-list, .task-card, .modal-overlay, .modal,
.modal-header, .modal-body, .modal-footer, .form-group, .form-input, .form-row,
.loading-state, .empty-state {
  /* 样式从 DailyTasks 继承 */
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
  gap: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  min-width: 300px;
}

.search-input {
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  width: 100%;
  font-size: 0.95rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

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

/* 状态标签 */
.status-tabs {
  padding: 16px 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.status-tab {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  font-weight: 500;
}

.status-tab:hover {
  background: rgba(255, 255, 255, 0.15);
}

.status-tab.active {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
  color: #ffffff;
}

/* 任务卡片 */
.task-card {
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: start;
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.task-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.task-status {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

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

.task-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.outline-preview {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.outline-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.outline-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.outline-item {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.task-meta {
  display: flex;
  gap: 16px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

.task-tag, .task-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.task-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 1.2rem;
}

.task-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.task-action-btn.ai-btn:hover {
  background: rgba(102, 126, 234, 0.3);
  color: #667eea;
}

.task-action-btn.delete:hover {
  background: rgba(235, 51, 73, 0.3);
  color: #f45c43;
}

/* AI 生成选项 */
.generate-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.generate-option {
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.generate-option:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: #667eea;
  transform: translateY(-2px);
}

.generate-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.option-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.option-desc {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

.generating-state {
  padding: 32px;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.generating-spinner {
  font-size: 3rem;
  margin-bottom: 16px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.generated-content {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.generated-content h3 {
  font-size: 1.1rem;
  margin-bottom: 12px;
}

.content-preview {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 响应式 */
@media (max-width: 768px) {
  .creative-tasks {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .search-box {
    min-width: 100%;
  }

  .task-card {
    grid-template-columns: 1fr;
  }

  .generate-options {
    grid-template-columns: 1fr;
  }
}
</style>
