// API配置
export const API_CONFIG = {
  // 后端API基础URL
  BASE_URL: 'http://localhost:5000',
  
  // 超时时间（毫秒） - 增加到10分钟以支持大图片NFT铸造
  TIMEOUT: 600000, // 10分钟 = 600秒 = 600000毫秒
  
  // API端点
  ENDPOINTS: {
    // 系统相关
    HEALTH: '/api/health',
    TEST: '/api/test',
    SERVER_INFO: '/api/server/info',
    
    // 勋章相关
    MEDAL_RANKING: '/api/medal/ranking',
    MEDAL_USER_RANK: '/api/medal/user-rank',
    MEDAL_STATS: '/api/medal/stats',
    
    // 文件上传相关
    UPLOAD_TEST: '/api/upload/test',
    UPLOAD_COMPLETE: '/api/upload/complete',
    
    // 管理员相关（需要根据实际后端API调整）
    ADMIN_PENDING_USERS: '/api/admin/pending-users',
    ADMIN_REVIEW: '/api/admin/review',
    ADMIN_DOWNLOAD: '/api/admin/download',
  }
};

export default API_CONFIG;
