/**
 * 服务器配置
 * 
 * USB调试模式：
 * 1. 获取电脑的局域网IP地址（例如：192.168.1.100）
 * 2. 修改 SERVER_URL 为 http://你的IP:5000
 * 3. 确保手机和电脑在同一WiFi下
 * 
 * 云服务器部署：
 * 1. 修改 SERVER_URL 为云服务器地址（例如：http://your-domain.com）
 * 2. 重新编译前端
 */

// 🔧 根据部署环境修改此URL
export const SERVER_URL = 'http://localhost:5000'

// 导出完整的API基础URL
export const API_BASE_URL = SERVER_URL

export default {
  SERVER_URL,
  API_BASE_URL
}

