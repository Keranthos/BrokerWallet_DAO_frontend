# BrokerWallet 前端管理后台项目结构说明

## 📁 项目概览

brokerwallet-frontend 是一个基于 Vue 3 + Vuetify 3 的管理后台应用，为管理员提供证明材料审核、勋章分配、用户查询和系统监控等功能。

---

## 🗂️ 目录结构详解

```
brokerwallet-frontend/
├── src/                                     # 源代码目录
│   ├── main.ts                              # 应用入口文件
│   ├── App.vue                              # 根组件
│   │
│   ├── views/                               # 页面视图
│   │   └── admin/                           # 管理员模块
│   │       ├── AdminLayout.vue              # 管理员布局（侧边栏+顶栏）
│   │       └── components/                  # 管理员功能组件
│   │           ├── MedalDistribution.vue    # 材料审核页面（核心）
│   │           ├── MaterialDetail.vue       # 材料详情页面
│   │           ├── MedalRanking.vue         # 勋章排行榜页面
│   │           ├── UserLookup.vue           # 用户查询页面
│   │           └── AccountStatus.vue        # 账户状态监控页面
│   │
│   ├── router/                              # 路由配置
│   │   ├── index.ts                         # 路由主文件
│   │   ├── MainRoutes.ts                    # 主要路由（管理员）
│   │   └── PublicRoutes.ts                  # 公共路由（登录等）
│   │
│   ├── api/                                 # API接口定义
│   │   └── index.ts                         # 所有API接口
│   │
│   ├── config/                              # 配置文件
│   │   ├── api.ts                           # API配置
│   │   └── server.ts                        # 服务器配置
│   │
│   ├── stores/                              # Pinia状态管理
│   │   ├── auth.ts                          # 认证状态
│   │   ├── authUser.ts                      # 用户信息
│   │   ├── customizer.ts                    # 主题定制
│   │   └── proofStore.ts                    # 证明材料状态
│   │
│   ├── components/                          # 通用组件
│   │   └── shared/                          # 共享组件
│   │       ├── BaseBreadcrumb.vue           # 面包屑导航
│   │       ├── UiParentCard.vue             # 父级卡片
│   │       └── UiChildCard.vue              # 子级卡片
│   │
│   ├── layouts/                             # 布局组件
│   │   ├── full/                            # 完整布局（带侧边栏）
│   │   │   ├── FullLayout.vue               # 完整布局主文件
│   │   │   ├── vertical-sidebar/            # 垂直侧边栏
│   │   │   │   ├── VerticalSidebar.vue      # 侧边栏组件
│   │   │   │   ├── sidebarItem.ts           # 菜单项配置
│   │   │   │   └── NavItem/                 # 导航项组件
│   │   │   └── vertical-header/             # 顶部导航栏
│   │   │       ├── VerticalHeader.vue       # 顶栏组件
│   │   │       ├── ProfileDD.vue            # 用户下拉菜单
│   │   │       └── NotificationDD.vue       # 通知下拉菜单
│   │   └── blank/                           # 空白布局（登录页）
│   │       └── BlankLayout.vue
│   │
│   ├── plugins/                             # Vue插件
│   │   ├── vuetify.ts                       # Vuetify配置
│   │   └── mdi-icon.ts                      # Material Design Icons
│   │
│   ├── theme/                               # 主题配置
│   │   └── LightTheme.ts                    # 浅色主题
│   │
│   ├── scss/                                # 样式文件
│   │   ├── style.scss                       # 主样式文件
│   │   ├── _variables.scss                  # 变量定义
│   │   ├── _override.scss                   # 样式覆盖
│   │   ├── components/                      # 组件样式
│   │   ├── layout/                          # 布局样式
│   │   └── pages/                           # 页面样式
│   │
│   ├── assets/                              # 静态资源
│   │   └── images/                          # 图片资源
│   │       ├── logos/                       # Logo图片
│   │       └── icons/                       # 图标
│   │
│   └── types/                               # TypeScript类型定义
│       └── themeTypes/
│           └── ThemeType.ts
│
├── public/                                  # 公共资源
│   ├── favicon.svg                          # 网站图标
│   └── _redirects                           # 重定向配置
│
├── package.json                             # 项目依赖配置
├── vite.config.ts                           # Vite构建配置
├── tsconfig.json                            # TypeScript配置
└── README.md                                # 项目说明文档
```

---

## 🔑 核心文件说明

### 1. 配置文件

#### `src/config/server.ts`
**服务器配置文件**

```typescript
export const SERVER_CONFIG = {
  // 本地开发环境
  baseURL: 'http://localhost:5000',
  
  // 云服务器部署（需要修改）
  // baseURL: 'http://your-domain.com:5000',
  
  timeout: 30000,  // 请求超时时间（毫秒）
};
```

**⚠️ 部署到云服务器时需要修改 `baseURL`**

#### `vite.config.ts`
**Vite构建配置**

```typescript
export default defineConfig({
  server: {
    port: 5173,           // 开发服务器端口
    host: true,           // 允许外部访问
  },
  build: {
    outDir: 'dist',       // 构建输出目录
  },
});
```

---

### 2. 核心页面组件

#### `MedalDistribution.vue` - 材料审核页面（核心）
**位置：** `src/views/admin/components/MedalDistribution.vue`

**功能：**
- ✅ 显示所有提交批次（按时间倒序）
- ✅ 三个标签页：待审核、审核通过、全部
- ✅ 批次信息展示（用户地址、文件数量、提交时间）
- ✅ 点击批次查看详情
- ✅ 状态中文显示（前端转换）

**关键代码：**
```typescript
// 状态码转换为中文显示
const statusCode = u.auditStatusCode || 'PENDING';
let statusText = '待审核';
if (statusCode === 'APPROVED') {
  statusText = '审核通过';
} else if (statusCode === 'REJECTED') {
  statusText = '审核拒绝';
}
```

**API调用：**
```typescript
// 查询批次列表
const response = await fetch(`${SERVER_CONFIG.baseURL}/api/admin/users?status=${status}`);
```

#### `MaterialDetail.vue` - 材料详情页面
**位置：** `src/views/admin/components/MaterialDetail.vue`

**功能：**
- ✅ 显示批次内所有文件
- ✅ 文件预览（图片、PDF）
- ✅ 审核操作（通过/拒绝）
- ✅ 勋章分配（金/银/铜）
- ✅ 代币奖励设置
- ✅ 批量操作支持

**关键功能：**
```typescript
// 审核状态中文显示（前端转换）
const auditStatusChinese = computed(() => {
  const statusCode = materialData.value.auditStatusCode;
  if (statusCode === 'APPROVED') return '审核通过';
  if (statusCode === 'REJECTED') return '审核拒绝';
  if (statusCode === 'PENDING') return '待审核';
  return materialData.value.auditStatus || '待审核';
});

// 更新审核状态
async function updateAuditStatus(status: string) {
  const response = await fetch(`${SERVER_CONFIG.baseURL}/api/admin/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      batchId: currentBatchId,
      status: status,
    }),
  });
}

// 分配勋章
async function distributeMedals(medalType: string) {
  const response = await fetch(`${SERVER_CONFIG.baseURL}/api/admin/distribute-medals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      batchId: currentBatchId,
      medalType: medalType,
      tokenReward: tokenAmount,
    }),
  });
}
```

#### `AccountStatus.vue` - 账户状态监控页面
**位置：** `src/views/admin/components/AccountStatus.vue`

**功能：**
- ✅ 显示后端账户地址
- ✅ 显示账户余额（BKC）
- ✅ 显示NFT铸造权限状态
- ✅ 显示区块链连接状态
- ✅ 实时刷新功能

**API调用：**
```typescript
// 查询账户信息
const response = await fetch(`${SERVER_CONFIG.baseURL}/api/blockchain/account-info`);
const data = await response.json();

// 返回数据示例
{
  address: "0x8c056ccb92c567da3fee27c23d4f2f107f203879",
  balance: "1234.56",
  hasNftMintPermission: true,
  blockchainConnected: true
}
```

#### `MedalRanking.vue` - 勋章排行榜页面
**位置：** `src/views/admin/components/MedalRanking.vue`

**功能：**
- ✅ 显示用户勋章排行
- ✅ 按总分排序
- ✅ 显示用户昵称和代表作
- ✅ 实时更新

#### `UserLookup.vue` - 用户查询页面
**位置：** `src/views/admin/components/UserLookup.vue`

**功能：**
- ✅ 按钱包地址查询用户
- ✅ 显示用户勋章信息
- ✅ 显示用户提交历史
- ✅ 显示用户NFT

---

### 3. 路由配置

#### `MainRoutes.ts`
**管理员路由配置**

```typescript
const MainRoutes = {
  path: '/admin',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      name: 'MaterialReview',
      path: 'material-review',
      component: () => import('@/views/admin/components/MedalDistribution.vue'),
    },
    {
      name: 'MaterialDetail',
      path: 'material-detail/:batchId',
      component: () => import('@/views/admin/components/MaterialDetail.vue'),
    },
    {
      name: 'MedalRanking',
      path: 'medal-ranking',
      component: () => import('@/views/admin/components/MedalRanking.vue'),
    },
    {
      name: 'UserLookup',
      path: 'user-lookup',
      component: () => import('@/views/admin/components/UserLookup.vue'),
    },
    {
      name: 'AccountStatus',
      path: 'account-status',
      component: () => import('@/views/admin/components/AccountStatus.vue'),
    },
  ],
};
```

---

### 4. API接口定义

#### `src/api/index.ts`
**所有API接口定义**

```typescript
import { SERVER_CONFIG } from '@/config/server';

const BASE_URL = SERVER_CONFIG.baseURL;

// 管理员接口
export const adminApi = {
  // 查询批次列表
  getUsers: (status?: string) => 
    fetch(`${BASE_URL}/api/admin/users${status ? `?status=${status}` : ''}`),
  
  // 查询批次详情
  getBatchDetail: (batchId: string) => 
    fetch(`${BASE_URL}/api/admin/batch/${batchId}`),
  
  // 更新审核状态
  updateAuditStatus: (data: any) => 
    fetch(`${BASE_URL}/api/admin/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  
  // 分配勋章
  distributeMedals: (data: any) => 
    fetch(`${BASE_URL}/api/admin/distribute-medals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};

// 区块链接口
export const blockchainApi = {
  // 账户信息
  getAccountInfo: () => 
    fetch(`${BASE_URL}/api/blockchain/account-info`),
  
  // 健康检查
  healthCheck: () => 
    fetch(`${BASE_URL}/api/blockchain/health`),
};

// 勋章接口
export const medalApi = {
  // 勋章排行榜
  getRanking: () => 
    fetch(`${BASE_URL}/api/medals/ranking`),
  
  // 用户勋章
  getUserMedals: (address: string) => 
    fetch(`${BASE_URL}/api/medals/user/${address}`),
  
  // 全局统计
  getGlobalStats: () => 
    fetch(`${BASE_URL}/api/medals/global-stats`),
};
```

---

## 🎨 UI组件库

### Vuetify 3 组件

项目使用 Vuetify 3 作为UI组件库，提供Material Design风格的组件。

**常用组件：**
- `v-card` - 卡片容器
- `v-btn` - 按钮
- `v-tabs` - 标签页
- `v-table` - 表格
- `v-dialog` - 对话框
- `v-snackbar` - 提示消息
- `v-chip` - 标签
- `v-icon` - 图标

**示例：**
```vue
<template>
  <v-card>
    <v-card-title>材料审核</v-card-title>
    <v-card-text>
      <v-tabs v-model="currentTab">
        <v-tab value="pending">待审核</v-tab>
        <v-tab value="approved">审核通过</v-tab>
        <v-tab value="all">全部</v-tab>
      </v-tabs>
    </v-card-text>
  </v-card>
</template>
```

---

## 🔄 核心业务流程

### 1. 材料审核流程

```
打开材料审核页面 → MedalDistribution.vue
         ↓
    选择标签页（待审核/审核通过/全部）
         ↓
    调用 API: /api/admin/users?status={status}
         ↓
    显示批次列表（按时间倒序）
         ↓
    点击批次 → 跳转到 MaterialDetail.vue
         ↓
    显示批次内所有文件
         ↓
    管理员审核 → 点击"通过"或"拒绝"
         ↓
    调用 API: /api/admin/audit
         ↓
    更新审核状态
         ↓
    （可选）分配勋章 → 调用 API: /api/admin/distribute-medals
         ↓
    显示成功消息 → 返回列表页
```

### 2. 状态码转换流程

```
后端返回英文状态码 (PENDING/APPROVED/REJECTED)
         ↓
    前端接收数据
         ↓
    使用 computed 或函数转换为中文
         ↓
    显示中文状态（待审核/审核通过/审核拒绝）
         ↓
    用户看到中文界面
```

**为什么这样设计？**
- 后端使用英文状态码（标准化、易于维护）
- 前端负责国际化显示（灵活、易于扩展）
- 移动端显示英文，网页端显示中文

---

## 🛠️ 技术栈

### 核心框架
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 下一代前端构建工具

### UI组件库
- **Vuetify 3** - Material Design组件库
- **Material Design Icons** - 图标库

### 状态管理
- **Pinia** - Vue官方状态管理库

### 路由
- **Vue Router 4** - Vue官方路由

### 样式
- **SCSS** - CSS预处理器

---

## 🚀 启动方式

### 开发环境

```bash
# 1. 安装依赖
cd brokerwallet-frontend
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问
# 浏览器打开 http://localhost:5173
```

### 生产环境构建

```bash
# 1. 构建生产版本
npm run build

# 2. 构建产物在 dist/ 文件夹

# 3. 预览生产版本
npm run preview
```

### 部署到云服务器

```bash
# 1. 修改服务器配置
# 编辑 src/config/server.ts
# 将 baseURL 改为云服务器地址

# 2. 构建
npm run build

# 3. 将 dist/ 文件夹上传到服务器

# 4. 使用 Nginx 或其他Web服务器托管
```

**Nginx配置示例：**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/brokerwallet-frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📝 开发规范

### 组件命名
- 使用 PascalCase：`MedalDistribution.vue`
- 组件名应该清晰描述功能

### API调用
- 统一在 `src/api/index.ts` 定义
- 使用 async/await 处理异步
- 添加错误处理

### 状态管理
- 全局状态使用 Pinia
- 组件内部状态使用 ref/reactive

### 样式
- 优先使用 Vuetify 组件
- 自定义样式使用 SCSS
- 遵循 BEM 命名规范

---

## 🔒 安全注意事项

1. **API地址配置**
   - 生产环境使用HTTPS
   - 不要在代码中硬编码敏感信息

2. **跨域配置**
   - 后端需要配置CORS允许前端域名
   - 生产环境限制允许的来源

3. **认证授权**
   - 当前版本未实现登录功能
   - 建议添加JWT认证

---

## 📚 相关文档

- **项目总览：** `../PROJECT_STRUCTURE.md`
- **后端文档：** `../BrokerWallet-backend/PROJECT_STRUCTURE.md`
- **部署指南：** `../DEPLOYMENT_GUIDE.md`

---

## 🆘 常见问题

### Q1: 启动时提示端口被占用
**解决：** 修改 `vite.config.ts` 中的端口号，或关闭占用5173端口的程序。

### Q2: API请求失败
**解决：** 检查后端是否启动，检查 `src/config/server.ts` 中的地址是否正确。

### Q3: 构建后访问空白页
**解决：** 检查浏览器控制台错误，通常是路由配置问题，确保使用 history 模式。

### Q4: 样式显示异常
**解决：** 清除浏览器缓存，或使用无痕模式访问。

---

**最后更新：** 2025年10月10日

