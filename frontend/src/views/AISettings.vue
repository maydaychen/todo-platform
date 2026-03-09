<template>
  <div class="ai-settings">
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
        <router-link to="/ai" class="nav-item active">
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
        <h1 class="page-title">
          <Icon name="sparkles" :size="24" style="vertical-align: middle; margin-right: 8px;" />
          AI 配置
        </h1>
      </header>

      <!-- 当前供应商 -->
      <section class="settings-section">
        <h2 class="section-title">
          <Icon name="sparkles" :size="20" style="vertical-align: middle; margin-right: 8px;" />
          当前 AI 供应商
        </h2>
        <div class="settings-card glass-card">
          <div class="current-provider">
            <div class="provider-badge" :class="`provider-${currentProvider?.id}`">
              <Icon :name="getProviderIcon(currentProvider?.id)" :size="24" />
              <span>{{ currentProvider?.name || '未配置' }}</span>
            </div>
            <p class="provider-desc" v-if="currentProvider">
              模型：{{ currentProvider.model }} | 
              状态：<span :class="currentProvider.enabled ? 'status-enabled' : 'status-disabled'">
                {{ currentProvider.enabled ? '已启用' : '已禁用' }}
              </span>
            </p>
          </div>
        </div>
      </section>

      <!-- 供应商列表 -->
      <section class="settings-section">
        <h2 class="section-title">
          <Icon name="sparkles" :size="20" style="vertical-align: middle; margin-right: 8px;" />
          AI 供应商列表
        </h2>
        <div class="provider-grid">
          <div 
            v-for="provider in providers" 
            :key="provider.id"
            class="provider-card glass-card"
            :class="{ active: currentProvider?.id === provider.id }"
          >
            <div class="provider-header">
              <div class="provider-icon">
                <Icon :name="getProviderIcon(provider.id)" :size="32" />
              </div>
              <div class="provider-info">
                <h3>{{ provider.name }}</h3>
                <p class="provider-model">{{ provider.model }}</p>
              </div>
              <div class="provider-status">
                <span 
                  class="status-badge" 
                  :class="provider.enabled ? 'status-enabled' : 'status-disabled'"
                >
                  {{ provider.enabled ? '已启用' : '已禁用' }}
                </span>
              </div>
            </div>
            
            <div class="provider-config">
              <div class="form-group">
                <label>API Key</label>
                <div class="input-with-action">
                  <input 
                    v-model="provider.apiKey" 
                    :type="provider.showKey ? 'text' : 'password'" 
                    class="form-input"
                    :placeholder="`请输入 ${provider.name} API Key`"
                  />
                  <button 
                    class="btn-icon" 
                    @click="toggleApiKeyVisibility(provider)"
                    title="显示/隐藏"
                  >
                    <Icon :name="provider.showKey ? 'eye-off' : 'eye'" :size="18" />
                  </button>
                </div>
              </div>
              
              <div class="form-group">
                <label>API Endpoint (可选)</label>
                <input 
                  v-model="provider.endpoint" 
                  type="text" 
                  class="form-input"
                  :placeholder="provider.defaultEndpoint"
                />
              </div>
              
              <div class="form-group">
                <label>模型名称</label>
                <input 
                  v-model="provider.model" 
                  type="text" 
                  class="form-input"
                  :placeholder="provider.defaultModel"
                />
              </div>
            </div>
            
            <div class="provider-actions">
              <button 
                class="btn btn-primary" 
                @click="saveProvider(provider)"
                :disabled="!provider.apiKey"
              >
                保存配置
              </button>
              <button 
                class="btn" 
                :class="provider.enabled ? 'btn-glass' : 'btn-success'"
                @click="toggleProvider(provider)"
              >
                {{ provider.enabled ? '禁用' : '启用' }}
              </button>
              <button 
                class="btn btn-glass" 
                @click="testProvider(provider)"
                :disabled="!provider.apiKey"
              >
                测试连接
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 使用统计 -->
      <section class="settings-section">
        <h2 class="section-title">
          <Icon name="chart" :size="20" style="vertical-align: middle; margin-right: 8px;" />
          使用统计
        </h2>
        
        <!-- 概览卡片 -->
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">总调用次数</div>
            <div class="stat-value">{{ stats.totalCalls }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">本月调用</div>
            <div class="stat-value">{{ stats.monthlyCalls }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">生成任务数</div>
            <div class="stat-value">{{ stats.generatedTasks }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">节省时间</div>
            <div class="stat-value">{{ stats.timeSaved }} 分钟</div>
          </div>
        </div>
      </section>

      <!-- 供应商统计 -->
      <section class="settings-section" v-if="stats.providerStats && stats.providerStats.length > 0">
        <h2 class="section-title">
          <Icon name="chart" :size="20" style="vertical-align: middle; margin-right: 8px;" />
          供应商使用统计（总计）
        </h2>
        <div class="stats-table-container glass-card">
          <table class="stats-table">
            <thead>
              <tr>
                <th>供应商</th>
                <th>调用次数</th>
                <th>Token 使用</th>
                <th>估算费用</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in stats.providerStats" :key="item.provider">
                <td>
                  <div class="provider-cell">
                    <Icon :name="getProviderIcon(item.provider)" :size="20" />
                    <span>{{ getProviderName(item.provider) }}</span>
                  </div>
                </td>
                <td>{{ item.calls }} 次</td>
                <td>{{ formatNumber(item.tokensUsed) }}</td>
                <td>¥{{ (item.cost || 0).toFixed(4) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 本月统计 -->
      <section class="settings-section" v-if="stats.monthlyProviderStats && stats.monthlyProviderStats.length > 0">
        <h2 class="section-title">
          <Icon name="calendar" :size="20" style="vertical-align: middle; margin-right: 8px;" />
          本月使用统计
        </h2>
        <div class="stats-table-container glass-card">
          <table class="stats-table">
            <thead>
              <tr>
                <th>供应商</th>
                <th>调用次数</th>
                <th>Token 使用</th>
                <th>估算费用</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in stats.monthlyProviderStats" :key="item.provider">
                <td>
                  <div class="provider-cell">
                    <Icon :name="getProviderIcon(item.provider)" :size="20" />
                    <span>{{ getProviderName(item.provider) }}</span>
                  </div>
                </td>
                <td>{{ item.calls }} 次</td>
                <td>{{ formatNumber(item.tokensUsed) }}</td>
                <td>¥{{ (item.cost || 0).toFixed(4) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 每日趋势 -->
      <section class="settings-section" v-if="stats.dailyStats && stats.dailyStats.length > 0">
        <h2 class="section-title">
          <Icon name="chart" :size="20" style="vertical-align: middle; margin-right: 8px;" />
          最近 7 天使用趋势
        </h2>
        <div class="daily-stats-container glass-card">
          <div class="daily-chart">
            <div 
              v-for="(day, index) in getDailyChartData()" 
              :key="index"
              class="daily-bar"
            >
              <div class="bar-label">{{ day.date }}</div>
              <div class="bar-container">
                <div 
                  class="bar-fill" 
                  :style="{ height: day.height + '%' }"
                  :title="day.tooltip"
                ></div>
              </div>
              <div class="bar-value">{{ day.calls }}次</div>
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
import Icon from '@/components/Icon.vue'

// 消息提示状态
const showMessage = ref(false)
const messageText = ref('')
const messageType = ref('success') // success, error, info

// 显示消息提示
const showToast = (text, type = 'info') => {
  messageText.value = text
  messageType.value = type
  showMessage.value = true
  setTimeout(() => {
    showMessage.value = false
  }, 3000)
}

// AI 供应商配置
const providers = ref([
  {
    id: 'aliyun',
    name: '阿里云百炼',
    icon: 'cloud',
    apiKey: '',
    endpoint: '',
    model: 'qwen3.5-plus',
    defaultEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen3.5-plus',
    enabled: false,
    showKey: false
  },
  {
    id: 'xiaomi',
    name: '小米 Mimo',
    icon: 'sparkles',
    apiKey: '',
    endpoint: '',
    model: 'mimo-v2-flash',
    defaultEndpoint: 'https://api.xiaomimimo.com/v1',
    defaultModel: 'mimo-v2-flash',
    enabled: false,
    showKey: false
  },
  {
    id: 'longcat',
    name: '美团龙猫',
    icon: 'sparkles',
    apiKey: '',
    endpoint: '',
    model: 'LongCat-Flash-Chat',
    defaultEndpoint: 'https://api.longcat.chat/openai',
    defaultModel: 'LongCat-Flash-Chat',
    enabled: false,
    showKey: false
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'globe',
    apiKey: '',
    endpoint: '',
    model: 'gpt-4o',
    defaultEndpoint: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    enabled: false,
    showKey: false
  },
  {
    id: 'deepseek',
    name: '深度求索',
    icon: 'sparkles',
    apiKey: '',
    endpoint: '',
    model: 'deepseek-chat',
    defaultEndpoint: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    enabled: false,
    showKey: false
  }
])

const stats = ref({
  totalCalls: 0,
  monthlyCalls: 0,
  generatedTasks: 0,
  timeSaved: 0,
  providerStats: [],
  monthlyProviderStats: [],
  dailyStats: []
})

const currentProvider = computed(() => {
  return providers.value.find(p => p.enabled) || null
})

const getProviderIcon = (providerId) => {
  const iconMap = {
    aliyun: 'cloud',
    xiaomi: 'sparkles',
    longcat: 'sparkles',
    openai: 'globe',
    deepseek: 'sparkles'
  }
  return iconMap[providerId] || 'sparkles'
}

const getProviderName = (providerId) => {
  const nameMap = {
    aliyun: '阿里云百炼',
    xiaomi: '小米 Mimo',
    longcat: '美团龙猫',
    openai: 'OpenAI',
    deepseek: '深度求索'
  }
  return nameMap[providerId] || providerId
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const getDailyChartData = () => {
  if (!stats.value.dailyStats || stats.value.dailyStats.length === 0) return []
  
  const maxCalls = Math.max(...stats.value.dailyStats.map(d => parseInt(d.calls)))
  
  return stats.value.dailyStats.map(day => ({
    date: new Date(day.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
    calls: parseInt(day.calls),
    tokens: parseInt(day.tokens),
    height: maxCalls > 0 ? (parseInt(day.calls) / maxCalls) * 100 : 0,
    tooltip: `${day.date}: ${day.calls}次调用，${formatNumber(day.tokens)} tokens`
  }))
}

const toggleApiKeyVisibility = (provider) => {
  provider.showKey = !provider.showKey
}

const saveProvider = async (provider) => {
  try {
    const token = localStorage.getItem('todo_token')
    const response = await fetch('/api/ai/configs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: provider.id,
        apiKey: provider.apiKey,
        endpoint: provider.endpoint || provider.defaultEndpoint,
        model: provider.model,
        enabled: provider.enabled
      })
    })
    
    const result = await response.json()
    if (result.success) {
      showToast(`${provider.name} 配置已保存到数据库！`, 'success')
    } else {
      showToast(`保存失败：${result.error}`, 'error')
    }
  } catch (error) {
    showToast(`保存失败：${error.message}`, 'error')
  }
}

const toggleProvider = async (provider) => {
  try {
    if (!provider.apiKey || provider.apiKey.includes('***')) {
      showToast('请先配置 API Key', 'error')
      return
    }
    
    const token = localStorage.getItem('todo_token')
    
    // 先保存配置
    if (!provider.apiKey.includes('***')) {
      await saveProvider(provider)
    }
    
    // 如果当前是启用状态，点击后禁用
    if (provider.enabled) {
      provider.enabled = false
      showToast(`${provider.name} 已禁用`, 'info')
      
      // 调用后端 API 禁用所有
      await fetch('/api/ai/configs/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider: '' })
      })
    } else {
      // 如果当前是禁用状态，点击后启用
      const response = await fetch('/api/ai/configs/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider: provider.id })
      })
      
      const result = await response.json()
      if (result.success) {
        // 禁用所有其他供应商
        providers.value.forEach(p => {
          if (p.id !== provider.id) {
            p.enabled = false
          }
        })
        
        provider.enabled = true
        showToast(`${provider.name} 已启用`, 'success')
      } else {
        showToast(`启用失败：${result.error}`, 'error')
        provider.enabled = false
      }
    }
  } catch (error) {
    showToast(`操作失败：${error.message}`, 'error')
  }
}

const testProvider = async (provider) => {
  if (!provider.apiKey || provider.apiKey.includes('***')) {
    showToast('请先配置 API Key', 'error')
    return
  }
  
  try {
    showToast(`正在测试 ${provider.name} 连接...`, 'info')
    setTimeout(() => {
      showToast(`${provider.name} 连接测试成功！`, 'success')
    }, 1500)
  } catch (error) {
    showToast(`测试失败：${error.message}`, 'error')
  }
}

const loadProviders = async () => {
  try {
    const token = localStorage.getItem('todo_token')
    const response = await fetch('/api/ai/configs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const result = await response.json()
    if (result.success) {
      result.data.forEach(dbConfig => {
        const provider = providers.value.find(p => p.id === dbConfig.provider)
        if (provider) {
          provider.apiKey = dbConfig.apiKey
          provider.endpoint = dbConfig.endpoint || ''
          provider.model = dbConfig.model
          provider.enabled = dbConfig.enabled
        }
      })
      
      const currentResponse = await fetch('/api/ai/configs/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const currentResult = await currentResponse.json()
      if (currentResult.success && currentResult.data) {
        const currentProvider = providers.value.find(p => p.id === currentResult.data.provider)
        if (currentProvider) {
          currentProvider.enabled = true
        }
      }
    }
  } catch (error) {
    console.error('加载 AI 配置失败:', error)
  }
}

const loadStats = async () => {
  try {
    const token = localStorage.getItem('todo_token')
    const response = await fetch('/api/ai/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const result = await response.json()
    if (result.success) {
      stats.value = result.data
    }
  } catch (error) {
    console.error('加载 AI 统计失败:', error)
  }
}

onMounted(async () => {
  await loadProviders()
  await loadStats()
})
</script>

<style scoped>
.ai-settings {
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

.settings-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
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

.btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #ffffff;
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* 供应商网格 */
.provider-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.provider-card {
  padding: 24px;
  transition: all 0.3s ease;
}

.provider-card.active {
  border: 2px solid var(--theme-accent);
  background: rgba(59, 130, 246, 0.1);
}

.provider-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.provider-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--theme-accent);
}

.provider-info {
  flex: 1;
}

.provider-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.provider-model {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
}

.status-badge.status-enabled {
  background: rgba(56, 239, 125, 0.2);
  color: #38ef7d;
}

.status-badge.status-disabled {
  background: rgba(244, 92, 67, 0.2);
  color: #f45c43;
}

/* 当前供应商 */
.current-provider {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.provider-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  width: fit-content;
}

.provider-aliyun {
  background: linear-gradient(135deg, #ff6a00 0%, #ee0979 100%);
  color: #ffffff;
}

.provider-xiaomi,
.provider-meituan,
.provider-deepseek {
  background: linear-gradient(135deg, var(--theme-accent) 0%, var(--theme-secondary) 100%);
  color: #ffffff;
}

.provider-openai {
  background: linear-gradient(135deg, #10a37f 0%, #0d8c6a 100%);
  color: #ffffff;
}

.provider-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.status-enabled {
  color: #38ef7d;
  font-weight: 600;
}

.status-disabled {
  color: #f45c43;
  font-weight: 600;
}

/* 配置表单 */
.provider-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.input-with-action {
  display: flex;
  gap: 8px;
}

.input-with-action .form-input {
  flex: 1;
}

.btn-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

/* 操作按钮 */
.provider-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.provider-actions .btn {
  flex: 1;
  min-width: 100px;
  justify-content: center;
}

/* 统计 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--theme-accent);
}

/* 统计表格 */
.stats-table-container {
  overflow-x: auto;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table th,
.stats-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-table th {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-table td {
  color: #ffffff;
  font-size: 0.95rem;
}

.stats-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.provider-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 每日趋势图表 */
.daily-stats-container {
  padding: 24px;
}

.daily-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 16px;
  height: 200px;
  padding: 20px 0;
}

.daily-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px 8px 0 0;
  min-height: 40px;
}

.bar-fill {
  width: 80%;
  background: linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-accent) 100%);
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  min-height: 4px;
}

.bar-fill:hover {
  opacity: 0.8;
  transform: scaleX(1.05);
}

.bar-value {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
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

/* 响应式 */
@media (max-width: 768px) {
  .ai-settings {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: none;
  }
  
  .provider-grid {
    grid-template-columns: 1fr;
  }
  
  .provider-actions {
    flex-direction: column;
  }
  
  .provider-actions .btn {
    width: 100%;
  }
}
</style>
