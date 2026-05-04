<script setup>
import { Pie } from 'vue-chartjs'
import { computed } from 'vue'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartData = computed(() => {
  const safeData = props.data || []

  return {
    labels: safeData.map(item => Math.round(item.name)),
    datasets: [
      {
        data: safeData.map(item => Math.round(item.value)),
        backgroundColor: [
          '#1d4ed8',
          '#10b981',
          '#f59e0b',
          '#ef4444'
        ],
        borderWidth: 0,
        cutout: '65%',
        spacing: 20,
        hoverOffset: 20,
        rotation: 90
      }
    ]
  }
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
}
</script>

<template>
  <Pie :data="chartData" :options="options" />
</template>