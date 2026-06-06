<script setup>
import { Line } from 'vue-chartjs'
import { computed } from 'vue'
import {
  Chart as ChartJS,
  LineElement, PointElement,
  CategoryScale, LinearScale
} from 'chart.js'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps({
  data: Array,
  color: String
})

const chartData = computed(() => ({
  labels: props.data.map((_, i) => i),
  datasets: [
    {
      data: props.data,
      borderColor: props.color,
      backgroundColor: 'transparent',
      tension: 0.4,
      pointRadius: 0,          // ❌ hilangin titik
      borderWidth: 2           // tipis elegan
    }
  ]
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false } // ❌ tooltip off biar clean
  },
  scales: {
    x: { display: false },
    y: { display: false }
  },
  elements: {
    line: {
      capBezierPoints: true
    }
  }
}
</script>

<template>
  <div style="height: 40px;">
    <Line :data="chartData" :options="options" />
  </div>
</template>