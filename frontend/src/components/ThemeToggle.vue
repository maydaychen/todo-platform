<template>
  <button class="theme-toggle glass" @click="changeTheme" title="切换主题">
    <Icon name="palette" :size="20" />
    <span class="theme-name">{{ currentThemeName }}</span>
  </button>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Icon from './Icon.vue'

// 主题配置 - 蓝色系为主，激发创作灵感
const themes = [
  {
    name: '灵感蓝',
    key: 'inspiration-blue',
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)'
  },
  {
    name: '深海蓝',
    key: 'deep-ocean',
    primary: '#0c4a6e',
    secondary: '#0284c7',
    accent: '#38bdf8',
    gradient: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 50%, #075985 100%)'
  },
  {
    name: '星空蓝',
    key: 'starry-night',
    primary: '#1e1b4b',
    secondary: '#4338ca',
    accent: '#6366f1',
    gradient: 'linear-gradient(135deg, #0f0a1f 0%, #1e1b4b 50%, #312e81 100%)'
  },
  {
    name: '冰川蓝',
    key: 'glacier-blue',
    primary: '#0e7490',
    secondary: '#06b6d4',
    accent: '#22d3ee',
    gradient: 'linear-gradient(135deg, #164e63 0%, #0e7490 50%, #155e75 100%)'
  },
  {
    name: '午夜蓝',
    key: 'midnight-blue',
    primary: '#172554',
    secondary: '#1e40af',
    accent: '#3b82f6',
    gradient: 'linear-gradient(135deg, #0c0a09 0%, #172554 50%, #1e3a8a 100%)'
  },
  {
    name: '极光蓝',
    key: 'aurora-blue',
    primary: '#0f766e',
    secondary: '#14b8a6',
    accent: '#2dd4bf',
    gradient: 'linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #115e59 100%)'
  }
]

const currentThemeIndex = ref(0)

const currentThemeName = computed(() => {
  return themes[currentThemeIndex.value].name
})

const changeTheme = () => {
  // 随机选择下一个主题（不重复）
  let newIndex
  do {
    newIndex = Math.floor(Math.random() * themes.length)
  } while (newIndex === currentThemeIndex.value && themes.length > 1)
  
  currentThemeIndex.value = newIndex
  applyTheme(themes[newIndex])
  
  // 保存到 localStorage
  localStorage.setItem('todo-theme-index', newIndex.toString())
}

const applyTheme = (theme) => {
  const root = document.documentElement
  root.style.setProperty('--theme-primary', theme.primary)
  root.style.setProperty('--theme-secondary', theme.secondary)
  root.style.setProperty('--theme-accent', theme.accent)
  root.style.setProperty('--theme-gradient', theme.gradient)
}

onMounted(() => {
  // 从 localStorage 恢复主题
  const savedIndex = localStorage.getItem('todo-theme-index')
  if (savedIndex) {
    currentThemeIndex.value = parseInt(savedIndex, 10)
  }
  applyTheme(themes[currentThemeIndex.value])
})
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.theme-name {
  font-weight: 500;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .theme-name {
    display: none;
  }
  
  .theme-toggle {
    padding: 8px;
  }
}
</style>
