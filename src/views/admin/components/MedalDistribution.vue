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

async function fetchMaterials(page = 1) {
  if (!auth.user?.token) {
    console.warn('未登录或 token 为空');
    return;
  }

  try {
    const res = await api.admin.getPendingUsers(page, pageSize);
    console.log('接口返回数据:', res.data);

    if (res.data.code === 1 && Array.isArray(res.data.users)) {
      materials.value = res.data.users.map((u: any, index: number) => ({
        id: u.id || (page - 1) * pageSize + index + 1,
        title: u.originalFilename || u.displayName || '未知文件',
        email: u.username || u.displayName || '未知用户',
        walletAddress: u.walletAddress || u.email || '未知地址',
        fileUrl: `/api/admin/download/${encodeURIComponent(u.objectKey || u.fileName)}`,
        status: u.auditStatus || '待审核',
        submittedAt: u.uploadTime || new Date().toISOString().split('T')[0],
        medals: { gold: 0, silver: 0, bronze: 0 },
        username: u.username || u.walletAddress,
        fileSize: u.fileSize || 0,
      }));
      currentPage.value = page;
    } else {
      materials.value = [];
      console.warn('未获取到待审核材料');
    }
  } catch (err) {
    console.error('获取材料失败', err);
    materials.value = [];
  }
}

const filteredMaterials = computed(() =>
  filterStatus.value
    ? materials.value.filter((m) => m.status === filterStatus.value)
    : materials.value
);

async function downloadFile(url: string) {
  if (!auth.user?.token) return;

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
  if (!auth.user?.token) return;

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
  if (currentPage.value > 1) fetchMaterials(currentPage.value - 1);
}

function nextPage() {
  if (materials.value.length === pageSize) fetchMaterials(currentPage.value + 1);
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
      <h1 class="page-title">🏅 分发勋章 - 待审核材料</h1>
      
      <div class="filter-section">
        <label for="statusFilter" class="filter-label">状态筛选：</label>
        <select v-model="filterStatus" id="statusFilter" class="filter-select">
          <option value="">全部</option>
          <option value="待审核">待审核</option>
          <option value="已通过">已通过</option>
        </select>
      </div>
    </div>

    <div class="materials-list">
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
                <span :class="['status-badge', material.status === '待审核' ? 'pending' : 'approved']">
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

    <div style="margin-top: 16px; display: flex; justify-content: center; gap: 10px;">
      <button @click="prevPage" :disabled="currentPage <= 1">上一页</button>
      <span>第 {{ currentPage }} 页</span>
      <button @click="nextPage" :disabled="materials.length < pageSize">下一页</button>
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

.filter-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-label {
  font-size: 16px;
  font-weight: 600;
  color: #34495e;
}

.filter-select {
  padding: 10px 15px;
  font-size: 16px;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  background-color: white;
  color: #2c3e50;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #3498db;
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

</style>
