<script setup lang="ts">
import ChildComponent from './AdminLayout.vue'; // 相对路径根据实际调整
</script>

<template>
  <div class="wrapper">
    <ChildComponent />
  </div>
</template>

<style scoped>
.wrapper {
  width: 80%;       /* 宽度占视口80% */
  margin: 0 auto;    /* 水平居中 */
  min-height: 100vh; /* 可选，撑满屏幕高度 */
  display: flex;     /* 可选，配合居中内容 */
  justify-content: center;
  align-items: center;
}
</style>
