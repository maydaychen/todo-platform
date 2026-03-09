<template>
  <div class="daily-tasks">
    <!-- 侧边栏 -->
    <aside class="sidebar glass">
      <div class="logo">
        <Icon name="clipboard" :size="32" />
        <span>TODO Platform</span>
      </div>

      <nav class="nav-section">
        <div class="nav-title">主要功能</div>
        <router-link to="/" class="nav-item">
          <Icon name="home" :size="20" />
          <span>仪表盘</span>
        </router-link>
        <router-link to="/daily" class="nav-item active">
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
        <router-link to="/category-prompts" class="nav-item">
          <Icon name="file" :size="20" />
          <span>分类提示词</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 头部 -->
      <header class="header glass">
        <div class="header-left">
          <h1 class="page-title">
            <Icon name="calendar" :size="24" style="vertical-align: middle; margin-right: 8px;" />
            日常任务
          </h1>
          <div class="search-box glass">
            <Icon name="search" :size="18" />
            <input 
              v-model="searchQuery" 
              type="text" 
              class="search-input" 
              placeholder="搜索任务..."
              @keyup.enter="handleSearch"
            >
          </div>
        </div>
        <div class="header-right">
          <button class="btn btn-glass" @click="refreshData" title="刷新">
            <Icon name="refresh" :size="18" />
          </button>
          <button class="btn btn-primary" @click="showNewTaskModal = true">
            <Icon name="plus" :size="18" />
            <span>新建任务</span>
          </button>
        </div>
      </header>

      <!-- 筛选器 -->
      <section class="filters glass-card">
        <div class="filter-group">
          <label>状态</label>
          <div class="filter-buttons">
            <button 
              class="filter-btn" 
              :class="{ active: filters.status === 'all' }"
              @click="filters.status = 'all'"
            >
              全部
            </button>
            <button 
              class="filter-btn" 
              :class="{ active: filters.status === 'pending' }"
              @click="filters.status = 'pending'"
            >
              待办
            </button>
            <button 
              class="filter-btn" 
              :class="{ active: filters.status === 'completed' }"
              @click="filters.status = 'completed'"
            >
              已完成
            </button>
          </div>
        </div>

        <div class="filter-group">
          <label>分类</label>
          <select v-model="filters.category" class="filter-select">
            <option value="all">全部分类</option>
            <option v-for="cat in dailyCategories" :key="cat.id" :value="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>优先级</label>
          <select v-model="filters.priority" class="filter-select">
            <option value="all">全部</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <div class="filter-group">
          <label>排序</label>
          <select v-model="filters.sortBy" class="filter-select">
            <option value="createdAt">创建时间</option>
            <option value="dueDate">截止日期</option>
            <option value="priority">优先级</option>
          </select>
        </div>
      </section>

      <!-- 任务列表 -->
      <section class="tasks-section">
        <div v-if="loading" class="loading-state">
          <Icon name="refresh" :size="48" class="loading-spinner" style="animation: spin 1s linear infinite;" />
          <p>加载中...</p>
        </div>

        <div v-else-if="filteredTasks.length === 0" class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-title">没有找到任务</div>
          <p>{{ searchQuery ? '换个关键词试试' : '点击"新建任务"创建你的第一个任务吧！' }}</p>
        </div>

        <div v-else class="task-list">
          <div 
            v-for="task in filteredTasks" 
            :key="task.id" 
            class="task-card glass-card"
          >
            <div 
              class="task-checkbox" 
              :class="{ checked: task.status === 'COMPLETED' }"
              @click="toggleTask(task)"
            ></div>
            
            <div class="task-content">
              <div class="task-title" :class="{ completed: task.status === 'COMPLETED' }">
                {{ task.title }}
              </div>
              <div v-if="task.description" class="task-description">
                {{ task.description }}
              </div>
              <div class="task-meta">
                <span v-if="task.dueDate" class="task-due" :class="{ urgent: isUrgent(task.dueDate) }">
                  {{ formatDueDate(task.dueDate) }}
                </span>
                <span class="task-priority" :class="`priority-${task.priority}`">
                  {{ priorityText(task.priority) }}
                </span>
                <span v-if="task.category" class="task-tag">
                  {{ task.category.icon }} {{ task.category.name }}
                </span>
              </div>
            </div>
            
            <div class="task-actions">
              <button class="task-action-btn" @click="editTask(task)" title="编辑">
                <Icon name="pencil" :size="16" />
              </button>
              <button class="task-action-btn delete" @click="deleteTask(task)" title="删除">
                <Icon name="trash" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 新建/编辑任务弹窗 -->
    <div v-if="showNewTaskModal" class="modal-overlay" @click="showNewTaskModal = false">
      <div class="modal glass" @click.stop>
        <div class="modal-header">
          <h2>{{ editingTask ? '编辑任务' : '新建任务' }}</h2>
          <button class="modal-close" @click="showNewTaskModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>标题 *</label>
            <input 
              v-model="newTask.title" 
              type="text" 
              class="form-input"
              placeholder="输入任务标题"
            >
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea 
              v-model="newTask.description" 
              class="form-input"
              rows="3"
              placeholder="任务描述（可选）"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>优先级</label>
              <select v-model="newTask.priority" class="form-input">
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>

            <div class="form-group">
              <label>分类</label>
              <select v-model="newTask.categoryId" class="form-input">
                <option :value="null">无</option>
                <option v-for="cat in dailyCategories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>截止日期</label>
            <input 
              v-model="newTask.dueDate" 
              type="datetime-local" 
              class="form-input"
            >
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
    
    <!-- 自定义消息提示 -->
    <div v-if="showMessage" class="toast-container">
      <div class="toast" :class="`toast-${messageType}`">
        <Icon :name="messageType === 'success' ? 'check' : messageType === 'error' ? 'trash' : 'sparkles'" :size="20" />
        <span>{{ messageText }}</span>
      </div>
    </div>
    
    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal glass-card" @click.stop>
        <div class="modal-header">
          <Icon name="trash" :size="24" style="color: #f45c43;" />
          <h2>确认删除</h2>
        </div>
        <div class="modal-body">
          <p>确定要删除任务 <strong>"{{ taskToDelete?.title }}"</strong> 吗？</p>
          <p class="text-secondary" style="font-size: 0.875rem; margin-top: 8px;">
            此操作不可恢复
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-glass" @click="showDeleteModal = false">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore, useAuthStore } from '@/stores'
import Icon from '@/components/Icon.vue'

const taskStore = useTaskStore()
const authStore = useAuthStore()

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

const loading = ref(false)
const searchQuery = ref('')
const showNewTaskModal = ref(false)
const showDeleteModal = ref(false)
const taskToDelete = ref(null)
const editingTask = ref(null)

const filters = ref({
  status: 'all',
  priority: 'all',
  category: 'all',
  sortBy: 'createdAt'
})

const newTask = ref({
  title: '',
  description: '',
  priority: 'medium',
  categoryId: null,
  dueDate: ''
})

const filteredTasks = computed(() => {
  let tasks = taskStore.dailyTasks
  
  // 筛选
  if (filters.value.status !== 'all') {
    if (filters.value.status === 'pending') {
      tasks = tasks.filter(t => t.status !== 'completed')
    } else {
      tasks = tasks.filter(t => t.status === filters.value.status)
    }
  }
  
  if (filters.value.priority !== 'all') {
    tasks = tasks.filter(t => t.priority === filters.value.priority)
  }
  
  // 分类筛选
  if (filters.value.category !== 'all') {
    tasks = tasks.filter(t => t.categoryId === parseInt(filters.value.category))
  }
  
  // 搜索
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query))
    )
  }
  
  // 排序
  tasks = [...tasks].sort((a, b) => {
    if (filters.value.sortBy === 'dueDate') {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    } else if (filters.value.sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt)
    }
  })
  
  return tasks
})

const dailyCategories = ref([])

const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('todo_token')
    const response = await fetch('/api/categories', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      // 只保留日常任务分类
      dailyCategories.value = data.data.filter(c => c.type === 'DAILY')
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const fetchTasks = async () => {
  loading.value = true
  try {
    await taskStore.fetchTasks({ type: 'daily', limit: 100 })
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

const toggleTask = async (task) => {
  console.log('切换任务状态:', task.id, task.title, '当前状态:', task.status)
  await taskStore.toggleTaskStatus(task.id)
  console.log('任务状态已切换')
  fetchTasks()  // 重新获取任务列表，确保数据同步
}

const editTask = (task) => {
  editingTask.value = task
  newTask.value = {
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    categoryId: task.categoryId,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''
  }
  showNewTaskModal.value = true
}

const deleteTask = (task) => {
  taskToDelete.value = task
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (taskToDelete.value) {
    await taskStore.deleteTask(taskToDelete.value.id)
    showDeleteModal.value = false
    taskToDelete.value = null
    fetchTasks()
  }
}

const saveTask = async () => {
  try {
    const taskData = {
      ...newTask.value,
      type: 'daily',  // 后端验证需要小写
      priority: (newTask.value.priority || 'medium').toLowerCase(),  // 转为小写
      categoryId: newTask.value.categoryId || null,  // 传 null 而不是 undefined
      dueDate: newTask.value.dueDate ? new Date(newTask.value.dueDate).toISOString() : null
    }
    
    console.log('创建任务数据:', taskData)
    
    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value.id, taskData)
    } else {
      await taskStore.createTask(taskData)
    }
    
    showNewTaskModal.value = false
    resetForm()
    fetchTasks()
    showToast('任务创建成功！', 'success')
  } catch (error) {
    console.error('保存任务失败:', error)
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message
    showToast('保存失败：' + errorMsg, 'error')
  }
}

const resetForm = () => {
  editingTask.value = null
  newTask.value = {
    title: '',
    description: '',
    priority: 'medium',
    categoryId: null,
    dueDate: ''
  }
}

const isUrgent = (dueDate) => {
  const now = new Date()
  const due = new Date(dueDate)
  const diff = (due - now) / (1000 * 60 * 60 * 24)
  return diff < 1
}

const formatDueDate = (dueDate) => {
  const now = new Date()
  const due = new Date(dueDate)
  const diff = due - now
  
  if (diff < 0) {
    return '🔴 已逾期'
  } else if (diff < 1000 * 60 * 60 * 24) {
    return '🟡 今天'
  } else if (diff < 1000 * 60 * 60 * 24 * 2) {
    return '🟢 明天'
  } else {
    return due.toLocaleDateString('zh-CN')
  }
}

const priorityText = (priority) => {
  const map = { low: '低', medium: '中', high: '高' }
  return map[priority] || priority
}

onMounted(() => {
  fetchTasks()
  fetchCategories()
})
</script>

<style scoped>
.daily-tasks {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

/* 复用 Dashboard 的样式，这里只写页面特定的 */
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
  padding: 16px 12px;
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
  background: linear-gradient(135deg, var(--theme-accent) 0%, var(--theme-secondary) 100%);
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
  background: linear-gradient(135deg, var(--theme-accent) 0%, var(--theme-secondary) 100%);
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

/* 筛选器 */
.filters {
  padding: 20px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.filter-btn.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--theme-accent);
  color: #ffffff;
}

.filter-select {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.95rem;
  outline: none;
  cursor: pointer;
}

/* 任务列表 */
.tasks-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  padding: 24px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: start;
}

.task-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.task-checkbox:hover {
  border-color: var(--theme-accent);
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

.task-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-title {
  font-size: 1.05rem;
  font-weight: 500;
}

.task-title.completed {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.5);
}

.task-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.task-due.urgent {
  color: #f45c43;
}

.task-priority {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

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

.task-tag {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.75rem;
}

.task-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.task-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.task-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.task-action-btn.delete:hover {
  background: rgba(235, 51, 73, 0.3);
  color: #f45c43;
}

/* 加载和空状态 */
.loading-state, .empty-state {
  padding: 48px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.loading-spinner {
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.7);
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #ffffff;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

/* 表单 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-input {
  width: 100%;
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
  border-color: var(--theme-accent);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

select.form-input option {
  background: #24243e;
  color: #ffffff;
}

/* 响应式 */
@media (max-width: 768px) {
  .daily-tasks {
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

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .search-box {
    min-width: 100%;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-buttons {
    flex-wrap: wrap;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .task-card {
    grid-template-columns: auto 1fr;
  }

  .task-actions {
    grid-column: 1 / -1;
    justify-content: flex-end;
    opacity: 1;
  }
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
</style>
