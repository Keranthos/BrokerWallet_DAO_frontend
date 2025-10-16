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

// 注意：项目已改用Session认证，不再使用Token
// 所有API请求通过 src/api/index.ts 的 apiClient 实例
// apiClient 已配置 withCredentials: true 以自动携带Session Cookie

const app = createApp(App);
app.use(router);
app.use(PerfectScrollbarPlugin);
app.use(createPinia());
app.use(VueTablerIcons);
app.use(print);
app.use(VueApexCharts);
app.use(vuetify).mount('#app');
