<template>
  <div class="dashboard">
    <!-- 侧边栏 -->
    <aside class="sidebar glass">
      <div class="logo">
        <Icon name="clipboard" :size="32" />
        <span>TODO Platform</span>
      </div>

      <nav class="nav-section">
        <div class="nav-title">主要功能</div>
        <router-link to="/" class="nav-item active">
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
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 头部 -->
      <header class="header glass">
        <div class="header-left">
          <h1 class="page-title">仪表盘</h1>
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
          <ThemeToggle />
          <button class="btn btn-glass" @click="refreshData" title="刷新">
            <Icon name="refresh" :size="18" />
          </button>
          <button class="btn btn-primary" @click="showNewTaskModal = true">
            <Icon name="plus" :size="18" />
            <span>新建任务</span>
          </button>
          <div class="user-avatar" @click="showUserMenu = !showUserMenu">
            {{ userInitials }}
          </div>
        </div>
      </header>

      <!-- 统计卡片 -->
      <section class="stats-grid">
        <div class="stat-card glass-card">
          <Icon name="calendar" :size="32" />
          <div class="stat-label">总任务数</div>
          <div class="stat-value">{{ stats.total || 0 }}</div>
          <div class="stat-trend">
            <span :class="stats.completionRate >= 50 ? 'trend-up' : 'trend-down'">
              {{ stats.completionRate >= 50 ? '↑' : '↓' }} 完成率 {{ stats.completionRate }}%
            </span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <Icon name="clock" :size="32" />
          <div class="stat-label">待办任务</div>
          <div class="stat-value">{{ stats.byStatus?.pending || 0 }}</div>
          <div class="stat-trend">
            <span v-if="stats.dueToday > 0" class="trend-down">
              ⚠️ {{ stats.dueToday }} 个今日到期
            </span>
            <span v-else-if="stats.overdue > 0" class="trend-down">
              ⚠️ {{ stats.overdue }} 个已逾期
            </span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <Icon name="edit" :size="32" />
          <div class="stat-label">创作中</div>
          <div class="stat-value">{{ stats.byType?.creative || 0 }}</div>
          <div class="stat-trend">
            <span class="trend-up">创作任务</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <Icon name="check" :size="32" />
          <div class="stat-label">已完成</div>
          <div class="stat-value">{{ stats.byStatus?.completed || 0 }}</div>
          <div class="stat-trend">
            <span class="trend-up">继续加油！</span>
          </div>
        </div>
      </section>

      <!-- 快速操作 -->
      <section class="quick-actions glass-card">
        <h2 class="section-title"><Icon name="rocket" :size="20" style="vertical-align: middle;" /> 快速操作</h2>
        <div class="action-buttons">
          <button class="action-btn" @click="createQuickTask('daily')">
            <Icon name="calendar" :size="24" />
            <span>日常任务</span>
          </button>
          <button class="action-btn" @click="createQuickTask('creative')">
            <Icon name="edit" :size="24" />
            <span>创作任务</span>
          </button>
          <button class="action-btn" @click="viewAllTasks">
            <Icon name="clipboard" :size="24" />
            <span>查看全部</span>
          </button>
        </div>
      </section>

      <!-- 最近任务 -->
      <section class="tasks-section">
        <div class="section-header">
          <h2 class="section-title">
            <Icon name="clipboard" :size="20" style="vertical-align: middle;" />
            最近任务
          </h2>
          <div class="tabs">
            <div 
              class="tab" 
              :class="{ active: activeTab === 'all' }"
              @click="activeTab = 'all'"
            >
              全部
            </div>
            <div 
              class="tab" 
              :class="{ active: activeTab === 'pending' }"
              @click="activeTab = 'pending'"
            >
              待办
            </div>
            <div 
              class="tab" 
              :class="{ active: activeTab === 'completed' }"
              @click="activeTab = 'completed'"
            >
              已完成
            </div>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="loading-spinner">⏳</div>
          <p>加载中...</p>
        </div>

        <div v-else-if="recentTasks.length === 0" class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-title">还没有任务</div>
          <p>点击"新建任务"创建你的第一个任务吧！</p>
        </div>

        <div v-else class="task-list">
          <div 
            v-for="task in recentTasks" 
            :key="task.id" 
            class="task-card glass-card"
            :class="task.type"
          >
            <div 
              class="task-checkbox" 
              :class="{ checked: task.status === 'completed' }"
              @click="toggleTask(task)"
            ></div>
            
            <div class="task-content">
              <div class="task-title" :class="{ completed: task.status === 'completed' }">
                {{ task.title }}
              </div>
              <div class="task-meta">
                <span v-if="task.dueDate" class="task-due" :class="{ urgent: isUrgent(task.dueDate) }">
                  {{ formatDueDate(task.dueDate) }}
                </span>
                <span class="task-priority" :class="`priority-${task.priority}`">
                  {{ priorityText(task.priority) }}
                </span>
                <span class="task-tag">{{ task.type === 'daily' ? '📅 日常' : '✍️ 创作' }}</span>
              </div>
            </div>
            
            <div class="task-actions">
              <button class="task-action-btn" @click="editTask(task)" title="编辑">
                <Icon name="pencil" :size="16" />
              </button>
              <button 
                v-if="task.type === 'creative'" 
                class="task-action-btn" 
                @click="generateContent(task)" 
                title="AI 生成"
              >
                <Icon name="sparkles" :size="16" />
              </button>
              <button class="task-action-btn delete" @click="deleteTask(task)" title="删除">
                <Icon name="trash" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 新建任务弹窗 -->
    <div v-if="showNewTaskModal" class="modal-overlay" @click="showNewTaskModal = false">
      <div class="modal glass" @click.stop>
        <div class="modal-header">
          <h2>新建任务</h2>
          <button class="modal-close" @click="showNewTaskModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>任务类型</label>
            <div class="type-selector">
              <button 
                class="type-btn" 
                :class="{ active: newTask.type === 'daily' }"
                @click="newTask.type = 'daily'"
              >
                📅 日常任务
              </button>
              <button 
                class="type-btn" 
                :class="{ active: newTask.type === 'creative' }"
                @click="newTask.type = 'creative'"
              >
                ✍️ 创作任务
              </button>
            </div>
          </div>

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
              <label>截止日期</label>
              <input 
                v-model="newTask.dueDate" 
                type="datetime-local" 
                class="form-input"
              >
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-glass" @click="showNewTaskModal = false">取消</button>
          <button class="btn btn-primary" @click="createTask" :disabled="!newTask.title">
            创建任务
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore, useAuthStore } from '@/stores'
import Icon from '@/components/Icon.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()

// 状态
const loading = ref(false)
const searchQuery = ref('')
const activeTab = ref('all')
const showNewTaskModal = ref(false)
const showUserMenu = ref(false)

// 统计数据
const stats = ref({})

// 新任务表单
const newTask = ref({
  type: 'daily',
  title: '',
  description: '',
  priority: 'medium',
  dueDate: ''
})

// 计算属性
const userInitials = computed(() => {
  const user = authStore.user
  if (user && user.username) {
    return user.username.substring(0, 2).toUpperCase()
  }
  return '用户'
})

const recentTasks = computed(() => {
  let tasks = taskStore.tasks.slice(0, 10)
  
  if (activeTab.value === 'pending') {
    tasks = tasks.filter(t => t.status !== 'completed')
  } else if (activeTab.value === 'completed') {
    tasks = tasks.filter(t => t.status === 'completed')
  }
  
  return tasks
})

// 方法
const fetchStats = async () => {
  try {
    const response = await fetch('/api/stats/summary', {
      headers: {
        'X-API-Key': authStore.apiKey
      }
    })
    const data = await response.json()
    if (data.success) {
      stats.value = data.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchTasks = async () => {
  loading.value = true
  try {
    await taskStore.fetchTasks({ limit: 10 })
  } catch (error) {
    console.error('获取任务失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchStats()
  fetchTasks()
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/daily', query: { search: searchQuery.value } })
  }
}

const createQuickTask = (type) => {
  newTask.value.type = type
  showNewTaskModal.value = true
}

const viewAllTasks = () => {
  router.push('/daily')
}

const toggleTask = async (task) => {
  await taskStore.toggleTaskStatus(task.id)
  fetchStats()
}

const editTask = (task) => {
  newTask.value = {
    type: task.type,
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''
  }
  showNewTaskModal.value = true
}

const generateContent = (task) => {
  // TODO: 调用 AI 生成内容
  alert('AI 生成功能开发中...')
}

const deleteTask = async (task) => {
  if (confirm(`确定要删除任务"${task.title}"吗？`)) {
    await taskStore.deleteTask(task.id)
    fetchStats()
  }
}

const createTask = async () => {
  try {
    await taskStore.createTask({
      ...newTask.value,
      dueDate: newTask.value.dueDate ? new Date(newTask.value.dueDate).toISOString() : null
    })
    showNewTaskModal.value = false
    fetchStats()
    fetchTasks()
    
    // 重置表单
    newTask.value = {
      type: 'daily',
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    }
  } catch (error) {
    alert('创建失败：' + error.message)
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
  const map = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return map[priority] || priority
}

// 生命周期
onMounted(() => {
  fetchStats()
  fetchTasks()
})
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

/* 侧边栏 */
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
  background: linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-accent) 100%);
  color: #ffffff;
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

/* 主内容区 */
.main-content {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 头部 */
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
  padding: 8px 24px;
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

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  cursor: pointer;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.stat-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.stat-trend {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  color: #38ef7d;
}

.trend-down {
  color: #f45c43;
}

/* 快速操作 */
.quick-actions {
  padding: 24px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.action-icon {
  font-size: 1.25rem;
}

/* 任务列表 */
.tasks-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab.active {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
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

.task-card.daily {
  border-left: 4px solid #4facfe;
}

.task-card.creative {
  border-left: 4px solid #667eea;
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

.task-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-title {
  font-size: 1.05rem;
  font-weight: 500;
}

.task-title.completed {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.5);
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
  font-size: 3rem;
  margin-bottom: 16px;
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

.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.type-btn {
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.type-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.type-btn.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: #667eea;
  color: #ffffff;
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
  border-color: #667eea;
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
  .dashboard {
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

  .stats-grid {
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

  .form-row {
    grid-template-columns: 1fr;
  }
  
  /* 移动端主内容区添加底部 padding */
  .main-content {
    padding-bottom: 80px;
  }
}
</style>
