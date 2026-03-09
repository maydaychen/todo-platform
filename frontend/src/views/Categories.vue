<template>
  <div class="categories">
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
        <router-link to="/categories" class="nav-item active">
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
        <h1 class="page-title">
          <Icon name="tag" :size="24" style="vertical-align: middle; margin-right: 8px;" />
          分类管理
        </h1>
        <button class="btn btn-primary" @click="showNewCategoryModal = true">
          <Icon name="plus" :size="18" />
          <span>新建分类</span>
        </button>
      </header>

      <!-- 日常任务分类 -->
      <section class="settings-section">
        <h2 class="section-title">
          <Icon name="calendar" :size="20" style="vertical-align: middle; margin-right: 8px;" />
          日常任务分类
        </h2>
        <div class="category-grid">
          <div 
            v-for="cat in dailyCategories" 
            :key="cat.id"
            class="category-card glass-card"
          >
            <div class="category-header">
              <div class="category-color" :style="{ backgroundColor: cat.color }"></div>
              <div class="category-info">
                <h3>{{ cat.icon }} {{ cat.name }}</h3>
                <p class="category-count">{{ cat._count?.tasks || 0 }} 个任务</p>
              </div>
            </div>
            <div class="category-actions">
              <button class="btn btn-glass" @click="editCategory(cat)">
                <Icon name="pencil" :size="16" />
              </button>
              <button class="btn btn-glass danger" @click="deleteCategory(cat)">
                <Icon name="trash" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 创作任务分类 -->
      <section class="settings-section">
        <h2 class="section-title">
          <Icon name="edit" :size="20" style="vertical-align: middle; margin-right: 8px;" />
          创作任务分类
        </h2>
        <div class="category-grid">
          <div 
            v-for="cat in creativeCategories" 
            :key="cat.id"
            class="category-card glass-card"
          >
            <div class="category-header">
              <div class="category-color" :style="{ backgroundColor: cat.color }"></div>
              <div class="category-info">
                <h3>{{ cat.icon }} {{ cat.name }}</h3>
                <p class="category-count">{{ cat._count?.tasks || 0 }} 个任务</p>
              </div>
            </div>
            <div class="category-actions">
              <button class="btn btn-glass" @click="editCategory(cat)">
                <Icon name="pencil" :size="16" />
              </button>
              <button class="btn btn-glass danger" @click="deleteCategory(cat)">
                <Icon name="trash" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 新建/编辑分类弹窗 -->
    <div v-if="showNewCategoryModal" class="modal-overlay" @click="showNewCategoryModal = false">
      <div class="modal glass-card" @click.stop>
        <h2 class="modal-title">
          {{ editingCategory ? '编辑分类' : '新建分类' }}
        </h2>
        
        <div class="form-group">
          <label>分类名称 *</label>
          <input 
            v-model="categoryForm.name" 
            type="text" 
            class="form-input"
            placeholder="例如：工作、家庭、购物"
          />
        </div>
        
        <div class="form-group">
          <label>类型 *</label>
          <select v-model="categoryForm.type" class="form-select">
            <option value="DAILY">📅 日常任务</option>
            <option value="CREATIVE">✍️ 创作任务</option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>图标</label>
            <select v-model="categoryForm.icon" class="form-select">
              <option value="briefcase">公文包</option>
              <option value="home">家庭</option>
              <option value="cart">购物</option>
              <option value="file">文档</option>
              <option value="book">笔记</option>
              <option value="lightbulb">创意</option>
              <option value="target">目标</option>
              <option value="book-open">学习</option>
              <option value="activity">运动</option>
              <option value="coffee">餐饮</option>
              <option value="globe">旅行</option>
              <option value="gamepad">娱乐</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>颜色</label>
            <input 
              v-model="categoryForm.color" 
              type="color" 
              class="form-input"
              style="height: 42px; padding: 4px;"
            />
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-glass" @click="showNewCategoryModal = false">取消</button>
          <button class="btn btn-primary" @click="saveCategory">保存</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal glass-card" @click.stop>
        <h2 class="modal-title">
          <Icon name="trash" :size="24" style="color: #f45c43; vertical-align: middle; margin-right: 8px;" />
          确认删除
        </h2>
        <p class="modal-desc">
          确定要删除分类 <strong>"{{ categoryToDelete?.name }}"</strong> 吗？
        </p>
        <p class="modal-desc" style="color: var(--text-secondary); font-size: 0.875rem;">
          该分类下的任务不会被删除，但会失去分类关联
        </p>
        <div class="modal-actions">
          <button class="btn btn-glass" @click="showDeleteModal = false">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/Icon.vue'

const categories = ref([])
const showNewCategoryModal = ref(false)
const editingCategory = ref(null)
const showDeleteModal = ref(false)
const categoryToDelete = ref(null)

const categoryForm = ref({
  name: '',
  type: 'DAILY',
  icon: 'briefcase',
  color: '#4facfe'
})

const dailyCategories = computed(() => 
  categories.value.filter(c => c.type === 'DAILY')
)

const creativeCategories = computed(() => 
  categories.value.filter(c => c.type === 'CREATIVE')
)

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
      categories.value = data.data
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const saveCategory = async () => {
  if (!categoryForm.value.name.trim()) {
    alert('请填写分类名称')
    return
  }
  
  try {
    const token = localStorage.getItem('todo_token')
    const url = editingCategory.value 
      ? `/api/categories/${editingCategory.value.id}`
      : '/api/categories'
    
    const method = editingCategory.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryForm.value)
    })
    
    const result = await response.json()
    if (result.success) {
      showNewCategoryModal.value = false
      editingCategory.value = null
      categoryForm.value = { name: '', type: 'DAILY', icon: 'briefcase', color: '#4facfe' }
      await fetchCategories()
    } else {
      alert('保存失败：' + result.error)
    }
  } catch (error) {
    alert('保存失败：' + error.message)
  }
}

const editCategory = (category) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    type: category.type,
    icon: category.icon,
    color: category.color
  }
  showNewCategoryModal.value = true
}

const deleteCategory = (category) => {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (categoryToDelete.value) {
    try {
      const token = localStorage.getItem('todo_token')
      const response = await fetch(`/api/categories/${categoryToDelete.value.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const result = await response.json()
      if (result.success) {
        showDeleteModal.value = false
        categoryToDelete.value = null
        await fetchCategories()
      } else {
        alert('删除失败：' + result.error)
      }
    } catch (error) {
      alert('删除失败：' + error.message)
    }
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.categories {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

/* 侧边栏 - 与其他页面一致 */
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
  background: linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-accent) 100%);
  color: #ffffff;
}

/* 主内容区 */
.main-content {
  padding: 24px;
  overflow-y: auto;
}

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
}

/* 设置区域 */
.settings-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

/* 分类网格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.category-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.category-color {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.category-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.category-count {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

.category-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.category-actions .btn {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-actions .btn.danger:hover {
  background: rgba(235, 51, 73, 0.3);
  border-color: rgba(235, 51, 73, 0.5);
  color: #f45c43;
}

/* 表单 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
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
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-select {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}

.form-select:focus {
  border-color: var(--theme-accent);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
  background: linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-accent) 100%);
  color: #ffffff;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-glass {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-glass.danger:hover {
  background: rgba(235, 51, 73, 0.3);
  border-color: rgba(235, 51, 73, 0.5);
  color: #f45c43;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
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
  max-width: 500px;
  padding: 24px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
}

.modal-desc {
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* 响应式 */
@media (max-width: 768px) {
  .categories {
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
  
  .category-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
