<template>
  <div class="logo-container">
    <RouterLink to="/" class="logo-link">
      <!-- 渐变发光 Logo -->
      <svg width="48" height="48" viewBox="262 150 450 362" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cubeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1E1B4B"/>
            <stop offset="50%" stop-color="#00FFFF"/>
            <stop offset="100%" stop-color="#FF4500"/>
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g stroke="url(#cubeGrad)" stroke-width="6" fill="none" filter="url(#glow)">
          <!-- 正面六边形网格 -->
          <polygon points="512,200 612,262 612,387 512,450 412,387 412,262"/>
          <polygon points="612,262 712,325 712,450 612,512 512,450 512,325"/>
          <polygon points="412,262 512,325 512,450 412,512 312,450 312,325"/>
          <!-- 背面六边形网格 -->
          <polygon points="462,150 562,212 562,337 462,400 362,337 362,212"/>
          <polygon points="562,212 662,275 662,400 562,462 462,400 462,275"/>
          <polygon points="362,212 462,275 462,400 362,462 262,400 262,275"/>
          <!-- 连接前后面的纵向棱线 -->
          <line x1="462" y1="150" x2="512" y2="200"/>
          <line x1="562" y1="212" x2="612" y2="262"/>
          <line x1="662" y1="275" x2="712" y2="325"/>
          <line x1="462" y1="400" x2="512" y2="450"/>
          <line x1="562" y1="462" x2="612" y2="512"/>
          <line x1="362" y1="462" x2="412" y2="512"/>
        </g>

        <circle cx="512" cy="300" r="24" fill="#00FFFF" filter="url(#glow)"/>
      </svg>

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
  font-size: 16px; /* 缩小字体 */
  font-weight: bold;
  margin-left: 8px; /* Logo 与文字间距 */
  font-family: Arial, sans-serif;
}
</style>

