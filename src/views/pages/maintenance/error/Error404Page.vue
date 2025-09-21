<template>
  <div class="error-page">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card class="elevation-12">
            <v-card-text class="text-center pa-8">
              <div class="mb-4">
                <h1 class="text-h1 error-code mb-4">404</h1>
                <h2 class="text-h4 mb-4">页面未找到</h2>
                <p class="text-subtitle-1 mb-6">
                  抱歉，您访问的页面不存在或已被移除。
                </p>
              </div>
              <v-btn
                color="primary"
                size="large"
                variant="elevated"
                @click="goHome"
                class="mr-4"
              >
                返回首页
              </v-btn>
              <v-btn
                color="secondary"
                size="large"
                variant="outlined"
                @click="goBack"
              >
                返回上一页
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-code {
  color: #1976d2;
  font-weight: 900;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.v-card {
  border-radius: 16px;
}
</style>
