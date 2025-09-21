<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api'

/** 后端返回的数据结构（尽量宽松兼容） */
interface RawRankItem {
  [k: string]: any
}
interface ApiResp {
  code: number
  data: RawRankItem[] | null
}

interface RankEntry {
  name: string
  gold: number
  silver: number
  bronze: number
  total: number
}

const ranks = ref<RankEntry[]>([])
const loading = ref(false)
const errorMsg = ref<string | null>(null)

/** 兼容不同字段命名，抽取并标准化 */
function normalizeItem(item: RawRankItem): RankEntry {
  const name = item.displayName ?? item.name ?? item.username ?? item.user ?? item.nickName ?? '未知用户'
  const gold   = Number(item.goldMedals ?? item.gold   ?? item.goldCount   ?? item.medalGold   ?? item.gold_medal   ?? 0) || 0
  const silver = Number(item.silverMedals ?? item.silver ?? item.silverCount ?? item.medalSilver ?? item.silver_medal ?? 0) || 0
  const bronze = Number(item.bronzeMedals ?? item.bronze ?? item.bronzeCount ?? item.medalBronze ?? item.bronze_medal ?? 0) || 0
  const totalFromApi = Number(item.totalMedalScore ?? item.total ?? item.count ?? 0) || 0
  const total = totalFromApi > 0 ? totalFromApi : gold + silver + bronze
  return { name, gold, silver, bronze, total }
}

/** 排序：优先金>银>铜，再按总数，最后按名字 */
const sortedRanks = computed(() => {
  return [...ranks.value].sort((a, b) => {
    if (b.gold !== a.gold) return b.gold - a.gold
    if (b.silver !== a.silver) return b.silver - a.silver
    if (b.bronze !== a.bronze) return b.bronze - a.bronze
    if (b.total !== a.total) return b.total - a.total
    return a.name.localeCompare(b.name)
  })
})

async function fetchRanking() {
  loading.value = true
  errorMsg.value = null
  try {
    const { data } = await api.medal.ranking(0, 50) // 获取前50名
    if (data.success && Array.isArray(data.data)) {
      ranks.value = data.data.map(normalizeItem)
    } else {
      ranks.value = []
      errorMsg.value = data.message || '暂无数据'
    }
  } catch (e: any) {
    console.error('获取排行榜失败:', e)
    errorMsg.value = e?.response?.data?.message || e?.message || '请求失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(fetchRanking)
</script>

<template>
  <div class="rank-bg">
    <div class="rank-card">
      <h2 class="rank-title">🏆 勋章排行榜</h2>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <button class="refresh-btn" @click="fetchRanking" :disabled="loading">
          {{ loading ? '加载中...' : '刷新' }}
        </button>
        <span v-if="errorMsg" style="color:#e84118;font-size:14px;">{{ errorMsg }}</span>
      </div>

      <table class="rank-table">
        <thead>
          <tr>
            <th>排名</th>
            <th>用户</th>
            <th><span class="medal-gold">🏅 金牌</span></th>
            <th><span class="medal-silver">🥈 银牌</span></th>
            <th><span class="medal-bronze">🥉 铜牌</span></th>
            <th>总数</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in sortedRanks"
            :key="item.name"
            class="rank-row"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ item.name }}</td>
            <td class="medal-gold">{{ item.gold }}</td>
            <td class="medal-silver">{{ item.silver }}</td>
            <td class="medal-bronze">{{ item.bronze }}</td>
            <td>{{ item.total }}</td>
          </tr>
          <tr v-if="!loading && !errorMsg && sortedRanks.length === 0">
            <td colspan="6" style="padding:20px;color:#666;">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.rank-bg {
  min-height: 100vh;
  padding: 40px;
  background: linear-gradient(135deg, #1e272e, #2f3640);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.rank-card {
  background: #f7f9fc;
  max-width: 900px;
  width: 100%;
  border-radius: 16px;
  padding: 35px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.3);
}

.rank-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
}

.rank-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.rank-table thead tr {
  background-color: #dcdde1;
}

.rank-table th,
.rank-table td {
  padding: 16px 20px;
  font-size: 16px;
}

.rank-table th {
  font-size: 18px;
  font-weight: 600;
  background-color: #34495e;
  color: white;
}

.rank-row {
  border-bottom: 1px solid #ccc;
  transition: background-color 0.2s ease;
}

.rank-row:hover {
  background-color: #f1f2f6;
}

.medal-gold {
  color: gold;
  font-weight: bold;
}

.medal-silver {
  color: silver;
  font-weight: bold;
}

.medal-bronze {
  color: peru;
  font-weight: bold;
}

/* 新增刷新按钮样式 */
.refresh-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2980b9, #21618c);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
}
.refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
