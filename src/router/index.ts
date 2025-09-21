import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { useAuthStore } from '@/stores/auth';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/pages/maintenance/error/Error404Page.vue')
    },
    MainRoutes,
    PublicRoutes
  ]
});

interface User {
  // Define the properties and their types for the user data here
  // For example:
  id: number;
  name: string;
}

// Assuming you have a type/interface for your authentication store
interface AuthStore {
  user: User | null;
  returnUrl: string | null;
  login(username: string, password: string): Promise<void>;
  logout(): void;
}

router.beforeEach(async (to, from, next) => {
  const auth: AuthStore = useAuthStore();
  
  // 公开页面：登录、注册和错误页面
  const publicPages = ['/login', '/register', '/404'];
  const isPublicPage = publicPages.includes(to.path);
  
  // 如果用户未登录且访问需要认证的页面
  if (!auth.user && !isPublicPage) {
    auth.returnUrl = to.fullPath;
    next('/login');
    return;
  }
  
  // 如果用户已登录且访问登录页面，重定向到管理员界面
  if (auth.user && to.path === '/login') {
    next('/admin/medal-distribution');
    return;
  }
  
  // 如果访问根路径，重定向到管理员界面
  if (to.path === '/') {
    if (auth.user) {
      next('/admin/medal-distribution');
    } else {
      next('/login');
    }
    return;
  }
  
  next();
});