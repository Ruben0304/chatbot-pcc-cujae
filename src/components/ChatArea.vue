<template>
  <div class="chat-area mb-4 overflow-y-auto h-[calc(100vh-200px)]">
    <div v-for="(message, index) in messages" :key="index" class="message mb-4" :class="message.type">
      <div :class="`p-3 rounded-lg ${message.type === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`">
        {{ message.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, watch } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  messages: {
    type: Array,
    required: true
  }
})

watch(() => props.messages, (newMessages, oldMessages) => {
  if (newMessages.length > oldMessages.length) {
    gsap.from('.message:last-child', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out'
    })
  }
}, { deep: true })
</script>

<style scoped>
.chat-area {
  display: flex;
  flex-direction: column;
}

.message {
  max-width: 80%;
  margin-bottom: 1rem;
}

.user {
  align-self: flex-end;
}

.bot {
  align-self: flex-start;
}
</style>