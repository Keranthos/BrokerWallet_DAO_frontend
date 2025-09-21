//管理員界面显示
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const menuItems = [
  { title: '📋 审核材料', path: '/admin/medal-distribution', icon: '$clipboardList' },
  { title: '🏆 勋章排行榜', path: '/admin/medal-ranking', icon: '$trophy' },
  { title: '🔍 用户查询', path: '/admin/user-lookup', icon: '$accountSearch' },
];

const activePath = ref(route.path);
const sidebarCollapsed = ref(false);

// 监听路由变化更新活跃路径
watch(() => route.path, (newPath) => {
  activePath.value = newPath;
});

function onMenuClick(item: typeof menuItems[0]) {
  activePath.value = item.path;
  router.push(item.path);
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}
</script>

<template>
  <div class="admin-layout">
    <!-- 左侧导航栏 -->
    <nav :class="['sidebar', { collapsed: sidebarCollapsed }]">
      <!-- 折叠按钮 -->
      <div class="sidebar-header">
        <h2 v-if="!sidebarCollapsed" class="sidebar-title">🎯 管理员功能</h2>
        <v-btn
          @click="toggleSidebar"
          :icon="sidebarCollapsed ? '$menu' : '$menuOpen'"
          variant="text"
          color="white"
          size="large"
          class="collapse-btn"
        />
      </div>
      
      <ul class="menu-list">
        <li
          v-for="item in menuItems"
          :key="item.path"
          :class="['menu-item', { active: activePath === item.path }]"
          @click="onMenuClick(item)"
          :title="sidebarCollapsed ? item.title : ''"
        >
          <v-icon :icon="item.icon" class="menu-icon" />
          <span v-if="!sidebarCollapsed" class="menu-text">{{ item.title }}</span>
        </li>
      </ul>
    </nav>

    <!-- 右侧内容区 -->
    <main :class="['main-content', { expanded: sidebarCollapsed }]">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  font-size: 16px;
}

.sidebar {
  width: 280px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  position: relative;
}

.sidebar.collapsed {
  width: 80px;
  padding: 20px 10px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  min-height: 60px;
}

.sidebar-title {
  color: #ecf0f1;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  flex: 1;
}

.collapse-btn {
  background: rgba(255,255,255,0.1) !important;
  border-radius: 8px !important;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  gap: 12px;
}

.sidebar.collapsed .menu-item {
  padding: 16px 8px;
  justify-content: center;
}

.menu-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.menu-text {
  white-space: nowrap;
  overflow: hidden;
}

.menu-item:hover {
  background-color: rgba(52, 152, 219, 0.2);
  border-left-color: #3498db;
  transform: translateX(5px);
}

.sidebar.collapsed .menu-item:hover {
  transform: scale(1.1);
}

.menu-item.active {
  background-color: #3498db;
  border-left-color: #ecf0f1;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.main-content {
  flex: 1;
  background-color: #f8f9fa;
  padding: 30px;
  overflow-y: auto;
  font-size: 16px;
  transition: all 0.3s ease;
}

.main-content.expanded {
  margin-left: 0;
}

/* 确保图标正确显示 */
:deep(.v-icon) {
  font-size: 20px !important;
}

:deep(.v-btn .v-icon) {
  margin-right: 8px !important;
}

/* 确保按钮内容居中 */
:deep(.v-btn__content) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
}
</style>
