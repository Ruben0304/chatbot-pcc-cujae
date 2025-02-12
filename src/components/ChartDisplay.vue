<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const chartCanvas = ref(null)
let chart = null

const createChart = () => {
  const ctx = chartCanvas.value.getContext('2d')
  chart = new Chart(ctx, {
    type: props.data.type,
    data: {
      labels: props.data.labels,
      datasets: [{
        label: props.data.label,
        data: props.data.values,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}

onMounted(() => {
  createChart()
})

watch(() => props.data, () => {
  if (chart) {
    chart.destroy()
  }
  createChart()
}, { deep: true })
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 600px;
  margin: 1rem auto;
}
</style>