<script setup lang="ts">
import { ref } from 'vue';
import { Form } from 'vee-validate';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
const username = ref('');
const password = ref('');
const show1 = ref(false);

const auth = useAuthStore();
const router = useRouter();
// 表单验证规则
const passwordRules = ref([
  (v: string) => !!v || 'Password is required',
  (v: string) => (v && v.length <= 10) || 'Password must be less than 10 characters'
]);

// 用户名或邮箱都可以，只要非空
const usernameRules = ref([
  (v: string) => !!v || 'Username / Email is required'
]);

// 登录方法
async function validate() {
  try {
    // 发送登录请求到新的认证API
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    });

    const data = await res.json();
    console.log('登录返回数据:', data);

    if (data.code === 1 && data.token) {
      // ✅ 保存token到localStorage
      localStorage.setItem('token', String(data.token));
      console.log('[SAVE TOKEN]', String(data.token).slice(0, 60) + '...');
      
      // 登录成功，调用 Pinia 保存用户信息 + token
      auth.loginSuccess({
        token: data.token,
        user: {
          id: data.user.id,
          name: data.user.displayName || data.user.username,
          role: data.user.role
        }
      });

      alert('登录成功！');
    } else {
      alert(data.message || '登录失败，请检查用户名/密码');
    }

  } catch (err) {
    console.error(err);
    alert('网络或服务器错误，请确保后端服务已启动');
  }
}
</script>

<template>
  <h5 class="text-h5 text-center my-4 mb-8">
    Sign in with Username or Email
  </h5>

  <Form @submit="validate" class="mt-7 loginForm" v-slot="{ errors, isSubmitting }">
    <v-text-field
      v-model="username"
      :rules="usernameRules"
      label="Username / Email"
      class="mt-4 mb-8"
      required
      density="comfortable"
      hide-details="auto"
      variant="outlined"
      color="primary"
    ></v-text-field>

    <v-text-field
      v-model="password"
      :rules="passwordRules"
      label="Password"
      required
      density="comfortable"
      variant="outlined"
      color="primary"
      hide-details="auto"
      :append-icon="show1 ? '$eye' : '$eyeOff'"
      :type="show1 ? 'text' : 'password'"
      @click:append="show1 = !show1"
      class="pwdInput"
    ></v-text-field>

    <div class="d-sm-flex align-center mt-2 mb-7 mb-sm-0">
      <div class="ml-auto">
        <a href="javascript:void(0)" class="text-primary text-decoration-none">
          Forgot password?
        </a>
      </div>
    </div>

    <v-btn
      color="secondary"
      :loading="isSubmitting"
      block
      class="mt-2"
      variant="flat"
      type="submit"
    >
      Sign In
    </v-btn>
  </Form>

  <div class="mt-5 text-center">
    <v-divider />
    <v-btn
      variant="plain"
      to="/register"
      class="mt-2 text-capitalize"
    >
      创建新管理员
    </v-btn>
  </div>
</template>
