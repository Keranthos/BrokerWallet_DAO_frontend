<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '@/api';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

interface Material {
  id: number;
  title: string;
  email: string;
  fileUrl: string;
  status: string;
  statusCode: string; // PENDING, APPROVED, REJECTED
  submittedAt: string;
  medals: { gold: number; silver: number; bronze: number };
  username: string;
  fileSize: number;
  walletAddress: string;
}

const auth = useAuthStore(); // Pinia 用户信息
const router = useRouter(); // 路由跳转

const filterStatus = ref('');
const materials = ref<Material[]>([]);
const currentPage = ref(1);
const pageSize = 10;
const totalPages = ref(1); // 总页数
const totalCount = ref(0); // 总记录数
const activeTab = ref<'pending' | 'approved' | 'all'>('pending'); // 当前标签页
const loading = ref(false);
const searchQuery = ref(''); // 搜索关键词

async function fetchMaterials(page = 1) {
  if (!auth.user) {
    console.warn('未登录');
    return;
  }

  loading.value = true;
  try {
    let res;
    // 根据当前标签页调用不同的API
    switch (activeTab.value) {
      case 'pending':
        res = await api.admin.getPendingUsers(page, pageSize);
        break;
      case 'approved':
        res = await api.admin.getApprovedUsers(page, pageSize);
        break;
      case 'all':
        res = await api.admin.getAllUsers(page, pageSize);
        break;
      default:
        res = await api.admin.getPendingUsers(page, pageSize);
    }
    console.log('接口返回数据:', res.data);

    if (res.data.code === 1 && Array.isArray(res.data.users)) {
      materials.value = res.data.users.map((u: any, index: number) => {
        // 根据文件数量决定标题显示（与手机端保持一致）
        let title = u.originalFilename || u.displayName || '未知文件';
        if (u.fileCount && u.fileCount > 1) {
          title = `${title} 等 ${u.fileCount} 个文件`;
        }
        
        // 将英文状态码转换为中文显示
        const statusCode = u.auditStatusCode || 'PENDING';
        let statusText = '待审核';
        if (statusCode === 'APPROVED') {
          statusText = '审核通过';
        } else if (statusCode === 'REJECTED') {
          statusText = '审核拒绝';
        } else if (statusCode === 'PENDING') {
          statusText = '待审核';
        }
        
        return {
          id: u.id || (page - 1) * pageSize + index + 1,
          title: title,
          email: u.username || u.displayName || '未知用户',
          walletAddress: u.walletAddress || u.email || '未知地址',
          fileUrl: `/api/admin/download/${encodeURIComponent(u.objectKey || u.fileName)}`,
          status: statusText,  // 使用前端转换的中文状态
          statusCode: statusCode,
          submittedAt: u.uploadTime || new Date().toISOString().split('T')[0],
          medals: { gold: 0, silver: 0, bronze: 0 },
          username: u.username || u.walletAddress,
          fileSize: u.fileSize || 0,
        };
      });
      currentPage.value = page;
      
      // 保存分页信息
      totalPages.value = res.data.totalPages || 1;
      totalCount.value = res.data.total || 0;
      console.log(`分页信息: 当前第${page}页, 共${totalPages.value}页, 总计${totalCount.value}条记录`);
    } else {
      materials.value = [];
      totalPages.value = 1;
      totalCount.value = 0;
      console.warn('未获取到待审核材料');
    }
  } catch (err) {
    console.error('获取材料失败', err);
    materials.value = [];
  } finally {
    loading.value = false;
  }
}

// 切换标签页
function switchTab(tab: 'pending' | 'approved' | 'all') {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  currentPage.value = 1;
  fetchMaterials(1);
}

const filteredMaterials = computed(() => {
  let filtered = materials.value;
  
  // 按状态过滤
  if (filterStatus.value) {
    filtered = filtered.filter((m) => m.status === filterStatus.value);
  }
  
  // 按花名搜索
  if (searchQuery.value && searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase();
    filtered = filtered.filter((m) => 
      m.email?.toLowerCase().includes(query) || 
      m.walletAddress?.toLowerCase().includes(query)
    );
  }
  
  return filtered;
});

async function downloadFile(url: string) {
  if (!auth.user) return;

  try {
    const objectKey = url.split('/').pop();
    if (!objectKey) return;
    
    const res = await api.admin.downloadFile(decodeURIComponent(objectKey));

    const blob = new Blob([res.data]);
    const link = document.createElement('a');
    const filename = objectKey;
    link.href = window.URL.createObjectURL(blob);
    link.download = decodeURIComponent(filename);
    link.click();
    window.URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error('下载失败', err);
    alert('下载失败，请检查文件是否存在');
  }
}


async function submitMedals(material: Material) {
  if (!auth.user) return;

  try {
    const payload = {
      username: material.username,
      approve: 1,
      firstnum: material.medals.gold,
      secondnum: material.medals.silver,
      thirdnum: material.medals.bronze,
    };
    const res = await api.admin.reviewUser(payload);
    console.log('分配勋章返回:', res.data);

    if (res.data.success || res.data.code === 1) {
      alert(`为 ${material.email} 分配成功！`);
      material.status = '已通过';
    } else {
      alert('分配失败: ' + (res.data.message || '未知错误'));
    }
  } catch (err: any) {
    console.error('分配勋章失败', err);
    alert('分配失败: ' + (err.response?.data?.message || err.message || '网络错误'));
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    fetchMaterials(currentPage.value - 1);
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    fetchMaterials(currentPage.value + 1);
  }
}

// 回到登录页面
function goLogin() {
  auth.logout();
  router.push('/login');
}

// 进入详情页面
function goToDetail(material: Material) {
  router.push(`/admin/material-detail/${material.id}`);
}

// 格式化文件大小
function formatFileSize(bytes: number) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 搜索输入处理
function onSearchInput() {
  // 实时过滤，不需要额外操作
  console.log('搜索关键词:', searchQuery.value);
}

// 清除搜索
function clearSearch() {
  searchQuery.value = '';
}

onMounted(() => fetchMaterials(currentPage.value));
</script>

<template>
  <div>
    <!-- 右上角回到登录按钮 -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
      <button
        @click="goLogin"
        style="padding: 6px 12px; background-color: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        回到登录
      </button>
    </div>

    <div class="page-header">
      <h1 class="page-title">🏅 分发勋章 - 材料审核</h1>
      
      <!-- 标签页切换 -->
      <div class="tabs-section">
        <button 
          @click="switchTab('pending')" 
          :class="['tab-btn', { active: activeTab === 'pending' }]"
        >
          📋 待审核
        </button>
        <button 
          @click="switchTab('approved')" 
          :class="['tab-btn', { active: activeTab === 'approved' }]"
        >
          ✅ 已审核
        </button>
        <button 
          @click="switchTab('all')" 
          :class="['tab-btn', { active: activeTab === 'all' }]"
        >
          📚 全部
        </button>
      </div>
      
      <!-- 搜索框 -->
      <div class="search-section">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 按用户花名搜索..."
          class="search-input"
          @input="onSearchInput"
        />
        <button 
          v-if="searchQuery"
          @click="clearSearch"
          class="clear-btn"
        >
          ✕ 清除
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="materials.length === 0" class="empty-state">
      <p>暂无{{ activeTab === 'pending' ? '待审核' : activeTab === 'approved' ? '已审核' : '' }}材料</p>
    </div>

    <div v-else class="materials-list">
      <div
        v-for="material in filteredMaterials"
        :key="material.id"
        class="material-card"
        @click="goToDetail(material)"
      >
        <div class="material-header">
          <div class="material-info">
            <h3 class="material-title">{{ material.title }}</h3>
            <div class="material-details">
              <p class="material-detail"><span class="label">👤 用户:</span> {{ material.email }}</p>
              <p class="material-detail"><span class="label">📊 状态:</span> 
                <span :class="['status-badge', 
                  material.statusCode === 'PENDING' ? 'pending' : 
                  material.statusCode === 'APPROVED' ? 'approved' : 'rejected']">
                  {{ material.status }}
                </span>
              </p>
              <p class="material-detail"><span class="label">⏰ 提交时间:</span> {{ material.submittedAt }}</p>
              <p class="material-detail"><span class="label">📁 文件大小:</span> {{ formatFileSize(material.fileSize) }}</p>
            </div>
          </div>
          <div class="action-buttons">
            <button
              @click.stop="downloadFile(material.fileUrl)"
              class="download-btn"
            >
              📥 下载
            </button>
            <div class="detail-hint">
              <span class="click-hint">👆 点击卡片查看详情</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div style="margin-top: 16px; display: flex; justify-content: center; align-items: center; gap: 10px;">
      <button @click="prevPage" :disabled="currentPage <= 1" class="pagination-btn">上一页</button>
      <span class="pagination-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页（总计 {{ totalCount }} 条）</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages" class="pagination-btn">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

/* 标签页样式 */
.tabs-section {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

/* 搜索框样式 */
.search-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.search-input {
  width: 400px;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #3498db;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #2980b9;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.search-input::placeholder {
  color: #95a5a6;
}

.clear-btn {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #e74c3c;
  background-color: white;
  border: 2px solid #e74c3c;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background-color: #e74c3c;
  color: white;
}

.tab-btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  background-color: white;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background-color: #ecf0f1;
  border-color: #95a5a6;
}

.tab-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

/* 加载和空状态样式 */
.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #7f8c8d;
}

.materials-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.material-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border: 1px solid #e1e8ed;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.material-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  border-color: #3498db;
}

.material-card:hover .click-hint {
  opacity: 1;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.material-info {
  flex: 1;
}

.material-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
}

.material-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.material-detail {
  font-size: 16px;
  color: #5a6c7d;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-weight: 600;
  color: #34495e;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.download-btn {
  padding: 12px 20px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.download-btn:hover {
  background: linear-gradient(135deg, #2980b9, #21618c);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.medal-section {
  border-top: 2px solid #ecf0f1;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.medal-inputs {
  display: flex;
  gap: 20px;
  align-items: center;
}

.medal-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.medal-label {
  font-size: 16px;
  font-weight: 600;
  color: #34495e;
  min-width: 80px;
}

.medal-input {
  width: 80px;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #bdc3c7;
  border-radius: 6px;
  text-align: center;
  transition: border-color 0.3s ease;
}

.medal-input:focus {
  outline: none;
  border-color: #3498db;
}

.submit-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
}

.submit-btn:hover {
  background: linear-gradient(135deg, #229954, #1e8449);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.detail-hint {
  text-align: center;
}

.click-hint {
  font-size: 14px;
  color: #3498db;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  font-weight: 500;
}

/* 分页样式 */
.pagination-btn {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.pagination-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2980b9, #21618c);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.pagination-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.6;
}

.pagination-info {
  font-size: 16px;
  font-weight: 600;
  color: #34495e;
  padding: 0 20px;
}

</style>
