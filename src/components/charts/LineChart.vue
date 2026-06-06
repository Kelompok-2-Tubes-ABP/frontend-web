<script setup>
import { computed } from 'vue';

const props = defineProps({
  labels: { type: Array, required: true }, // ['Jan', 'Feb', 'Mar']
  datasets: { type: Array, required: true } // [{ name: 'Stocks', color: '#1e3a8a', values: [120, 130...] }]
});

const maxVal = computed(() => {
  const allVals = props.datasets.flatMap(d => d.values);
  return allVals.length ? Math.max(...allVals) * 1.1 : 1;
});

const getPoints = (values) => {
  return values.map((v, i) => {
    const x = i * 100 + 50;
    const y = 200 - (v / maxVal.value * 200);
    return `${x},${y}`;
  }).join(' ');
};
</script>

<template>
  <div class="line-chart">
    <div class="chart-area">
      <svg viewBox="0 0 600 200" class="chart-svg">
        <!-- Grid Lines -->
        <line v-for="i in 5" :key="'h' + i" :x1="0" :y1="i * 40" :x2="600" :y2="i * 40" stroke="#f3f4f6" stroke-width="1"/>
        
        <!-- Draw each dataset line -->
        <polyline
          v-for="(ds, idx) in datasets"
          :key="idx"
          fill="none"
          :stroke="ds.color"
          stroke-width="2"
          :points="getPoints(ds.values)"
        />
      </svg>
      <div class="x-axis">
        <span v-for="label in labels" :key="label">{{ label }}</span>
      </div>
    </div>
    <!-- Legend -->
    <div v-if="datasets.length > 1" class="legend">
      <span v-for="ds in datasets" :key="ds.name" class="legend-item">
        <span class="dot" :style="{ background: ds.color }"></span> {{ ds.name }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.line-chart { padding: 20px 0; }
.chart-area { position: relative; }
.chart-svg { width: 100%; height: 200px; }
.x-axis { display: flex; justify-content: space-between; margin-top: 10px; padding: 0 50px; font-size: 12px; color: #9ca3af; }
.legend { display: flex; gap: 20px; margin-top: 15px; justify-content: center; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
</style>