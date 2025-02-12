<template>
  <div class="flex items-center space-x-2 mb-4">
    <div v-for="i in 3" :key="i" class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" :style="{ animationDelay: `${i * 0.2}s` }"></div>
  </div>
</template>

<script setup>
// No additional logic needed
</script>