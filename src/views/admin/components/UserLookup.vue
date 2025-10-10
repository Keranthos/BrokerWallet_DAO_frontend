<template>
  <div class="user-lookup-container">
    <v-card class="pa-8" elevation="4">
      <div class="header-with-help">
        <div class="header-title">
          <v-card-title class="text-h4">🔍 用户查询</v-card-title>
        </div>
        <v-btn
          @click="helpDialog = true"
          variant="text"
          color="primary"
          size="x-large"
          class="help-btn"
          title="查看使用说明"
          icon
        >
          <v-icon size="32">$helpCircleOutline</v-icon>
        </v-btn>
      </div>
      
      <!-- 查询类型选择 -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn-toggle
            v-model="queryType"
            color="primary"
            mandatory
            divided
            class="d-flex justify-center"
            @update:model-value="onQueryTypeChange"
          >
            <v-btn value="displayName" size="large">
              👤 用户花名查询
            </v-btn>
            <v-btn value="wallet" size="large">
              🔗 钱包地址查询
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
      
      <!-- 查询表单 -->
      <v-row class="mb-6">
        <!-- 钱包地址查询 -->
        <template v-if="queryType === 'wallet'">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="walletAddress"
              label="钱包地址"
              placeholder="输入用户的钱包地址 (40位十六进制字符)..."
              variant="outlined"
              :loading="searching"
              :disabled="searching"
              @keyup.enter="searchUser"
              @input="validateWalletAddress"
              prepend-inner-icon="$wallet"
              clearable
              :error-messages="walletAddressError"
              :rules="[walletAddressRule]"
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
                🔍 查询用户
              </v-btn>
          </v-col>
        </template>
        
        <!-- 花名查询 -->
        <template v-else>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="displayNameQuery"
              label="用户花名"
              placeholder="输入用户花名（支持模糊搜索）..."
              variant="outlined"
              :loading="searching"
              :disabled="searching"
              @keyup.enter="searchByDisplayName"
              prepend-inner-icon="$account"
              clearable
            />
          </v-col>
          <v-col cols="12" md="4">
              <v-btn
                @click="searchByDisplayName"
                color="primary"
                size="large"
                :loading="searching"
                :disabled="!displayNameQuery || searching"
                block
                class="h-100"
              >
                🔍 查询花名
              </v-btn>
          </v-col>
        </template>
      </v-row>

      <!-- 花名查询结果（多个用户） -->
      <div v-if="displayNameResults.length > 0" class="mb-6">
        <v-card variant="outlined" class="pa-6">
          <v-card-title class="text-h5 mb-4">
            👥 查询结果（找到 {{ displayNameResults.length }} 个用户）
          </v-card-title>
          
          <v-alert v-if="displayNameResults.length > 1" type="warning" variant="tonal" class="mb-4">
            <div class="d-flex align-center">
              <v-icon class="mr-2">$alert</v-icon>
              <span>检测到多个用户使用相同或相似的花名</span>
            </div>
          </v-alert>
          
          <div v-for="(user, index) in displayNameResults" :key="index" class="user-result-card mb-4">
            <v-card variant="outlined" class="pa-4">
              <v-row align="center">
                <v-col cols="12" md="6">
                  <div class="info-item mb-2">
                    <span class="info-label">👤 花名:</span>
                    <span class="info-value font-weight-bold">{{ user.displayName }}</span>
                  </div>
                  <div class="info-item mb-2">
                    <span class="info-label">🔗 钱包地址:</span>
                    <span class="info-value address-text">{{ user.walletAddress }}</span>
                    <v-btn
                      @click="copyAndSearchAddress(user.walletAddress)"
                      size="small"
                      variant="text"
                      color="primary"
                      class="ml-2"
                    >
                      📋 复制并查询
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="medals-display">
                    <v-chip color="warning" class="mr-2">
                      🥇 {{ user.goldMedals }}
                    </v-chip>
                    <v-chip color="grey" class="mr-2">
                      🥈 {{ user.silverMedals }}
                    </v-chip>
                    <v-chip color="brown" class="mr-2">
                      🥉 {{ user.bronzeMedals }}
                    </v-chip>
                    <v-chip color="primary">
                      🏆 总计: {{ user.totalMedals }}
                    </v-chip>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </div>
        </v-card>
      </div>
      
      <!-- 用户信息展示（钱包地址查询结果） -->
      <div v-if="userInfo && queryType === 'wallet'" class="mb-6">
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
              <span class="text-truncate">{{ item.fileName }}</span>
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

      <!-- 空状态（仅在钱包地址查询时显示） -->
      <div v-else-if="searched && !searching && queryType === 'wallet'">
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

    <!-- 帮助对话框 -->
    <v-dialog v-model="helpDialog" max-width="700px">
      <v-card class="help-dialog-card">
        <v-card-title class="text-h5 bg-primary text-white pa-4 help-dialog-header">
          <v-icon class="mr-2">$helpCircle</v-icon>
          查询功能使用说明
        </v-card-title>
        
        <v-card-text class="pa-6 help-dialog-content">
          <div class="help-content">
            <!-- 花名查询说明 -->
            <div class="help-section mb-6">
              <h3 class="help-title">
                <v-icon color="primary" class="mr-2">$account</v-icon>
                👤 用户花名查询
              </h3>
              <div class="help-description">
                <p class="mb-2"><strong>作用：</strong></p>
                <ul class="mb-3">
                  <li>快速查找使用特定花名的用户</li>
                  <li>支持模糊搜索，不区分大小写</li>
                  <li>可以发现花名重复的情况</li>
                </ul>
                
                <p class="mb-2"><strong>如何查询：</strong></p>
                <ol class="mb-3">
                  <li>选择"用户花名查询"标签</li>
                  <li>输入花名（如："abc"、"张三"）</li>
                  <li>点击"🔍 查询花名"按钮</li>
                </ol>
                
                <p class="mb-2"><strong>查询结果：</strong></p>
                <ul>
                  <li>显示所有匹配的用户列表</li>
                  <li>每个用户显示：花名、钱包地址、勋章数</li>
                  <li>可以点击"📋 复制并查询"查看详细信息</li>
                  <li>如果有多个用户使用相同花名，会显示警告提示</li>
                </ul>
              </div>
            </div>
            
            <v-divider class="my-4" />
            
            <!-- 地址查询说明 -->
            <div class="help-section">
              <h3 class="help-title">
                <v-icon color="success" class="mr-2">$wallet</v-icon>
                🔗 钱包地址查询
              </h3>
              <div class="help-description">
                <p class="mb-2"><strong>作用：</strong></p>
                <ul class="mb-3">
                  <li>查询特定钱包地址的用户信息</li>
                  <li>查看用户的所有提交历史</li>
                  <li>了解用户的勋章和代表作</li>
                </ul>
                
                <p class="mb-2"><strong>如何查询：</strong></p>
                <ol class="mb-3">
                  <li>选择"钱包地址查询"标签</li>
                  <li>输入完整的钱包地址（40位十六进制字符）</li>
                  <li>点击"🔍 查询用户"按钮</li>
                </ol>
                
                <p class="mb-2"><strong>查询结果：</strong></p>
                <ul>
                  <li>显示用户基本信息（地址、花名、勋章数、代表作）</li>
                  <li>显示完整的提交历史列表</li>
                  <li>可以查看每个提交的详细信息</li>
                </ul>
              </div>
            </div>
            
            <v-divider class="my-4" />
            
            <!-- 使用技巧 -->
            <div class="help-section">
              <h3 class="help-title">
                <v-icon color="warning" class="mr-2">$lightbulb</v-icon>
                💡 使用技巧
              </h3>
              <div class="help-description">
                <ul>
                  <li><strong>快速切换：</strong>在花名查询结果中点击"📋 复制并查询"，可以自动切换到地址查询并查看详细信息</li>
                  <li><strong>模糊搜索：</strong>花名查询支持部分匹配，输入"abc"可以匹配"abc123"</li>
                  <li><strong>重复检测：</strong>如果多个用户使用相同花名，系统会显示警告提示</li>
                </ul>
              </div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            @click="helpDialog = false"
            color="primary"
            variant="elevated"
            size="large"
          >
            我知道了
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
const queryType = ref<'wallet' | 'displayName'>('displayName') // 查询类型，默认为花名查询
const walletAddress = ref('')
const displayNameQuery = ref('') // 花名查询
const searching = ref(false)
const searched = ref(false)
const loadingSubmissions = ref(false)
const errorMessage = ref('')
const walletAddressError = ref('')

const userInfo = ref<any>(null)
const submissions = ref<any[]>([])
const displayNameResults = ref<any[]>([]) // 花名查询结果（可能多个用户）

const detailDialog = ref(false)
const selectedSubmission = ref<any>(null)
const helpDialog = ref(false) // 帮助对话框

// 表格头部（移除"勋章"列）
const headers = [
  { title: '文件名', key: 'fileName', sortable: false },
  { title: '大小', key: 'fileSize', sortable: true },
  { title: '状态', key: 'auditStatusDesc', sortable: false },
  { title: '提交时间', key: 'uploadTime', sortable: true },
  { title: '操作', key: 'actions', sortable: false }
]

// 钱包地址验证规则
const walletAddressRule = (value: string) => {
  if (!value) {
    return '请输入钱包地址'
  }
  
  // 检查长度（应该是40个字符）
  if (value.length !== 40) {
    return '钱包地址应为40位字符'
  }
  
  // 检查是否为十六进制字符
  const hexPattern = /^[0-9a-fA-F]+$/
  if (!hexPattern.test(value)) {
    return '钱包地址只能包含十六进制字符 (0-9, a-f, A-F)'
  }
  
  return true
}

// 实时验证钱包地址
const validateWalletAddress = () => {
  walletAddressError.value = ''
  
  if (!walletAddress.value) {
    return
  }
  
  const result = walletAddressRule(walletAddress.value)
  if (result !== true) {
    walletAddressError.value = result
  }
}

// 方法
const searchUser = async () => {
  if (!walletAddress.value || searching.value) {
    return
  }

  // 验证钱包地址格式
  const validationResult = walletAddressRule(walletAddress.value)
  if (validationResult !== true) {
    errorMessage.value = validationResult
    return
  }

  searching.value = true
  searched.value = false
  errorMessage.value = ''
  walletAddressError.value = ''
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

// 按花名查询
const searchByDisplayName = async () => {
  if (!displayNameQuery.value || searching.value) {
    return
  }

  searching.value = true
  searched.value = false  // 花名查询不需要显示"没有提交记录"
  errorMessage.value = ''
  userInfo.value = null
  submissions.value = []
  displayNameResults.value = []

  try {
    const response = await api.admin.searchByDisplayName(displayNameQuery.value)
    
    console.log('花名查询返回:', response.data)
    
    if (response.data.success) {
      displayNameResults.value = response.data.users || []
      // 注意：不设置 searched = true，避免显示"没有提交记录"
      
      if (displayNameResults.value.length === 0) {
        errorMessage.value = '未找到使用该花名的用户'
      }
    } else {
      errorMessage.value = response.data.message || '查询失败'
    }

  } catch (error: any) {
    console.error('花名查询失败:', error)
    errorMessage.value = '查询失败: ' + (error.response?.data?.message || error.message)
  } finally {
    searching.value = false
  }
}

// 切换查询类型时清空所有结果
const onQueryTypeChange = () => {
  console.log('切换查询类型:', queryType.value)
  
  // 清空所有查询结果
  userInfo.value = null
  submissions.value = []
  displayNameResults.value = []
  errorMessage.value = ''
  walletAddressError.value = ''
  searched.value = false
  
  // 清空输入框
  walletAddress.value = ''
  displayNameQuery.value = ''
}

// 复制地址并切换到钱包地址查询
const copyAndSearchAddress = async (address: string) => {
  try {
    // 复制到剪贴板
    await navigator.clipboard.writeText(address)
    
    // 清空所有结果
    displayNameResults.value = []
    userInfo.value = null
    submissions.value = []
    errorMessage.value = ''
    
    // 切换到钱包地址查询模式
    queryType.value = 'wallet'
    walletAddress.value = address
    
    // 自动执行查询
    await searchUser()
    
    // 提示用户
    console.log('✅ 地址已复制并查询:', address)
    
  } catch (error) {
    console.error('复制失败:', error)
    errorMessage.value = '复制地址失败，请手动复制'
  }
}
</script>

<style scoped>
.user-lookup-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-with-help {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 24px;
  gap: 16px;
}

.header-title {
  flex: 1;
}

.header-title .v-card-title {
  padding: 0 !important;
}

.help-btn {
  flex-shrink: 0;
  min-width: 48px !important;
  min-height: 48px !important;
  border-radius: 50% !important;
}

.help-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
  transform: scale(1.1);
  transition: all 0.2s ease;
}

.help-btn .v-icon {
  display: flex;
  align-items: center;
  justify-content: center;
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

.user-result-card {
  transition: all 0.3s ease;
}

.user-result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.address-text {
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #2c3e50;
}

.medals-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}

@media (max-width: 960px) {
  .medals-display {
    justify-content: center;
    margin-top: 12px;
  }
}

/* 帮助对话框样式 */
.help-dialog-card {
  border-radius: 16px !important;
  overflow: hidden;
}

.help-dialog-header {
  border-radius: 0 !important;
}

.help-dialog-content {
  max-height: 70vh;
  overflow-y: auto;
  border-radius: 0 0 16px 16px;
}

/* 自定义滚动条样式 */
.help-dialog-content::-webkit-scrollbar {
  width: 8px;
}

.help-dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.help-dialog-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.help-dialog-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.help-content {
  line-height: 1.8;
}

.help-section {
  margin-bottom: 24px;
}

.help-title {
  font-size: 1.2em;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.help-description {
  color: #5a6c7d;
  font-size: 0.95em;
}

.help-description ul,
.help-description ol {
  margin-left: 20px;
  padding-left: 10px;
}

.help-description li {
  margin-bottom: 8px;
}

.help-description strong {
  color: #34495e;
}
</style>

