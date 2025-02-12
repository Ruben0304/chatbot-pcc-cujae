<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg">
    <div class="relative">
      <textarea
          v-model="inputText"
          @keydown.enter.prevent="sendMessage"
          class="w-full p-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          rows="3"
          placeholder="Type your message..."
      ></textarea>
      <button
          @click="sendMessage"
          class="absolute right-2 bottom-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
    <div v-if="showSuggestions" class="absolute bottom-full left-0 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-t-lg shadow-lg">
      <ul>
        <li
            v-for="suggestion in filteredSuggestions"
            :key="suggestion"
            @click="selectSuggestion(suggestion)"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
        >
          {{ suggestion }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch} from 'vue'
import { marked } from 'marked'

const props = defineProps({
  kpis: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['send-message'])

const inputText = ref('')
const showSuggestions = ref(false)

const filteredSuggestions = computed(() => {
  const lastWord = inputText.value.split(' ').pop().toLowerCase()
  return props.kpis.filter(kpi => kpi.toLowerCase().startsWith(lastWord))
})

const sendMessage = () => {
  if (inputText.value.trim()) {
    const renderedMessage = marked(inputText.value)
    emit('send-message', renderedMessage)
    inputText.value = ''
  }
}

const selectSuggestion = (suggestion) => {
  const words = inputText.value.split(' ')
  words[words.length - 1] = suggestion
  inputText.value = words.join(' ') + ' '
  showSuggestions.value = false
}

const checkForSuggestions = () => {
  const lastWord = inputText.value.split(' ').pop().toLowerCase()
  showSuggestions.value = lastWord.length > 0 && filteredSuggestions.value.length > 0
}

watch(inputText, checkForSuggestions)
</script>