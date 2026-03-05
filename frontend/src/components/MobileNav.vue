<template>
  <nav class="mobile-nav glass">
    <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
      <Icon name="home" :size="24" />
      <span class="nav-label">首页</span>
    </router-link>
    
    <router-link to="/daily" class="nav-item" :class="{ active: $route.path === '/daily' }">
      <Icon name="calendar" :size="24" />
      <span class="nav-label">日常</span>
    </router-link>
    
    <router-link to="/creative" class="nav-item" :class="{ active: $route.path === '/creative' }">
      <Icon name="edit" :size="24" />
      <span class="nav-label">创作</span>
    </router-link>
    
    <router-link to="/settings" class="nav-item" :class="{ active: $route.path === '/settings' }">
      <Icon name="settings" :size="24" />
      <span class="nav-label">设置</span>
    </router-link>
  </nav>
</template>

<script setup>
import Icon from './Icon.vue'
// 移动端底部导航组件
</script>

<style scoped>
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 12, 41, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 0;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 1000;
}

.mobile-nav .nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s ease;
  flex: 1;
}

.mobile-nav .nav-item:hover {
  color: rgba(255, 255, 255, 0.7);
}

.mobile-nav .nav-item.active {
  color: #3b82f6;
}

.mobile-nav .nav-icon {
  line-height: 1;
}

.mobile-nav .nav-icon :deep(svg) {
  display: block;
}

.mobile-nav .nav-label {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

/* 移动端显示 */
@media (max-width: 768px) {
  .mobile-nav {
    display: flex;
  }
}
</style>
