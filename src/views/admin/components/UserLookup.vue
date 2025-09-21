<template>
  <div class="user-lookup-container">
    <v-card class="pa-8" elevation="4">
      <v-card-title class="text-h4 mb-6">🔍 用户查询</v-card-title>
      
      <!-- 查询表单 -->
      <v-row class="mb-6">
        <v-col cols="12" md="8">
          <v-text-field
            v-model="walletAddress"
            label="钱包地址"
            placeholder="输入用户的钱包地址..."
            variant="outlined"
            :loading="searching"
            :disabled="searching"
            @keyup.enter="searchUser"
            prepend-inner-icon="$wallet"
            clearable
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-btn
            @click="searchUser"
            color="primary"
            size="large"
            :loading="searching"
            :disabled="!walletAddress || searching"
            block
            class="h-100"
          >
            <v-icon left class="mr-2">$magnify</v-icon>
            查询用户
          </v-btn>
        </v-col>
      </v-row>

      <!-- 用户信息展示 -->
      <div v-if="userInfo" class="mb-6">
        <v-card variant="outlined" class="pa-6">
          <v-card-title class="text-h5 mb-4">👤 用户信息</v-card-title>
          
          <v-row>
            <v-col cols="12" md="6">
              <div class="info-item mb-3">
                <span class="info-label">🔗 钱包地址:</span>
                <span class="info-value">{{ userInfo.walletAddress }}</span>
              </div>
              <div class="info-item mb-3">
                <span class="info-label">👤 显示名称:</span>
                <span class="info-value">{{ userInfo.displayName || '未设置' }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="info-item mb-3">
                <span class="info-label">🏆 总勋章数:</span>
                <span class="info-value">{{ userInfo.totalMedals }}</span>
              </div>
              <div class="info-item mb-3">
                <span class="info-label">📝 代表作:</span>
                <span class="info-value">{{ userInfo.representativeWork || '未设置' }}</span>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </div>

      <!-- 提交历史列表 -->
      <div v-if="submissions.length > 0">
        <v-card variant="outlined" class="pa-6">
          <v-card-title class="text-h5 mb-4">📋 提交历史</v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="submissions"
            :loading="loadingSubmissions"
            item-key="id"
            class="elevation-1"
            :items-per-page="10"
          >
            <!-- 文件名列 -->
            <template v-slot:item.fileName="{ item }">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="primary">$fileDocument</v-icon>
                <span>{{ item.fileName }}</span>
              </div>
            </template>

            <!-- 文件大小列 -->
            <template v-slot:item.fileSize="{ item }">
              <span class="text-caption">{{ formatFileSize(item.fileSize) }}</span>
            </template>

            <!-- 状态列 -->
            <template v-slot:item.auditStatusDesc="{ item }">
              <v-chip
                :color="getStatusColor(item.auditStatus)"
                size="small"
                variant="flat"
              >
                {{ item.auditStatusDesc }}
              </v-chip>
            </template>

            <!-- 勋章列 -->
            <template v-slot:item.medalAwardedDesc="{ item }">
              <div class="d-flex align-center">
                <span class="mr-1">{{ getMedalIcon(item.medalAwarded) }}</span>
                <span>{{ item.medalAwardedDesc }}</span>
              </div>
            </template>

            <!-- 时间列 -->
            <template v-slot:item.uploadTime="{ item }">
              <span class="text-caption">{{ formatDateTime(item.uploadTime) }}</span>
            </template>

            <!-- 操作列 -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                @click="viewSubmissionDetail(item)"
                size="small"
                variant="text"
                color="primary"
              >
                查看详情
              </v-btn>
            </template>

          </v-data-table>
        </v-card>
      </div>

      <!-- 空状态 -->
      <div v-else-if="searched && !searching">
        <v-alert type="info" class="ma-0">
          <div class="text-center">
            <v-icon size="48" class="mb-4">$fileSearchOutline</v-icon>
            <div class="text-h6 mb-2">没有找到提交记录</div>
            <div class="text-body-2">该用户还没有提交过证明材料</div>
          </div>
        </v-alert>
      </div>

      <!-- 错误提示 -->
      <v-alert
        v-if="errorMessage"
        type="error"
        class="mt-4"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

    </v-card>

    <!-- 提交详情对话框 -->
    <v-dialog v-model="detailDialog" max-width="600px">
      <v-card v-if="selectedSubmission">
        <v-card-title class="text-h5">
          📋 提交详情
        </v-card-title>
        
        <v-card-text>
          <div class="detail-content">
            <div class="detail-item mb-3">
              <strong>📄 文件名:</strong> {{ selectedSubmission.fileName }}
            </div>
            <div class="detail-item mb-3">
              <strong>📦 文件大小:</strong> {{ formatFileSize(selectedSubmission.fileSize) }}
            </div>
            <div class="detail-item mb-3">
              <strong>📅 提交时间:</strong> {{ formatDateTime(selectedSubmission.uploadTime) }}
            </div>
            <div class="detail-item mb-3">
              <strong>🔍 审核状态:</strong> 
              <v-chip
                :color="getStatusColor(selectedSubmission.auditStatus)"
                size="small"
                class="ml-2"
              >
                {{ selectedSubmission.auditStatusDesc }}
              </v-chip>
            </div>
            <div class="detail-item mb-3">
              <strong>🏅 勋章奖励:</strong> 
              <span>{{ getMedalIcon(selectedSubmission.medalAwarded) }} {{ selectedSubmission.medalAwardedDesc }}</span>
            </div>
            
            <!-- NFT信息 -->
            <div v-if="selectedSubmission.nftImage" class="detail-item mb-3">
              <strong>🖼️ NFT状态:</strong> {{ selectedSubmission.nftImage.mintStatusDesc }}
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="detailDialog = false"
            color="primary"
            variant="text"
          >
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/api'

// 响应式数据
const walletAddress = ref('')
const searching = ref(false)
const searched = ref(false)
const loadingSubmissions = ref(false)
const errorMessage = ref('')

const userInfo = ref<any>(null)
const submissions = ref<any[]>([])

const detailDialog = ref(false)
const selectedSubmission = ref<any>(null)

// 表格头部
const headers = [
  { title: '文件名', key: 'fileName', sortable: false },
  { title: '大小', key: 'fileSize', sortable: true },
  { title: '状态', key: 'auditStatusDesc', sortable: false },
  { title: '勋章', key: 'medalAwardedDesc', sortable: false },
  { title: '提交时间', key: 'uploadTime', sortable: true },
  { title: '操作', key: 'actions', sortable: false }
]

// 方法
const searchUser = async () => {
  if (!walletAddress.value || searching.value) {
    return
  }

  searching.value = true
  searched.value = false
  errorMessage.value = ''
  userInfo.value = null
  submissions.value = []

  try {
    // 获取用户提交历史
    const response = await api.upload.getUserSubmissions(walletAddress.value, 0, 50)
    
    if (response.data.success) {
      const data = response.data.data
      
      if (data.length > 0) {
        // 从第一个提交记录中获取用户信息
        const firstSubmission = data[0]
        if (firstSubmission.user) {
          userInfo.value = firstSubmission.user
          userInfo.value.totalMedals = firstSubmission.user.totalMedals || 0
        }
        
        submissions.value = data
      } else {
        // 没有提交记录，但用户可能存在
        userInfo.value = {
          walletAddress: walletAddress.value,
          displayName: '未设置',
          totalMedals: 0
        }
      }
      
      searched.value = true
    } else {
      errorMessage.value = response.data.message || '查询失败'
    }

  } catch (error: any) {
    console.error('查询用户失败:', error)
    errorMessage.value = '查询失败: ' + (error.response?.data?.message || error.message)
  } finally {
    searching.value = false
  }
}

const viewSubmissionDetail = (submission: any) => {
  selectedSubmission.value = submission
  detailDialog.value = true
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return '未知'
  try {
    return new Date(dateString).toLocaleString('zh-CN')
  } catch {
    return dateString
  }
}

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'orange'
    case 'APPROVED':
      return 'success'
    case 'REJECTED':
      return 'error'
    default:
      return 'grey'
  }
}

const getMedalIcon = (medal: string) => {
  switch (medal?.toUpperCase()) {
    case 'GOLD':
      return '🥇'
    case 'SILVER':
      return '🥈'
    case 'BRONZE':
      return '🥉'
    default:
      return '⚪'
  }
}
</script>

<style scoped>
.user-lookup-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: 600;
  min-width: 120px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.info-value {
  color: rgb(var(--v-theme-on-surface));
  word-break: break-all;
}

.detail-content {
  line-height: 1.6;
}

.detail-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}
</style>
