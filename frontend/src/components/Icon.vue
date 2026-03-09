<template>
  <svg 
    class="icon" 
    :class="iconClass"
    :style="iconStyle"
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    :stroke-width="strokeWidth"
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <!-- 首页/仪表盘 -->
    <path v-if="name === 'home'" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline v-if="name === 'home'" points="9 22 9 12 15 12 15 22"/>
    
    <!-- 日历/日常 -->
    <rect v-if="name === 'calendar'" x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line v-if="name === 'calendar'" x1="16" y1="2" x2="16" y2="6"/>
    <line v-if="name === 'calendar'" x1="8" y1="2" x2="8" y2="6"/>
    <line v-if="name === 'calendar'" x1="3" y1="10" x2="21" y2="10"/>
    
    <!-- 创作/编辑 -->
    <path v-if="name === 'edit'" d="M12 19l7-7 3 3-7 7-3-3z"/>
    <path v-if="name === 'edit'" d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
    <path v-if="name === 'edit'" d="M2 2l7.586 7.586"/>
    <circle v-if="name === 'edit'" cx="11" cy="11" r="2"/>
    
    <!-- 设置/齿轮 -->
    <circle v-if="name === 'settings'" cx="12" cy="12" r="3"/>
    <path v-if="name === 'settings'" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    
    <!-- 搜索 -->
    <circle v-if="name === 'search'" cx="11" cy="11" r="8"/>
    <line v-if="name === 'search'" x1="21" y1="21" x2="16.65" y2="16.65"/>
    
    <!-- 刷新 -->
    <polyline v-if="name === 'refresh'" points="23 4 23 10 17 10"/>
    <polyline v-if="name === 'refresh'" points="1 20 1 14 7 14"/>
    <path v-if="name === 'refresh'" d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    
    <!-- 添加 -->
    <line v-if="name === 'plus'" x1="12" y1="5" x2="12" y2="19"/>
    <line v-if="name === 'plus'" x1="5" y1="12" x2="19" y2="12"/>
    
    <!-- 删除 -->
    <polyline v-if="name === 'trash'" points="3 6 5 6 21 6"/>
    <path v-if="name === 'trash'" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    
    <!-- 编辑 -->
    <path v-if="name === 'pencil'" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path v-if="name === 'pencil'" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    
    <!-- 用户 -->
    <path v-if="name === 'user'" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle v-if="name === 'user'" cx="12" cy="7" r="4"/>
    
    <!-- 锁 -->
    <rect v-if="name === 'lock'" x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path v-if="name === 'lock'" d="M7 11V7a5 5 0 0 1 10 0v4"/>
    
    <!-- 钥匙 -->
    <path v-if="name === 'key'" d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    
    <!-- 统计 -->
    <line v-if="name === 'chart'" x1="18" y1="20" x2="18" y2="10"/>
    <line v-if="name === 'chart'" x1="12" y1="20" x2="12" y2="4"/>
    <line v-if="name === 'chart'" x1="6" y1="20" x2="6" y2="14"/>
    
    <!-- 文件夹 -->
    <path v-if="name === 'folder'" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    
    <!-- 标签 -->
    <path v-if="name === 'tag'" d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line v-if="name === 'tag'" x1="7" y1="7" x2="7.01" y2="7"/>
    
    <!-- 时钟/时间 -->
    <circle v-if="name === 'clock'" cx="12" cy="12" r="10"/>
    <polyline v-if="name === 'clock'" points="12 6 12 12 16 14"/>
    
    <!-- 检查/完成 -->
    <polyline v-if="name === 'check'" points="20 6 9 17 4 12"/>
    
    <!-- 下载 -->
    <path v-if="name === 'download'" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline v-if="name === 'download'" points="7 10 12 15 17 10"/>
    <line v-if="name === 'download'" x1="12" y1="15" x2="12" y2="3"/>
    
    <!-- 退出 -->
    <path v-if="name === 'logout'" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline v-if="name === 'logout'" points="16 17 21 12 16 7"/>
    <line v-if="name === 'logout'" x1="21" y1="12" x2="9" y2="12"/>
    
    <!-- 复制 -->
    <rect v-if="name === 'copy'" x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path v-if="name === 'copy'" d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    
    <!-- 撤销 -->
    <path v-if="name === 'revoke'" d="M3 6v18"/>
    <path v-if="name === 'revoke'" d="M18 9l-5-5-5 5"/>
    <path v-if="name === 'revoke'" d="M13 4v8a4 4 0 0 1-4 4H5"/>
    
    <!-- 灯泡/灵感 -->
    <path v-if="name === 'lightbulb'" d="M9 18h6a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"/>
    <path v-if="name === 'lightbulb'" d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
    
    <!-- 文档 -->
    <path v-if="name === 'file'" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline v-if="name === 'file'" points="14 2 14 8 20 8"/>
    <line v-if="name === 'file'" x1="16" y1="13" x2="8" y2="13"/>
    <line v-if="name === 'file'" x1="16" y1="17" x2="8" y2="17"/>
    
    <!-- 全局 -->
    <circle v-if="name === 'globe'" cx="12" cy="12" r="10"/>
    <line v-if="name === 'globe'" x1="2" y1="12" x2="22" y2="12"/>
    <path v-if="name === 'globe'" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    
    <!-- 数据库 -->
    <ellipse v-if="name === 'database'" cx="12" cy="5" rx="9" ry="3"/>
    <path v-if="name === 'database'" d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path v-if="name === 'database'" d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    
    <!-- 火花/AI -->
    <path v-if="name === 'sparkles'" d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/>
    
    <!-- 剪贴板 -->
    <rect v-if="name === 'clipboard'" x="9" y="2" width="6" height="4" rx="1"/>
    <path v-if="name === 'clipboard'" d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/>
    
    <!-- 购物车 -->
    <circle v-if="name === 'cart'" cx="9" cy="21" r="1"/>
    <circle v-if="name === 'cart'" cx="20" cy="21" r="1"/>
    <path v-if="name === 'cart'" d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    
    <!-- 书本 -->
    <path v-if="name === 'book'" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path v-if="name === 'book'" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    
    <!-- 公文包 -->
    <rect v-if="name === 'briefcase'" x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path v-if="name === 'briefcase'" d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    
    <!-- 火箭 -->
    <path v-if="name === 'rocket'" d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path v-if="name === 'rocket'" d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path v-if="name === 'rocket'" d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path v-if="name === 'rocket'" d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    
    <!-- 调色板/主题 -->
    <circle v-if="name === 'palette'" cx="12" cy="12" r="10"/>
    <circle v-if="name === 'palette'" cx="12" cy="12" r="2"/>
    <circle v-if="name === 'palette'" cx="12" cy="5" r="1.5"/>
    <circle v-if="name === 'palette'" cx="17" cy="7" r="1.5"/>
    <circle v-if="name === 'palette'" cx="19" cy="12" r="1.5"/>
    <circle v-if="name === 'palette'" cx="17" cy="17" r="1.5"/>
    <circle v-if="name === 'palette'" cx="7" cy="7" r="1.5"/>
    <circle v-if="name === 'palette'" cx="5" cy="12" r="1.5"/>
    <circle v-if="name === 'palette'" cx="7" cy="17" r="1.5"/>
    
    <!-- 云朵/AI -->
    <path v-if="name === 'cloud'" d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    
    <!-- 眼睛 -->
    <path v-if="name === 'eye'" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle v-if="name === 'eye'" cx="12" cy="12" r="3"/>
    
    <!-- 眼睛关闭 -->
    <path v-if="name === 'eye-off'" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.51 18.51 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line v-if="name === 'eye-off'" x1="1" y1="1" x2="23" y2="23"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 20
  },
  strokeWidth: {
    type: [Number, String],
    default: 2
  }
})

const iconClass = computed(() => `icon-${props.name}`)
const iconStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}))
</script>

<style scoped>
.icon {
  display: inline-block;
  line-height: 1;
}
</style>
