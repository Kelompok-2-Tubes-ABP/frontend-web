<script setup>
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const data = {
  labels: ['Investments', 'Transfers', 'Bills', 'Shopping'],
  datasets: [
    {
      data: [35, 28, 22, 15],
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
  <Pie :data="data" :options="options" />
</template>