<script setup>
import { computed } from 'vue';

const props = defineProps({
  data: { type: Array, required: true }, // [{ name: 'John', amount: 12500 }]
  barColor: { type: String, default: '#1e3a8a' }
});

const maxVal = computed(() => {
  if (!props.data.length) return 1;
  return Math.max(...props.data.map(d => d.amount)) * 1.1;
});
</script>

<template>
  <div class="bar-chart">
    <div class="chart-container">
      <div v-for="(item, i) in data" :key="i" class="bar-item">
        <div class="bar" :style="{ height: (item.amount / maxVal * 200) + 'px', background: barColor }"></div>
        <span class="bar-label">{{ item.name }}</span>
      </div>
    </div>
    <div class="y-axis">
      <span>{{ Math.round(maxVal) }}</span>
      <span>{{ Math.round(maxVal * 0.75) }}</span>
      <span>{{ Math.round(maxVal * 0.5) }}</span>
      <span>{{ Math.round(maxVal * 0.25) }}</span>
      <span>0</span>
    </div>
  </div>
</template>

<style scoped>
.bar-chart { display: flex; gap: 20px; padding: 20px 0; }
.chart-container { flex: 1; display: flex; align-items: flex-end; justify-content: space-around; gap: 20px; padding: 0 20px; }
.bar-item { display: flex; flex-direction: column; align-items: center; gap: 10px; flex: 1; }
.bar { width: 60px; border-radius: 8px 8px 0 0; transition: height 0.3s ease; }
.bar-label { font-size: 12px; color: #6b7280; text-align: center; }
.y-axis { display: flex; flex-direction: column; justify-content: space-between; height: 200px; font-size: 11px; color: #9ca3af; padding: 5px 0; }
@media (max-width: 1024px) { .bar { width: 40px; } }
@media (max-width: 640px) { .bar-chart { overflow-x: auto; } .chart-container { min-width: 400px; } }
</style>