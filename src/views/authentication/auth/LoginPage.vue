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
          label="用户名"
          variant="outlined"
          class="mb-6"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-account"
          density="comfortable"
          style="font-size: 18px;"
        />
        
        <v-text-field
          v-model="password"
          label="密码"
          type="password"
          variant="outlined"
          class="mb-8"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-lock"
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
      
      <div class="text-center mt-8">
        <v-chip color="info" variant="outlined" size="large">
          💡 测试账号：admin / admin123
        </v-chip>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const form = ref()
const username = ref('admin')
const password = ref('admin123')
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
    // 模拟登录API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (username.value === 'admin' && password.value === 'admin123') {
      // 模拟成功登录
      auth.loginSuccess({
        token: 'mock-admin-token-' + Date.now(),
        user: {
          id: 1,
          name: '管理员',
          role: 'admin'
        }
      })
    } else {
      error.value = '用户名或密码错误'
    }
  } catch (err: any) {
    error.value = err.message || '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
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