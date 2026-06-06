<script setup>
import { computed } from 'vue';

const props = defineProps({
  data: { type: Array, required: true } // [{ week: 'Week 1', target: 5000, actual: 4800 }]
});

const maxVal = computed(() => {
  if (!props.data.length) return 1;
  const allVals = props.data.flatMap(d => [d.target, d.actual]);
  return Math.max(...allVals) * 1.1;
});
</script>

<template>
  <div class="bar-chart-grouped">
    <div class="chart-container">
      <div v-for="(item, i) in data" :key="i" class="bar-group">
        <div class="bar-pair">
          <div class="bar target" :style="{ height: (item.target / maxVal * 200) + 'px' }"></div>
          <div class="bar actual" :style="{ height: (item.actual / maxVal * 200) + 'px' }"></div>
        </div>
        <span class="bar-label">{{ item.week }}</span>
      </div>
    </div>
    <div class="y-axis">
      <span>{{ Math.round(maxVal) }}</span>
      <span>{{ Math.round(maxVal * 0.75) }}</span>
      <span>{{ Math.round(maxVal * 0.5) }}</span>
      <span>{{ Math.round(maxVal * 0.25) }}</span>
      <span>0</span>
    </div>
    <div class="legend">
      <span class="legend-item"><span class="dot" style="background: #e5e7eb"></span> Target</span>
      <span class="legend-item"><span class="dot" style="background: #10b981"></span> Actual</span>
    </div>
  </div>
</template>

<style scoped>
.bar-chart-grouped { display: flex; gap: 20px; padding: 20px 0; }
.chart-container { flex: 1; display: flex; align-items: flex-end; justify-content: space-around; gap: 20px; padding: 0 20px; }
.bar-group { display: flex; flex-direction: column; align-items: center; gap: 10px; flex: 1; }
.bar-pair { display: flex; gap: 8px; align-items: flex-end; height: 200px; }
.bar { width: 25px; border-radius: 4px 4px 0 0; transition: height 0.3s ease; }
.bar.target { background: #e5e7eb; }
.bar.actual { background: #10b981; }
.bar-label { font-size: 12px; color: #6b7280; text-align: center; }
.y-axis { display: flex; flex-direction: column; justify-content: space-between; height: 200px; font-size: 11px; color: #9ca3af; padding: 5px 0; }
.legend { display: flex; gap: 20px; margin-top: 15px; justify-content: center; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
@media (max-width: 1024px) { .bar { width: 20px; } }
@media (max-width: 640px) { .bar-chart-grouped { overflow-x: auto; } .chart-container { min-width: 400px; } }
</style>