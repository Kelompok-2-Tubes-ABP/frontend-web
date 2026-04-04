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
    range: String
})

const chartData = computed(() => {
    if(props.range ==='Monthly'){
        return {
            labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Okt','Des'],
            datasets: [
                {
                label: 'Revenue ($)',
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
                data: [4500, 5200, 4800, 6100, 7300, 6900, 5900],
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
    }

        return  {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [
            {
            label: 'Revenue ($)',
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
            data: [4500, 5200, 4800, 6100, 7300, 6900, 5900],
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
      grid: {
        display: true,
        borderDash: [5, 5]
      }
    },
    y: {
      grid: {
        borderDash: [5, 5]
      },
      beginAtZero: true
    }
  }
}
</script>

<template>
  <Line :data="chartData" :options="options"/>
</template>