import { defineStore } from 'pinia';
import { router } from '@/router';

interface User {
  id: number;
  name: string;
  role?: string; // admin / user
  token?: string; // 保存后端返回的 JWT
}

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null') as User | null,
    returnUrl: null as string | null
  }),

  actions: {
    /**
     * 登录
     * @param data 后端返回的数据 { code, token, user }
     */
    loginSuccess(data: { token: string; user: any }) {
      // 保存用户信息到 Pinia
      this.user = {
        id: data.user?.id ?? 0,
        name: data.user?.name ?? '管理员',
        role: 'admin', // 只允许管理员登录
        token: data.token
      };

      // 同步到 localStorage
      localStorage.setItem('user', JSON.stringify(this.user));

      // 直接跳转到管理员界面
      router.push(this.returnUrl || '/admin/medal-distribution');
    },

    /**
     * 登出
     */
    logout() {
      this.user = null;
      localStorage.removeItem('user');
      router.push('/login');
    }
  }
});
