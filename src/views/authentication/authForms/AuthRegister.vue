// 管理员注册
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 新管理员信息
const newUsername = ref('');
const newPassword = ref('');
const newPasswordConfirm = ref('');

// 创建者（已有管理员）信息
const creatorUsername = ref('');
const creatorPassword = ref('');

const show1 = ref(false);
const show2 = ref(false);
const show3 = ref(false);
const Regform = ref();

const usernameRules = ref([
  (v: string) => !!v || '用户名不能为空',
  (v: string) => (v && v.length >= 3) || '用户名至少3个字符',
  (v: string) => (v && v.length <= 20) || '用户名最多20个字符'
]);

const passwordRules = ref([
  (v: string) => !!v || '密码不能为空',
  (v: string) => (v && v.length >= 6) || '密码至少6个字符',
  (v: string) => (v && v.length <= 20) || '密码最多20个字符'
]);

const passwordConfirmRules = ref([
  (v: string) => !!v || '请确认密码',
  (v: string) => v === newPassword.value || '两次密码输入不一致'
]);

const creatorUsernameRules = ref([
  (v: string) => !!v || '请输入已有管理员的用户名'
]);

const creatorPasswordRules = ref([
  (v: string) => !!v || '请输入已有管理员的密码'
]);

const loading = ref(false);
const error = ref('');
const success = ref('');

async function validate() {
  // 清空之前的提示
  error.value = '';
  success.value = '';

  // 表单校验
  const isValid = await Regform.value.validate();
  if (!isValid) {
    error.value = '请检查表单填写是否正确';
    return;
  }

  // 检查密码确认
  if (newPassword.value !== newPasswordConfirm.value) {
    error.value = '❌ 两次密码输入不一致，请重新输入';
    return;
  }

  // 检查新用户名是否与创建者用户名相同
  if (newUsername.value === creatorUsername.value) {
    error.value = '❌ 新管理员用户名不能与创建者用户名相同';
    return;
  }

  loading.value = true;

  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newUsername: newUsername.value,
        newPassword: newPassword.value,
        creatorUsername: creatorUsername.value,
        creatorPassword: creatorPassword.value
      })
    });

    const data = await res.json();

    if (data.code === 1) {
      success.value = '✅ 管理员创建成功！请使用新账号登录';
      // 清空表单
      newUsername.value = '';
      newPassword.value = '';
      newPasswordConfirm.value = '';
      creatorUsername.value = '';
      creatorPassword.value = '';
      
      // 3秒后跳转到登录页
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      // 根据不同的错误类型显示不同的提示
      if (data.message.includes('创建者验证失败')) {
        error.value = '❌ 创建者验证失败：\n• 请检查创建者用户名是否正确\n• 请检查创建者密码是否正确\n• 确保创建者账户处于激活状态';
      } else if (data.message.includes('用户名已存在')) {
        error.value = '❌ 用户名已存在：\n• 请选择其他用户名\n• 用户名必须是唯一的';
      } else if (data.message.includes('新管理员用户名不能与创建者用户名相同')) {
        error.value = '❌ 用户名冲突：\n• 新管理员用户名不能与创建者用户名相同\n• 请选择其他用户名';
      } else if (data.message.includes('创建者用户名不能为空')) {
        error.value = '❌ 请填写创建者用户名';
      } else if (data.message.includes('创建者密码不能为空')) {
        error.value = '❌ 请填写创建者密码';
      } else if (data.message.includes('新用户名不能为空')) {
        error.value = '❌ 请填写新管理员用户名';
      } else if (data.message.includes('新密码不能为空')) {
        error.value = '❌ 请填写新管理员密码';
      } else {
        error.value = `❌ 创建失败：${data.message || '未知错误'}`;
      }
    }
  } catch (err) {
    console.error('注册失败:', err);
    error.value = '❌ 网络连接失败：\n• 请确保后端服务已启动\n• 请检查网络连接\n• 稍后重试';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <h5 class="text-h5 text-center my-4 mb-8">创建新管理员账户</h5>
  
  <v-alert type="info" variant="tonal" class="mb-6">
    <p class="mb-2">🔐 <strong>安全提示</strong></p>
    <p class="text-body-2">创建新管理员需要已有管理员的验证。请输入一个已有管理员的账号密码进行验证。</p>
  </v-alert>
  
  <v-form ref="Regform" lazy-validation class="mt-7 loginForm">
    <!-- 新管理员信息 -->
    <v-card variant="outlined" class="pa-4 mb-6">
      <v-card-title class="text-subtitle-1 pa-0 mb-4">📝 新管理员信息</v-card-title>
      
      <v-text-field
        v-model="newUsername"
        :rules="usernameRules"
        density="comfortable"
        hide-details="auto"
        variant="outlined"
        color="primary"
        label="新管理员用户名"
        required
        class="mb-4"
      ></v-text-field>

      <v-text-field
        v-model="newPassword"
        :rules="passwordRules"
        label="新管理员密码"
        required
        density="comfortable"
        variant="outlined"
        color="primary"
        hide-details="auto"
        :append-icon="show1 ? '$eye' : '$eyeOff'"
        :type="show1 ? 'text' : 'password'"
        @click:append="show1 = !show1"
        class="mb-4"
      ></v-text-field>

      <v-text-field
        v-model="newPasswordConfirm"
        :rules="passwordConfirmRules"
        label="确认密码"
        required
        density="comfortable"
        variant="outlined"
        color="primary"
        hide-details="auto"
        :append-icon="show2 ? '$eye' : '$eyeOff'"
        :type="show2 ? 'text' : 'password'"
        @click:append="show2 = !show2"
      ></v-text-field>
    </v-card>

    <!-- 创建者验证信息 -->
    <v-card variant="outlined" class="pa-4 mb-6">
      <v-card-title class="text-subtitle-1 pa-0 mb-4">🔑 已有管理员验证</v-card-title>
      
      <v-text-field
        v-model="creatorUsername"
        :rules="creatorUsernameRules"
        density="comfortable"
        hide-details="auto"
        variant="outlined"
        color="primary"
        label="已有管理员用户名"
        required
        class="mb-4"
      ></v-text-field>

      <v-text-field
        v-model="creatorPassword"
        :rules="creatorPasswordRules"
        label="已有管理员密码"
        required
        density="comfortable"
        variant="outlined"
        color="primary"
        hide-details="auto"
        :append-icon="show3 ? '$eye' : '$eyeOff'"
        :type="show3 ? 'text' : 'password'"
        @click:append="show3 = !show3"
      ></v-text-field>
    </v-card>

    <v-btn 
      color="secondary" 
      block 
      class="mt-2" 
      variant="flat" 
      size="large" 
      @click="validate()"
      :loading="loading"
      :disabled="loading"
    >
      {{ loading ? '创建中...' : '创建新管理员' }}
    </v-btn>
  </v-form>

  <!-- 成功提示 -->
  <v-alert
    v-if="success"
    type="success"
    variant="tonal"
    class="mt-4"
    closable
    @click:close="success = ''"
    icon="$checkCircle"
  >
    <div class="text-body-1" style="white-space: pre-line;">{{ success }}</div>
  </v-alert>

  <!-- 错误提示 -->
  <v-alert
    v-if="error"
    type="error"
    variant="tonal"
    class="mt-4"
    closable
    @click:close="error = ''"
    icon="$alertCircle"
  >
    <div class="text-body-1" style="white-space: pre-line;">{{ error }}</div>
  </v-alert>

  <div class="mt-5 text-right">
    <v-divider />
    <v-btn variant="plain" to="/login" class="mt-2 text-capitalize mr-n2">
      返回登录
    </v-btn>
  </div>
</template>
