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
     * 登录成功（Session模式）
     * @param data 后端返回的数据 { user }
     */
    loginSuccess(data: { user: any }) {
      // 保存用户基本信息到 Pinia（Session由Cookie自动管理）
      this.user = {
        id: data.user?.id ?? 0,
        name: data.user?.name ?? '管理员',
        role: 'admin', // 只允许管理员登录
      };

      // 同步到 localStorage（仅用于前端展示，不含敏感信息）
      localStorage.setItem('user', JSON.stringify(this.user));

      // 直接跳转到管理员界面
      router.push(this.returnUrl || '/admin/medal-distribution');
    },

    /**
     * 登出
     */
    async logout() {
      try {
        // 调用后端登出API清除Session
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('登出API调用失败:', error);
      }
      
      // 清除本地状态
      this.user = null;
      localStorage.removeItem('user');
      router.push('/login');
    }
  }
});
