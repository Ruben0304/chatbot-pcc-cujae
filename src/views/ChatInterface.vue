<template>
  <div class="fixed bottom-4 right-4 z-50">
    <!-- Botón flotante para abrir el chat -->
    <button
        v-if="!isOpen"
        @click="isOpen = true"
        class="flex items-center justify-center w-16 h-16 bg-[#2751E6] text-white rounded-full shadow-lg hover:bg-[#1a3bb3] transition-all duration-300 hover:scale-105"
    >
      <LucideMessageCircle class="h-8 w-8" />
    </button>

    <!-- Contenedor del chat -->
    <div
        v-show="isOpen"
        class="fixed bottom-4 right-4 w-[420px] h-[660px] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 animate-in"
        :class="isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
    >
      <!-- Chat header -->
      <header class="h-16 px-6 flex items-center justify-between bg-[#2751E6] text-white">
        <div class="flex items-center gap-3">
          <LucideBot class="h-6 w-6" />
          <h1 class="text-xl font-semibold">Asistente Virtual</h1>
        </div>
        <button
            @click="isOpen = false"
            class="p-2 hover:bg-[#1a3bb3] rounded-lg transition-colors"
        >
          <LucideX class="h-6 w-6" />
        </button>
      </header>

      <!-- Chat messages -->
      <div
          ref="messagesContainer"
          class="flex-1 h-[calc(100%-8rem)] p-6 overflow-y-auto bg-gray-50"
      >
        <div class="space-y-6">
          <div
              v-for="(message, index) in messages"
              :key="index"
              :class="['flex gap-3 max-w-[85%] transition-all duration-300',
                     message.role === 'user' ? 'ml-auto flex-row-reverse' : '',
                     message.isNew ? 'animate-message-in' : '']"
          >
            <div
                v-if="message.role === 'agent'"
                class="h-10 w-10 rounded-full bg-[#2751E6] flex-shrink-0 flex items-center justify-center"
            >
              <LucideBot class="text-white h-6 w-6" />
            </div>
            <div :class="['space-y-1', message.role === 'user' ? 'items-end' : 'items-start']">
              <div class="flex items-center gap-2" :class="message.role === 'user' ? 'flex-row-reverse' : ''">
                <span class="text-xs font-medium text-gray-600">
                  {{ message.role === 'agent' ? 'Asistente' : 'Tú' }}
                </span>
                <span class="text-xs text-gray-400">{{ message.timestamp }}</span>
              </div>
              <div
                  :class="[
                  'p-4 rounded-2xl shadow-sm max-w-[300px]',
                  message.role === 'agent'
                    ? 'bg-white text-gray-800 rounded-tl-none'
                    : 'bg-[#2751E6] text-white rounded-tr-none'
                ]"
              >
                <p class="text-sm whitespace-pre-wrap leading-relaxed">
                  {{ message.content }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <div class="flex gap-3 items-center">
          <textarea
              v-model="input"
              placeholder="Escribe tu mensaje..."
              @keydown.enter.prevent="sendMessage"
              class="flex-1 h-12 py-2 px-4 rounded-full border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-[#2751E6] focus:border-transparent text-gray-700 placeholder-gray-400 text-sm"
          ></textarea>
          <button
              @click="sendMessage"
              :disabled="!input.trim()"
              class="p-3 bg-black text-white rounded-full hover:bg-[#333] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
          >
            <LucideSend class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue';
import axios from 'axios';
import {
  LucideBot,
  LucideX,
  LucideMessageCircle,
  LucideSend
} from 'lucide-vue-next';

const isOpen = ref(false);
const input = ref('');
const messagesContainer = ref(null);
const messages = reactive([
  {
    role: 'agent',
    content: '¡Hola! ¿En qué puedo ayudarte hoy?',
    timestamp: '14:08:28',
    isNew: false
  }
]);

// Scroll al último mensaje cuando se añade uno nuevo
watch(messages, async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}, { deep: true });

const sendMessage = async () => {
  if (!input.value.trim()) return;

  const timestamp = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  messages.push({
    role: 'user',
    content: input.value,
    timestamp,
    isNew: true
  });

  const userMessage = input.value;
  input.value = '';

  try {
    const { data } = await axios.post('http://localhost:8000/chat', {
      message: userMessage
    });

    messages.push({
      role: 'agent',
      content: data.response,
      timestamp: data.timestamp || timestamp,
      isNew: true
    });
  } catch (error) {
    console.error('Error al comunicarse con el backend:', error);
    messages.push({
      role: 'agent',
      content: 'Lo siento, ha ocurrido un error al procesar tu mensaje.',
      timestamp,
      isNew: true
    });
  }

  // Remover la clase 'isNew' después de la animación
  setTimeout(() => {
    messages.forEach(msg => msg.isNew = false);
  }, 500);
};
</script>

<style scoped>
.animate-in {
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-message-in {
  animation: messageIn 0.5s ease-out;
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Estilizar scrollbar */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #2751E6 transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #2751E6;
  border-radius: 3px;
}
</style>