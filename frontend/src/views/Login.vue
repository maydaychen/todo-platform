<template>
  <div class="login-container">
    <div class="login-box glass">
      <div class="login-header">
        <div class="logo">
          <span class="logo-icon">📋</span>
          <h1>TODO Platform</h1>
        </div>
        <p class="subtitle">任务管理平台</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input 
              v-model="username" 
              type="text" 
              class="form-input"
              placeholder="请输入用户名"
              required
              autocomplete="username"
            >
          </div>
        </div>

        <div class="form-group">
          <label>密码</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input 
              v-model="password" 
              type="password" 
              class="form-input"
              placeholder="请输入密码"
              required
              autocomplete="current-password"
            >
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe">
            <span>记住我</span>
          </label>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary btn-block"
          :disabled="loading"
        >
          <span v-if="loading">⏳ 登录中...</span>
          <span v-else>🚀 登录</span>
        </button>

        <div v-if="error" class="error-message">
          ❌ {{ error }}
        </div>

        <div class="demo-info">
          <p>💡 默认账号：</p>
          <code>maydaychen / Admin@123456</code>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login(username.value, password.value)
    
    // 生成 API Key（如果还没有）
    if (!authStore.apiKey) {
      await authStore.generateApiKey()
    }
    
    // 跳转到仪表盘
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.error || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-box {
  width: 100%;
  max-width: 440px;
  padding: 48px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 3rem;
}

.logo h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.5);
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-block {
  width: 100%;
}

.error-message {
  padding: 12px 16px;
  background: rgba(235, 51, 73, 0.2);
  border: 1px solid rgba(235, 51, 73, 0.3);
  border-radius: 8px;
  color: #f45c43;
  font-size: 0.95rem;
}

.demo-info {
  margin-top: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  text-align: center;
}

.demo-info p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.demo-info code {
  display: block;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  color: #4facfe;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
}

/* 响应式 */
@media (max-width: 480px) {
  .login-box {
    padding: 32px 24px;
  }

  .logo h1 {
    font-size: 1.5rem;
  }

  .logo-icon {
    font-size: 2.5rem;
  }
}
</style>
