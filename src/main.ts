// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import VueApexCharts from 'vue3-apexcharts';
import VueTablerIcons from 'vue-tabler-icons';
// ❌ 已移除 fakeBackend
import print from 'vue3-print-nb';

import axios, { AxiosHeaders } from 'axios';

// 可选：从环境变量设置后端地址（Vite：.env 里配置 VITE_API_BASE=/api 或 http://localhost:8080）
axios.defaults.baseURL = import.meta.env?.VITE_API_BASE || axios.defaults.baseURL || '';

// 仅在开发环境打印调试信息
const isDev = !!import.meta.env?.DEV;

// —— 读取并清洗 token（不加 Bearer，不加引号）——
function getCleanToken(): string {
  let t = localStorage.getItem('token') ?? '';
  t = t.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }
  if (t.startsWith('Bearer ')) t = t.slice(7);
  return t;
}

// —— 请求拦截器：为每个请求注入 Authorization ——
// 这里用 AxiosHeaders，避免“不能分配给 AxiosRequestHeaders”的类型报错
axios.interceptors.request.use((config) => {
  const t = getCleanToken();
  if (t) {
    (config.headers ??= new AxiosHeaders()).set('Authorization', `Bearer ${t}`);
    if (isDev) {
      const auth = (config.headers as AxiosHeaders).get('Authorization') || '';
      console.log('[REQ AUTH]', String(auth).slice(0, 60) + '...');
    }
  } else if (isDev) {
    console.log('[REQ AUTH] (no token)');
  }
  return config;
});

// —— 响应拦截器：统一处理 401 —— 
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      console.warn('未授权或 token 失效，请重新登录');
      // 这里按需跳转登录或清理本地 token
      // localStorage.removeItem('token');
      // router.push('/login');
    }
    return Promise.reject(err);
  }
);

const app = createApp(App);
app.use(router);
app.use(PerfectScrollbarPlugin);
app.use(createPinia());
app.use(VueTablerIcons);
app.use(print);
app.use(VueApexCharts);
app.use(vuetify).mount('#app');
