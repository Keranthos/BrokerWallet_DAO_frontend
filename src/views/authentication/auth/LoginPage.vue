<template>
  <div class="login-container">
    <v-card class="pa-10" max-width="500" elevation="12">
      <div class="text-center mb-8">
        <h1 class="text-h3 font-weight-bold text-primary mb-2">🎯 BrokerWallet</h1>
        <p class="text-h6 text-grey-darken-1">管理员登录系统</p>
      </div>
      
      <v-form @submit.prevent="handleLogin" ref="form">
        <v-text-field
          v-model="username"
          label="👤 用户名"
          variant="outlined"
          class="mb-6"
          :rules="[rules.required]"
          density="comfortable"
          style="font-size: 18px;"
        />
        
        <v-text-field
          v-model="password"
          label="🔒 密码"
          type="password"
          variant="outlined"
          class="mb-8"
          :rules="[rules.required]"
          density="comfortable"
          style="font-size: 18px;"
        />
        
        <v-btn
          type="submit"
          color="primary"
          size="x-large"
          block
          :loading="loading"
          :disabled="!username || !password"
          style="font-size: 18px; padding: 16px 0; font-weight: 600;"
        >
          🔐 {{ loading ? '登录中...' : '管理员登录' }}
        </v-btn>
      </v-form>
      
      <v-alert
        v-if="error"
        type="error"
        class="mt-4"
        closable
        @click:close="error = ''"
      >
        {{ error }}
      </v-alert>
      
      <v-divider class="my-6"></v-divider>
      
      <div class="text-center">
        <p class="text-body-2 text-grey-darken-1 mb-3">还没有管理员账户？</p>
        <v-btn
          variant="outlined"
          color="primary"
          size="large"
          @click="goToRegister"
        >
          ➕ 创建新管理员
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const rules = {
  required: (value: string) => !!value || '此字段为必填项'
}

const handleLogin = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // 调用真实的登录API（使用fetch以便携带credentials）
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // 重要：携带和保存Cookie
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    const data = await res.json()

    if (data.code === 1 && data.success) {
      // Session模式下不需要手动保存token，Cookie会自动保存
      // 只需保存用户基本信息用于前端展示
      auth.loginSuccess({
        user: {
          id: data.user.id,
          name: data.user.displayName || data.user.username,
          role: data.user.role
        }
      })
    } else {
      error.value = data.message || '用户名或密码错误'
    }
  } catch (err: any) {
    console.error('登录失败:', err)
    error.value = '网络或服务器错误，请确保后端服务已启动'
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}
</style>