<script setup>
const props = defineProps({
  data: { type: Array, required: true } // [{ name: 'Food', value: 40, color: '#1e3a8a' }]
});
</script>

<template>
  <div class="pie-chart">
    <svg viewBox="0 0 200 200" class="pie-svg">
      <circle
        v-for="(cat, i) in data"
        :key="i"
        r="80" cx="100" cy="100"
        :fill="cat.color"
        :stroke-dasharray="`${cat.value * 5.02} ${502 - cat.value * 5.02}`"
        :stroke-dashoffset="`${-data.slice(0, i).reduce((acc, c) => acc + c.value * 5.02, 0)}`"
        fill="none" stroke-width="60"
      />
    </svg>
    <div class="pie-labels">
      <div v-for="cat in data" :key="cat.name" class="pie-label">
        <span class="label-dot" :style="{ background: cat.color }"></span>
        <span>{{ cat.name }} {{ cat.value }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pie-chart { display: flex; align-items: center; gap: 40px; padding: 20px 0; }
.pie-svg { width: 200px; height: 200px; transform: rotate(-90deg); }
.pie-labels { display: flex; flex-direction: column; gap: 10px; }
.pie-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; }
.label-dot { width: 12px; height: 12px; border-radius: 3px; }
@media (max-width: 1024px) { 
  .pie-chart { flex-direction: column; gap: 20px; } 
  .pie-labels { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; } 
}
</style>