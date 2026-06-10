<script setup>
import { Line } from 'vue-chartjs'
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  LineElement, PointElement,
  CategoryScale, LinearScale
} from 'chart.js'

ChartJS.register(
  Title, Tooltip, Legend,
  LineElement, PointElement,
  CategoryScale, LinearScale
)

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  range: String
})

const chartData = computed(() => {
  return {
    labels: props.data?.labels || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: props.data?.revenue || [],
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2
      },
      {
        label: 'Transactions',
        data: props.data?.transactions || [],
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#10b981',
        pointBorderWidth: 2
      }
    ]
  }
})
const options = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true, 
        pointStyle: 'circle',
        padding: 20
      }
    }
  },

  scales: {
    x: {
      display: false
    },
    y: {
      beginAtZero: true
    }
  }
}
</script>

<template>
  <Line :data="chartData" :options="options"/>
</template>