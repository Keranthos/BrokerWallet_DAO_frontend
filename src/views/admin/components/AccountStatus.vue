<template>
  <div class="account-status-container">
    <v-card class="pa-8" elevation="4">
      <div class="header">
        <h1 class="title">💼 后端账户状态</h1>
        <p class="subtitle">监控区块链操作账户的连接状态和余额</p>
      </div>

      <v-divider class="my-6" />

      <!-- 刷新按钮 -->
      <v-row class="mb-6">
        <v-col cols="12" class="text-center">
          <v-btn
            @click="checkAccountStatus"
            color="primary"
            size="large"
            :loading="loading"
          >
            <v-icon class="mr-2">$refresh</v-icon>
            刷新状态
          </v-btn>
        </v-col>
      </v-row>

      <!-- 加载中 -->
      <v-row v-if="loading" class="mb-6">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-h6">正在检查账户状态...</p>
        </v-col>
      </v-row>

      <!-- 账户状态信息 -->
      <div v-if="!loading && accountStatus">
        <!-- 后端连接状态 -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card :color="accountStatus.backendConnected ? 'success' : 'error'" variant="tonal" class="pa-6">
              <div class="status-header">
                <v-icon size="48" :color="accountStatus.backendConnected ? 'success' : 'error'">
                  {{ accountStatus.backendConnected ? '$checkCircle' : '$alertCircle' }}
                </v-icon>
                <div class="ml-4">
                  <h2 class="text-h5">
                    {{ accountStatus.backendConnected ? '后端连接正常' : '后端连接失败' }}
                  </h2>
                  <p class="text-subtitle-1 mt-2">
                    {{ accountStatus.backendConnected ? '后端服务运行正常' : '无法连接到后端服务' }}
                  </p>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
        
        <!-- 区块链连接状态 -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card :color="accountStatus.connected ? 'success' : 'error'" variant="tonal" class="pa-6">
              <div class="status-header">
                <v-icon size="48" :color="accountStatus.connected ? 'success' : 'error'">
                  {{ accountStatus.connected ? '$checkCircle' : '$alertCircle' }}
                </v-icon>
                <div class="ml-4">
                  <h2 class="text-h5">
                    {{ accountStatus.connected ? '区块链连接正常' : '区块链连接失败' }}
                  </h2>
                  <p class="text-subtitle-1 mt-2">
                    {{ accountStatus.connected ? '区块链节点连接成功' : '无法连接到区块链节点' }}
                  </p>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- 账户信息 -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card variant="outlined" class="pa-6">
              <v-card-title class="text-h5 mb-4">🔑 账户地址</v-card-title>
              
              <div class="account-address-section">
                <div class="address-display">
                  <code class="address-text">{{ accountStatus.address }}</code>
                  <v-btn
                    @click="copyAddress"
                    icon
                    size="small"
                    variant="text"
                    class="ml-2"
                  >
                    <v-icon>$contentCopy</v-icon>
                  </v-btn>
                </div>
                <p class="mt-2 text-caption text-grey">
                  此账户用于执行所有区块链操作（铸造NFT、发放勋章、转账BKC）
                </p>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- 余额信息 -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card 
              variant="outlined" 
              class="pa-6"
              :class="{ 'low-balance-warning': accountStatus.balance < 1000 }"
            >
              <v-card-title class="text-h5 mb-4">💰 账户余额</v-card-title>
              
              <div class="balance-section">
                <div class="balance-display">
                  <span class="balance-amount">{{ formatBalance(accountStatus.balance) }}</span>
                  <span class="balance-unit">ETH</span>
                </div>
                
                <v-divider class="my-4" />
                
                <!-- 余额状态 -->
                <v-alert
                  v-if="accountStatus.balance < 1000"
                  type="warning"
                  variant="tonal"
                  class="mb-4"
                >
                  <div class="text-h6 mb-2">⚠️ 余额不足警告</div>
                  <p class="mb-2">
                    当前余额低于 1000 ETH，可能无法完成审核操作（铸造NFT、转账BKC等）
                  </p>
                  <p class="font-weight-bold">
                    请向以下地址转账以支持系统运行：
                  </p>
                  <div class="recharge-address mt-3">
                    <code class="address-text-large">{{ accountStatus.address }}</code>
                  <v-btn
                    @click="copyAddress"
                    color="warning"
                    size="small"
                    class="ml-3"
                  >
                    <v-icon class="mr-1">$contentCopy</v-icon>
                    复制地址
                  </v-btn>
                  </div>
                </v-alert>
                
                <v-alert
                  v-else
                  type="success"
                  variant="tonal"
                  icon="$checkCircle"
                >
                  <div class="text-h6">余额充足</div>
                  <p class="mb-0 mt-2">账户余额充足，可以正常进行审核操作</p>
                </v-alert>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- 权限信息 -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card variant="outlined" class="pa-6">
              <v-card-title class="text-h5 mb-4">🔐 账户权限</v-card-title>
              
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon :color="accountStatus.hasNftPermission ? 'success' : 'error'">
                      {{ accountStatus.hasNftPermission ? '$checkCircle' : '$closeCircle' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>NFT铸造权限</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ accountStatus.hasNftPermission ? '已授权' : '未授权（无法铸造NFT）' }}
                  </v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="info">$information</v-icon>
                  </template>
                  <v-list-item-title>NFT铸造费用</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ accountStatus.mintFee || '0' }} ETH
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <!-- 最后更新时间 -->
        <v-row>
          <v-col cols="12" class="text-center">
            <p class="text-caption text-grey">
              最后更新时间: {{ formatDate(accountStatus.lastChecked) }}
            </p>
          </v-col>
        </v-row>
      </div>

      <!-- 错误信息 -->
      <v-row v-if="!loading && error">
        <v-col cols="12">
          <v-alert type="error" variant="tonal">
            <div class="text-h6 mb-2">检查失败</div>
            <p>{{ error }}</p>
            <p class="mt-2">
              <strong>建议：</strong>请检查后端服务是否正常运行，区块链节点是否可访问
            </p>
          </v-alert>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'

// 响应式数据
const loading = ref(false)
const error = ref<string | null>(null)
const accountStatus = ref<any>(null)

// 格式化余额
const formatBalance = (balance: number) => {
  if (balance === undefined || balance === null) return '0.000000'
  return balance.toFixed(6)
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 复制地址
const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(accountStatus.value.address)
    alert('地址已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  }
}

// 检查账户状态
const checkAccountStatus = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 1. 先测试后端连接
    let backendConnected = false
    try {
      const testResponse = await api.upload.test()
      backendConnected = testResponse.data.success === true
      console.log('后端连接测试:', backendConnected)
    } catch (err) {
      console.error('后端连接失败:', err)
      backendConnected = false
    }
    
    // 2. 调用后端API检查账户状态
    const response = await api.admin.checkAccountStatus()
    
    if (response.data.success) {
      accountStatus.value = {
        ...response.data.data,
        backendConnected: backendConnected,
        lastChecked: new Date().toISOString()
      }
      console.log('账户状态:', accountStatus.value)
    } else {
      error.value = response.data.message || '检查失败'
    }
  } catch (err: any) {
    console.error('检查账户状态失败:', err)
    error.value = '检查失败: ' + (err.response?.data?.message || err.message)
    // 即使失败也设置backendConnected为false
    accountStatus.value = {
      backendConnected: false,
      connected: false,
      address: '无法获取',
      balance: 0,
      hasNftPermission: false,
      mintFee: '0',
      lastChecked: new Date().toISOString()
    }
  } finally {
    loading.value = false
  }
}

// 页面加载时自动检查
onMounted(() => {
  checkAccountStatus()
})
</script>

<style scoped>
.account-status-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin-top: 8px;
}

.status-header {
  display: flex;
  align-items: center;
}

.account-address-section {
  display: flex;
  flex-direction: column;
}

.address-display {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 8px;
}

.address-text {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #2c3e50;
  word-break: break-all;
}

.address-text-large {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #2c3e50;
  background: #fff3cd;
  padding: 8px 12px;
  border-radius: 4px;
  display: inline-block;
  word-break: break-all;
}

.balance-section {
  text-align: center;
}

.balance-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
}

.balance-amount {
  font-size: 48px;
  font-weight: 700;
  color: #2c3e50;
}

.balance-unit {
  font-size: 24px;
  font-weight: 600;
  color: #7f8c8d;
}

.low-balance-warning {
  border: 2px solid #ff9800 !important;
}

.recharge-address {
  background: #fff3cd;
  padding: 16px;
  border-radius: 8px;
  border: 2px dashed #ff9800;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
</style>

