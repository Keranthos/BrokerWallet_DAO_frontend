//註冊
<script setup lang="ts">
import { ref } from 'vue';
import { Form } from 'vee-validate';

const firstname = ref('');
const email = ref('');
const password = ref('');
const checkbox = ref(false);
const show1 = ref(false);
const Regform = ref();

const passwordRules = ref([
  (v: string) => !!v || 'Password is required',
  (v: string) => (v && v.length <= 10) || 'Password must be less than 10 characters'
]);

const emailRules = ref([
  (v: string) => !!v || 'E-mail is required',
  (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
]);

async function validate() {
  // 表单校验
  const isValid = await Regform.value.validate();
  if (!isValid) return;

  try {
    const res = await fetch('http://localhost:8080/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: firstname.value,
        password: password.value,
        email: email.value
      })
    });

    const data = await res.json();

    if (data.code === 1) {
      alert('注册成功，请登录');
      window.location.href = '/login1'; // 注册成功跳转登录页
    } else {
      alert('注册失败，用户名或邮箱可能已存在');
    }
  } catch (err) {
    console.error(err);
    alert('网络或服务器错误');
  }
}
</script>

<template>
  <h5 class="text-h5 text-center my-4 mb-8">Sign up with Email address</h5>
  <v-form ref="Regform" lazy-validation class="mt-7 loginForm">
    <v-text-field
      v-model="firstname"
      density="comfortable"
      hide-details="auto"
      variant="outlined"
      color="primary"
      label="Username"
      required
    ></v-text-field>

    <v-text-field
      v-model="email"
      :rules="emailRules"
      label="Email Address"
      class="mt-4 mb-4"
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

    <div class="d-sm-inline-flex align-center mt-2 mb-7 mb-sm-0 font-weight-bold">
      <v-checkbox
        v-model="checkbox"
        :rules="[(v: any) => !!v || 'You must agree to continue!']"
        label="Agree with?"
        required
        color="primary"
        class="ms-n2"
        hide-details
      ></v-checkbox>
      <a href="#" class="ml-1 text-lightText">Terms and Condition</a>
    </div>

    <v-btn color="secondary" block class="mt-2" variant="flat" size="large" @click="validate()">Sign Up</v-btn>
  </v-form>

  <div class="mt-5 text-right">
    <v-divider />
    <v-btn variant="plain" to="/login1" class="mt-2 text-capitalize mr-n2">Already have an account?</v-btn>
  </div>
</template>
