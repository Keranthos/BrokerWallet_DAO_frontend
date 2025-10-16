import axios from 'axios';
import { API_CONFIG } from '@/config/api';

// 后端API基础URL
const API_BASE_URL = API_CONFIG.BASE_URL;

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // 重要：允许携带Cookie和Session
});

// 请求拦截器（Session模式下不需要手动添加token，由浏览器自动携带Cookie）
apiClient.interceptors.request.use(
  (config) => {
    // Session会通过Cookie自动携带，无需手动添加
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理401未授权错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Session过期或未登录，清除本地存储并跳转到登录页
      console.warn('会话已过期或未登录，正在跳转到登录页...');
      localStorage.removeItem('user');
      
      // 避免重复跳转
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API接口定义
export const api = {
  // 系统健康检查
  health: () => apiClient.get('/api/health'),
  
  // 测试连接
  test: () => apiClient.get('/api/test'),
  
  // 服务器信息
  serverInfo: () => apiClient.get('/api/server/info'),
  
  // 勋章排行榜相关
  medal: {
    // 获取排行榜
    ranking: (page = 0, size = 20) => 
      apiClient.get(`/api/medal/ranking?page=${page}&size=${size}`),
    
    // 获取用户排名
    userRank: (walletAddress: string) => 
      apiClient.get(`/api/medal/user-rank/${walletAddress}`),
    
    // 获取统计信息
    stats: () => apiClient.get('/api/medal/stats'),
  },
  
  // 文件上传相关
  upload: {
    // 测试连接
    test: () => apiClient.get('/api/upload/test'),
    
    // 完整提交（证明文件 + NFT图片 + 用户信息）
    complete: (formData: FormData) => 
      apiClient.post('/api/upload/complete', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    
    // 获取用户提交历史
    getUserSubmissions: (walletAddress: string, page = 0, size = 10) =>
      apiClient.get(`/api/upload/user/submissions?walletAddress=${walletAddress}&page=${page}&size=${size}`),
    
    // 获取提交详情
    getSubmissionDetail: (id: number) =>
      apiClient.get(`/api/upload/submission/detail/${id}`),
  },
  
  // 区块链相关
  blockchain: {
    // 铸造NFT
    mintNft: (data: {
      ownerAddress: string;
      name: string;
      description: string;
      imageData: string;
      attributes: string;
      nftImageId?: number;  // 可选：NFT记录ID，用于更新数据库
    }) => apiClient.post('/api/blockchain/nft/mint', data),
    
    // 查询用户NFT
    getUserNfts: (address: string, page = 0, size = 10) =>
      apiClient.get(`/api/blockchain/nft/user/${address}?page=${page}&size=${size}`),
    
    // 查询所有NFT
    getAllNfts: (page = 0, size = 10) =>
      apiClient.get(`/api/blockchain/nft/all?page=${page}&size=${size}`),
    
    // 查询NFT详情
    getNftDetail: (tokenId: string) =>
      apiClient.get(`/api/blockchain/nft/detail/${tokenId}`),
  },
  
  // 管理员功能
  admin: {
    // 获取待审核用户列表
    getPendingUsers: (page = 1, limit = 10) => 
      apiClient.get(`/api/admin/pending-users?page=${page}&limit=${limit}`),
    
    // 获取已审核用户列表
    getApprovedUsers: (page = 1, limit = 10) => 
      apiClient.get(`/api/admin/approved-users?page=${page}&limit=${limit}`),
    
    // 获取所有用户列表（待审核+已审核）
    getAllUsers: (page = 1, limit = 10) => 
      apiClient.get(`/api/admin/all-users?page=${page}&limit=${limit}`),
    
    // 获取单个材料详情
    getMaterialDetail: (id: number) =>
      apiClient.get(`/api/admin/material-detail/${id}`),
    
    // 审核用户并分配勋章
    reviewUser: (data: {
      username: string;
      approve: number;
      firstnum: number;
      secondnum: number;
      thirdnum: number;
    }) => apiClient.post('/api/admin/review', data),
    
    // 更新代表作展示审批
    approveRepresentativeWork: (data: {
      userId: number;
      approved: boolean;
    }) => apiClient.post('/api/admin/approve-representative-work', data),
    
    // 转账代币奖励
    transferReward: (data: {
      toAddress: string;
      amount: string;
    }) => apiClient.post('/api/admin/transfer-reward', data),
    
    // 保存代币奖励到数据库
    saveTokenReward: (data: {
      proofFileId: number;
      tokenReward: number;
      txHash: string;
    }) => apiClient.post('/api/admin/save-token-reward', data),
    
    // 生成默认样式NFT图片
    generateDefaultNftImage: (data: {
      authorInfo: string;
      eventType: string;
      eventDescription: string;
      contributionLevel: string;
      timestamp: string;
    }) => apiClient.post('/api/admin/generate-default-nft-image', data),
    
    // 按花名查询用户
    searchByDisplayName: (displayName: string) =>
      apiClient.get(`/api/admin/search-by-display-name?displayName=${encodeURIComponent(displayName)}`),
    
    // 下载文件
    downloadFile: (objectKey: string) => 
      apiClient.get(`/api/admin/download/${encodeURIComponent(objectKey)}`, {
        responseType: 'blob',
      }),
    
    // 获取审核统计
    getStats: () => apiClient.get('/api/admin/stats'),
    
    // 检查后端账户状态
    checkAccountStatus: () => apiClient.get('/api/admin/account-status'),
  },
  
  // 认证相关
  auth: {
    // 管理员登录
    login: (data: { username: string; password: string }) =>
      apiClient.post('/api/auth/login', data),
    
    // 创建新管理员
    register: (data: { 
      newUsername: string; 
      newPassword: string; 
      creatorUsername: string; 
      creatorPassword: string 
    }) => apiClient.post('/api/auth/register', data),
    
    // 登出
    logout: () => apiClient.post('/api/auth/logout'),
    
    // 获取当前登录的管理员信息
    getCurrentAdmin: () => apiClient.get('/api/auth/current'),
  },
};

export default apiClient;
