# BrokerWallet 管理员系统设置指南

## 项目概述

此项目已重构为**纯管理员系统**，删除了所有普通用户功能，专注于管理员操作。

## 功能模块

### 🔐 认证系统
- 管理员登录
- 测试账号：`admin` / `admin123`

### 🏅 勋章分发管理
- 查看待审核用户材料
- 下载用户提交的证明文件
- 为用户分配金、银、铜勋章
- 批量处理审核请求

### 🏆 勋章排行榜
- 查看全系统勋章排名
- 按金银铜牌数量排序
- 实时数据统计

### 🎨 NFT铸造
- 为指定用户铸造NFT
- 支持自定义图片上传
- 自动生成勋章配置

## 启动指南

### 1. 启动后端服务器

```bash
cd "c:\Users\wanweijie\Desktop\BrokerWallet-backend"
mvn spring-boot:run
```

后端服务将在 `http://localhost:5000` 启动

### 2. 启动前端服务器

```bash
cd "d:\brokerwallet-frontend"
npm install  # 如果还未安装依赖
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

### 3. 访问系统

1. 打开浏览器访问：`http://localhost:5173`
2. 使用测试账号登录：
   - 用户名：`admin`
   - 密码：`admin123`
3. 登录成功后将自动跳转到管理员界面

## API连接配置

### 后端API地址
- 基础URL：`http://localhost:5000`
- 健康检查：`GET /api/health`
- 测试连接：`GET /api/test`

### 主要API端点

#### 勋章相关
- `GET /api/medal/ranking` - 获取勋章排行榜
- `GET /api/medal/user-rank/{walletAddress}` - 获取用户排名
- `GET /api/medal/stats` - 获取统计信息

#### 文件上传
- `GET /api/upload/test` - 测试连接
- `POST /api/upload/complete` - 完整提交（证明文件+NFT图片+用户信息）

#### 管理员功能
- `GET /api/admin/pending-users` - 获取待审核用户列表
- `POST /api/admin/review` - 审核用户并分配勋章
- `GET /api/admin/download/{objectKey}` - 下载文件

## 项目结构

```
src/
├── api/                 # API接口定义
├── config/             # 配置文件
├── stores/             # Pinia状态管理
├── router/             # 路由配置
└── views/
    ├── admin/          # 管理员功能模块
    │   ├── AdminLayout.vue
    │   └── components/
    │       ├── MedalDistribution.vue
    │       ├── MedalRanking.vue
    │       └── NFTMinting.vue
    └── authentication/ # 登录功能
        └── auth/
            └── LoginPage.vue
```

## 注意事项

1. **权限控制**：所有功能都需要管理员权限
2. **数据同步**：前端数据实时从后端API获取
3. **文件处理**：支持多种格式的证明文件上传和下载
4. **错误处理**：完整的错误提示和处理机制

## 开发说明

- 使用Vue 3 + TypeScript + Vuetify
- 状态管理使用Pinia
- HTTP客户端使用Axios
- 路由使用Vue Router 4

## 故障排除

### 1. 前端无法连接后端
- 检查后端服务是否启动：`netstat -an | findstr :5000`
- 检查API配置：`src/config/api.ts`

### 2. 登录失败
- 确认使用正确的测试账号：`admin` / `admin123`
- 检查浏览器控制台错误信息

### 3. 文件上传失败
- 检查后端文件存储配置
- 确认文件大小限制（默认50MB）

## 技术支持

如有问题，请检查：
1. 浏览器开发者工具的控制台错误
2. 后端服务器日志
3. 网络连接状态
