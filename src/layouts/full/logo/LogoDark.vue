<template>
  <div class="logo-container">
    <RouterLink to="/" class="logo-link">
      <!-- 文字 -->
      <span class="logo-text">EmulatorDAO</span>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.logo-container {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-text {
  color: #000; /* 黑色文字 */
  font-size: 18px; /* 字体大小 */
  font-weight: bold;
  font-family: Arial, sans-serif;
}
</style>

