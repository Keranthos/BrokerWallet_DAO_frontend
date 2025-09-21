<template>
  <div class="material-detail-container">
    <v-card class="pa-8" elevation="4">
      <!-- 头部导航 -->
      <div class="detail-header">
        <div class="header-nav">
          <v-btn
            @click="$router.back()"
            variant="outlined"
            color="secondary"
            size="large"
            class="back-btn"
          >
            <v-icon left class="mr-2">$arrowLeft</v-icon>
            返回列表
          </v-btn>
        </div>
        
        <h1 class="detail-title">📋 证明材料详细审核</h1>
      </div>

      <v-divider class="my-6" />

      <!-- 用户基本信息 -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card variant="outlined" class="pa-6">
            <v-card-title class="text-h5 mb-4">👤 用户信息</v-card-title>
            
            <v-row>
              <v-col cols="12" md="6">
                <div class="info-item">
                  <span class="info-label">🔗 钱包地址:</span>
                  <span class="info-value">{{ materialData.walletAddress }}</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="info-item">
                  <span class="info-label">👤 显示名称:</span>
                  <span class="info-value">{{ materialData.displayName || '未设置' }}</span>
                </div>
              </v-col>
              <v-col cols="12">
                <div class="info-item">
                  <span class="info-label">⏰ 提交时间:</span>
                  <span class="info-value">{{ formatDate(materialData.uploadTime) }}</span>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- 证明文件信息 -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card variant="outlined" class="pa-6">
            <v-card-title class="text-h5 mb-4">📄 证明文件</v-card-title>
            
            <div class="file-info">
              <div class="file-details">
                <p><span class="info-label">📎 文件名:</span> {{ materialData.originalFilename }}</p>
                <p><span class="info-label">📊 文件大小:</span> {{ formatFileSize(materialData.fileSize) }}</p>
                <p><span class="info-label">📋 文件类型:</span> {{ materialData.fileType || '未知' }}</p>
              </div>
              
              <div class="download-section">
                <v-btn
                  @click="downloadFile"
                  color="primary"
                  size="x-large"
                  :loading="downloading"
                  class="download-btn-centered"
                >
                  <v-icon left class="mr-2">$download</v-icon>
                  下载证明文件
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- 用户代表作 -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card variant="outlined" class="pa-6">
            <v-card-title class="text-h5 mb-4">🎯 用户代表作</v-card-title>
            
            <div v-if="materialData.representativeWork" class="representative-work">
              <v-textarea
                :model-value="materialData.representativeWork"
                label="用户希望展示的代表作"
                variant="outlined"
                readonly
                rows="3"
                class="mb-4"
              />
              
              <div class="approval-section">
                <v-switch
                  v-model="approveRepresentativeWork"
                  label="管理员同意在排行榜中展示此代表作"
                  color="success"
                  class="mb-4"
                />
                
                <v-btn
                  @click="updateRepresentativeWorkApproval"
                  color="info"
                  size="large"
                  :loading="updatingApproval"
                  :disabled="!hasRepresentativeWorkChanged"
                  class="save-btn"
                >
                  <v-icon left class="mr-2">$contentSave</v-icon>
                  保存代表作展示设置
                </v-btn>
              </div>
            </div>
            
            <v-alert v-else type="info" class="ma-0">
              该用户未提交代表作信息
            </v-alert>
          </v-card>
        </v-col>
      </v-row>

      <!-- NFT图片信息 -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card variant="outlined" class="pa-6">
            <v-card-title class="text-h5 mb-4">🖼️ NFT图片</v-card-title>
            
            <div v-if="materialData.nftImage" class="nft-image-section">
              <div class="nft-preview">
                <v-img
                  :src="materialData.nftImage.previewUrl"
                  max-height="300"
                  max-width="300"
                  contain
                  class="rounded clickable-image"
                  @click="showImageDialog"
                  @error="onImageError"
                  @load="onImageLoad"
                >
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="primary"></v-progress-circular>
                      <span class="ml-2">加载图片中...</span>
                    </v-row>
                  </template>
                </v-img>
                
                <!-- 点击提示 -->
                <div class="click-hint mt-2 text-center">
                  <small class="text-grey-600">点击图片可放大查看</small>
                </div>
              </div>
              <div class="nft-info">
                <p><span class="info-label">📎 图片名:</span> {{ materialData.nftImage.originalName }}</p>
                <p><span class="info-label">📊 图片大小:</span> {{ formatFileSize(materialData.nftImage.imageSize) }}</p>
                <p><span class="info-label">📋 图片类型:</span> {{ materialData.nftImage.imageType }}</p>
              </div>
            </div>
            
            <v-alert v-else type="info" class="ma-0">
              该用户未上传NFT图片，将使用自动生成勋章
            </v-alert>
            
            <!-- 图片放大查看对话框 -->
            <v-dialog v-model="imageDialog" max-width="90vw" max-height="90vh">
              <v-card class="pa-4">
                <v-card-title class="text-h6 pb-4">
                  🖼️ {{ materialData.nftImage?.originalName }}
                </v-card-title>
                
                <div class="image-container text-center">
                  <v-img
                    :src="materialData.nftImage?.previewUrl"
                    contain
                    class="enlarged-image"
                    style="max-height: 70vh; max-width: 100%;"
                  />
                </div>
                
                <v-card-actions class="justify-center pt-4">
                  <v-btn
                    @click="imageDialog = false"
                    color="primary"
                    variant="outlined"
                  >
                    关闭
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card>
        </v-col>
      </v-row>

      <!-- NFT铸造配置 -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card variant="outlined" class="pa-6">
            <v-card-title class="text-h5 mb-4">🎨 NFT铸造配置</v-card-title>
            
            <!-- 如果用户上传了照片，显示选择选项 -->
            <div v-if="materialData.nftImage">
              <v-card variant="outlined" class="pa-4 mb-4" color="info">
                <v-card-text>
                  <p class="radio-label mb-3">用户上传了照片，请选择NFT铸造方式：</p>
                  
                  <v-radio-group v-model="nftMintChoice" class="mt-4">
                    <v-radio
                      value="user-image"
                      color="primary"
                      class="mb-3"
                    >
                      <template v-slot:label>
                        <span class="radio-label">使用用户上传的照片</span>
                      </template>
                    </v-radio>
                    
                    <v-radio
                      value="default-style"
                      color="warning"
                      class="mb-3"
                    >
                      <template v-slot:label>
                        <span class="radio-label">铸造默认样式的NFT</span>
                      </template>
                    </v-radio>
                    
                    <v-radio
                      value="no-mint"
                      color="secondary"
                      class="mb-3"
                    >
                      <template v-slot:label>
                        <span class="radio-label">本次不铸造NFT</span>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </v-card-text>
              </v-card>
            </div>
            
            <!-- 如果用户没有上传照片，只显示是否铸造默认样式 -->
            <div v-else>
              <v-card variant="outlined" class="pa-4 mb-4" color="warning">
                <v-card-text>
                  <p class="radio-label mb-3">用户未上传照片，请选择：</p>
                  
                  <v-radio-group v-model="nftMintChoice" class="mt-4">
                    <v-radio
                      value="default-style"
                      color="warning"
                      class="mb-3"
                    >
                      <template v-slot:label>
                        <span class="radio-label">铸造默认样式的NFT</span>
                      </template>
                    </v-radio>
                    
                    <v-radio
                      value="no-mint"
                      color="secondary"
                      class="mb-3"
                    >
                      <template v-slot:label>
                        <span class="radio-label">本次不铸造NFT</span>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </v-card-text>
              </v-card>
            </div>

            <!-- 只有选择"铸造默认样式的NFT"时才显示NFT配置 -->
            <div v-if="nftMintChoice === 'default-style'" class="nft-config-section">
              <v-divider class="mb-4" />
              
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="nftConfig.name"
                    label="NFT名称"
                    variant="outlined"
                    density="comfortable"
                    :placeholder="materialData.displayName ? `${materialData.displayName}的贡献证明` : '贡献证明NFT'"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="autoConfig.authorInfo"
                    label="作者信息"
                    variant="outlined"
                    density="comfortable"
                    :placeholder="materialData.displayName || '作者姓名'"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="autoConfig.eventType"
                    :items="eventTypeOptions"
                    label="事件类型"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="autoConfig.contributionLevel"
                    :items="contributionLevelOptions"
                    label="贡献等级"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="nftConfig.description"
                    label="NFT描述"
                    variant="outlined"
                    rows="2"
                    density="comfortable"
                    :placeholder="generateDefaultDescription()"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="autoConfig.eventDescription"
                    label="事件描述"
                    variant="outlined"
                    rows="2"
                    density="comfortable"
                    placeholder="详细描述相关的贡献事件"
                  />
                </v-col>
              </v-row>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- 勋章分配 -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card variant="outlined" class="pa-6">
            <v-card-title class="text-h5 mb-4">🏅 勋章分配</v-card-title>
            
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="medals.gold"
                  label="🥇 金牌数量"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="medals.silver"
                  label="🥈 银牌数量"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="medals.bronze"
                  label="🥉 铜牌数量"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- 操作按钮区 -->
      <v-row>
        <v-col cols="12">
          <v-card variant="outlined" class="pa-6">
            <v-card-title class="text-h5 mb-4">⚡ 审核操作</v-card-title>
            
            <div class="action-buttons">
              <v-btn
                @click="approveAndProcess"
                color="success"
                size="x-large"
                :loading="processing"
                :disabled="!canApprove"
                class="mr-4 action-btn"
              >
                <v-icon left class="mr-2">$checkCircle</v-icon>
                审核通过并处理
              </v-btn>
              
              <v-btn
                @click="rejectMaterial"
                color="error"
                size="x-large"
                :loading="rejecting"
                variant="outlined"
                class="action-btn"
              >
                <v-icon left class="mr-2">$closeCircle</v-icon>
                审核拒绝
              </v-btn>
            </div>
            
            <v-alert
              v-if="processResult"
              :type="processResult.success ? 'success' : 'error'"
              class="mt-6"
              closable
              @click:close="processResult = null"
            >
              {{ processResult.message }}
            </v-alert>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'

const route = useRoute()
const router = useRouter()

// 响应式数据
const materialData = ref<any>({})
const loading = ref(true)
const downloading = ref(false)
const processing = ref(false)
const rejecting = ref(false)
const updatingApproval = ref(false)
const processResult = ref<{ success: boolean; message: string } | null>(null)

// 图片放大对话框
const imageDialog = ref(false)

// 勋章分配
const medals = ref({
  gold: 0,
  silver: 0,
  bronze: 0
})

// 代表作审批
const approveRepresentativeWork = ref(false)
const originalApprovalStatus = ref(false)

// NFT铸造选择
const nftMintChoice = ref('no-mint') // 'user-image' | 'default-style' | 'no-mint'

// NFT配置
const nftConfig = ref({
  name: '',
  description: ''
})

// 自动生成配置
const autoConfig = ref({
  authorInfo: '',
  eventType: '论文发表',
  eventDescription: '',
  contributionLevel: '中级贡献',
  timestamp: new Date().toISOString().slice(0, 16)
})

// 选项数据
const eventTypeOptions = [
  '论文发表', '实验完成', '代码贡献', '社区参与', '会议报告', '项目合作', '其他'
]

const contributionLevelOptions = [
  '初级贡献', '中级贡献', '高级贡献', '专家级贡献', '杰出贡献'
]

// 计算属性
const canApprove = computed(() => {
  return medals.value.gold > 0 || medals.value.silver > 0 || medals.value.bronze > 0
})

// 是否需要铸造NFT
const shouldMintNft = computed(() => {
  return nftMintChoice.value === 'user-image' || nftMintChoice.value === 'default-style'
})

// 是否使用用户图片
const useUserImage = computed(() => {
  return nftMintChoice.value === 'user-image'
})

const hasRepresentativeWorkChanged = computed(() => {
  return approveRepresentativeWork.value !== originalApprovalStatus.value
})

// 方法
const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const generateDefaultDescription = () => {
  const userName = materialData.value.displayName || '用户'
  const workType = materialData.value.representativeWork ? '的贡献' : '提交的证明材料'
  return `${userName}${workType}的NFT纪念证书`
}

// 下载文件
const downloadFile = async () => {
  downloading.value = true
  try {
    const response = await api.admin.downloadFile(materialData.value.objectKey)
    
    const blob = new Blob([response.data])
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = materialData.value.originalFilename
    link.click()
    window.URL.revokeObjectURL(link.href)
    
    processResult.value = {
      success: true,
      message: '文件下载成功'
    }
  } catch (error: any) {
    console.error('下载失败:', error)
    processResult.value = {
      success: false,
      message: '文件下载失败: ' + (error.response?.data?.message || error.message)
    }
  } finally {
    downloading.value = false
  }
}

// 更新代表作展示审批
const updateRepresentativeWorkApproval = async () => {
  updatingApproval.value = true
  try {
    const response = await api.admin.approveRepresentativeWork({
      userId: materialData.value.userId,
      approved: approveRepresentativeWork.value
    })
    
    if (response.data.success) {
      originalApprovalStatus.value = approveRepresentativeWork.value
      processResult.value = {
        success: true,
        message: response.data.message
      }
    } else {
      throw new Error(response.data.message || '更新失败')
    }
  } catch (error: any) {
    console.error('更新代表作展示审批失败:', error)
    processResult.value = {
      success: false,
      message: '更新失败: ' + (error.response?.data?.message || error.message)
    }
  } finally {
    updatingApproval.value = false
  }
}

// 审核通过并处理
const approveAndProcess = async () => {
  processing.value = true
  try {
    // 1. 分配勋章
    const reviewPayload = {
      username: materialData.value.username,
      approve: 1,
      firstnum: medals.value.gold,
      secondnum: medals.value.silver,
      thirdnum: medals.value.bronze,
    }
    
    const reviewResponse = await api.admin.reviewUser(reviewPayload)
    
    if (!reviewResponse.data.success && reviewResponse.data.code !== 1) {
      throw new Error(reviewResponse.data.message || '勋章分配失败')
    }

    // 2. 处理NFT铸造
    let nftMessage = ''
    if (shouldMintNft.value) {
      try {
        if (nftMintChoice.value === 'user-image') {
          // 使用用户上传的图片铸造NFT
          nftMessage = '，将使用用户图片铸造NFT'
          // 这里可以调用专门的用户图片NFT铸造API
        } else if (nftMintChoice.value === 'default-style') {
          // 铸造默认样式的NFT
          const formData = new FormData()
          formData.append('walletAddress', materialData.value.walletAddress)
          formData.append('displayName', nftConfig.value.name || '贡献证明NFT')
          formData.append('representativeWork', nftConfig.value.description || generateDefaultDescription())
          formData.append('showRepresentativeWork', 'true')
          
          // 添加自动生成配置
          formData.append('authorInfo', autoConfig.value.authorInfo)
          formData.append('eventType', autoConfig.value.eventType)
          formData.append('eventDescription', autoConfig.value.eventDescription)
          formData.append('contributionLevel', autoConfig.value.contributionLevel)

          // 添加空的证明文件（后端要求）
          const emptyFile = new File([''], 'nft-mint-placeholder.txt', { type: 'text/plain' })
          formData.append('proofFiles', emptyFile)

          const nftResponse = await api.upload.complete(formData)
          nftMessage = nftResponse.data.success ? '，默认样式NFT铸造成功' : '，NFT铸造失败'
        }
      } catch (nftError) {
        nftMessage = '，NFT铸造失败'
      }
    } else {
      nftMessage = '，本次未铸造NFT'
    }

    processResult.value = {
      success: true,
      message: `审核完成！为用户分配了 ${medals.value.gold} 金牌、${medals.value.silver} 银牌、${medals.value.bronze} 铜牌${nftMessage}`
    }

    // 延迟返回列表
    setTimeout(() => {
      router.push('/admin/medal-distribution')
    }, 3000)

  } catch (error: any) {
    console.error('审核处理失败:', error)
    processResult.value = {
      success: false,
      message: '审核失败: ' + (error.response?.data?.message || error.message)
    }
  } finally {
    processing.value = false
  }
}

// 拒绝材料
const rejectMaterial = async () => {
  rejecting.value = true
  try {
    const payload = {
      username: materialData.value.username,
      approve: 0,
      firstnum: 0,
      secondnum: 0,
      thirdnum: 0,
    }
    
    const response = await api.admin.reviewUser(payload)
    
    if (response.data.success || response.data.code === 1) {
      processResult.value = {
        success: true,
        message: '材料已拒绝'
      }
      
      setTimeout(() => {
        router.push('/admin/medal-distribution')
      }, 2000)
    } else {
      throw new Error(response.data.message || '拒绝操作失败')
    }
  } catch (error: any) {
    processResult.value = {
      success: false,
      message: '拒绝失败: ' + (error.response?.data?.message || error.message)
    }
  } finally {
    rejecting.value = false
  }
}

// 图片加载成功
const onImageLoad = () => {
  console.log('图片加载成功')
}

// 图片加载失败
const onImageError = (error: any) => {
  console.error('图片加载失败:', error)
  processResult.value = {
    success: false,
    message: '图片加载失败，请检查图片文件是否存在'
  }
}

// 显示图片放大对话框
const showImageDialog = () => {
  imageDialog.value = true
}

// 加载材料详情
const loadMaterialDetail = async () => {
  const materialId = route.params.id
  if (!materialId) {
    router.push('/admin/medal-distribution')
    return
  }

  try {
    const response = await api.admin.getMaterialDetail(Number(materialId))
    
    if (response.data.success) {
      materialData.value = response.data.data
      
      // 添加userId字段（从用户账户ID获取）
      materialData.value.userId = materialData.value.userAccountId || materialData.value.id
      
      // 添加objectKey用于下载
      materialData.value.objectKey = materialData.value.fileName || materialData.value.objectKey
      
      // 设置默认值
      nftConfig.value.name = materialData.value.displayName ? 
        `${materialData.value.displayName}的贡献证明` : '贡献证明NFT'
      nftConfig.value.description = generateDefaultDescription()
      autoConfig.value.authorInfo = materialData.value.displayName || ''
      
      // 根据是否有NFT图片设置默认选择
      if (materialData.value.nftImage) {
        nftMintChoice.value = 'user-image' // 默认使用用户图片
      } else {
        nftMintChoice.value = 'default-style' // 默认铸造默认样式
      }

      // 设置代表作审批状态
      approveRepresentativeWork.value = materialData.value.adminApprovedDisplay || false
      originalApprovalStatus.value = materialData.value.adminApprovedDisplay || false
      
    } else {
      throw new Error(response.data.message || '获取材料详情失败')
    }

  } catch (error: any) {
    console.error('加载材料详情失败:', error)
    processResult.value = {
      success: false,
      message: '加载材料详情失败: ' + (error.response?.data?.message || error.message)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMaterialDetail()
})
</script>

<style scoped>
.material-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.detail-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.header-nav {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.detail-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.info-label {
  font-weight: 600;
  color: #34495e;
  min-width: 120px;
}

.info-value {
  font-size: 16px;
  color: #2c3e50;
  word-break: break-all;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.file-details {
  flex: 1;
}

.file-details p {
  margin: 8px 0;
  font-size: 16px;
  color: #5a6c7d;
}

.download-section {
  display: flex;
  justify-content: center;
  width: 100%;
}

.download-btn-centered {
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 180px;
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.representative-work {
  width: 100%;
}

.approval-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.nft-image-section {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.nft-preview {
  flex: 0 0 300px;
}

.nft-info {
  flex: 1;
}

.nft-info p {
  margin: 8px 0;
  font-size: 16px;
  color: #5a6c7d;
}

.auto-config {
  background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e3f2fd;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

:deep(.v-field__field) {
  font-size: 16px !important;
}

:deep(.v-field-label) {
  font-size: 16px !important;
  font-weight: 600 !important;
}

:deep(.v-btn) {
  font-size: 16px !important;
  font-weight: 600 !important;
}

:deep(.v-card-title) {
  font-size: 20px !important;
  font-weight: 600 !important;
}

/* 确保所有按钮图标和文本正确居中 */
:deep(.v-btn__content) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
}

:deep(.v-btn .v-icon) {
  margin-right: 0 !important;
}

:deep(.v-icon) {
  font-size: 20px !important;
}

/* 单选按钮标签样式 */
.radio-label {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #2c3e50 !important;
}

/* 可点击图片样式 */
.clickable-image {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.click-hint {
  transition: opacity 0.3s ease;
}

.nft-preview:hover .click-hint {
  opacity: 0.8;
}

/* 放大图片对话框样式 */
.enlarged-image {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.image-container {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
}

@media (max-width: 768px) {
  .file-info {
    flex-direction: column;
    align-items: stretch;
  }
  
  .nft-image-section {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .v-btn {
    width: 100%;
  }
}
</style>
