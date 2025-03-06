<template>
  <div class="fixed bottom-4 right-4 z-50">
    <!-- Botón flotante para abrir el chat -->
    <button
        v-if="!isOpen"
        @click="isOpen = true"
        class="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
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
      <header class="h-16 px-6 flex items-center justify-between bg-blue-600 text-white">
        <div class="flex items-center gap-3">
          <LucideBot class="h-6 w-6" />
          <h1 class="text-xl font-semibold">Asistente Virtual</h1>
        </div>
        <button
            @click="isOpen = false"
            class="p-2 hover:bg-blue-700 rounded-lg transition-colors"
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
                class="h-10 w-10 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center"
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
                    : 'bg-blue-600 text-white rounded-tr-none'
                ]"
              >
                <p class="text-sm whitespace-pre-wrap leading-relaxed">
                  {{ message.content }}
                </p>
              </div>

              <!-- Feedback buttons - only for agent messages -->
              <div v-if="message.role === 'agent'" class="flex items-center gap-2 mt-1 ml-1">
                <button
                    @click="toggleFeedback(index, 'positive')"
                    :class="[
                    'p-1.5 rounded-full transition-all duration-300',
                    message.feedback === 'positive' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'
                  ]"
                >
                  <LucideThumbsUp
                      class="h-4 w-4"
                      :class="{ 'animate-feedback': message.feedback === 'positive' }"
                  />
                </button>
                <button
                    @click="toggleFeedback(index, 'negative')"
                    :class="[
                    'p-1.5 rounded-full transition-all duration-300',
                    message.feedback === 'negative' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
                  ]"
                >
                  <LucideThumbsDown
                      class="h-4 w-4"
                      :class="{ 'animate-feedback': message.feedback === 'negative' }"
                  />
                </button>
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
              class="flex-1 h-12 py-2 px-4 rounded-full border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 text-sm"
          ></textarea>
          <button
              @click="sendMessage"
              :disabled="!input.trim()"
              class="p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
          >
            <LucideSend class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de feedback negativo -->
  <Transition name="modal">
    <div v-if="showFeedbackModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div
          class="bg-white rounded-xl shadow-2xl w-[90%] max-w-md mx-4 overflow-hidden animate-modal-in"
          @click.stop
      >
        <div class="p-5 bg-blue-600 text-white">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <LucideAlertCircle class="h-5 w-5" />
              Ayúdanos a mejorar
            </h3>
            <button
                @click="closeFeedbackModal"
                class="p-1 hover:bg-blue-700 rounded-full transition-colors"
            >
              <LucideX class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div class="p-6">
          <p class="text-gray-700 mb-4">¿Por qué consideras que la respuesta no fue útil?</p>

          <div class="space-y-3">
            <div
                v-for="(option, idx) in feedbackOptions"
                :key="idx"
                :class="[
                'p-3 border rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3',
                selectedFeedbackOption === idx
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              ]"
                @click="selectedFeedbackOption = idx"
            >
              <div
                  :class="[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  selectedFeedbackOption === idx ? 'border-blue-500' : 'border-gray-300'
                ]"
              >
                <div
                    v-if="selectedFeedbackOption === idx"
                    class="w-3 h-3 rounded-full bg-blue-500 animate-scale-in"
                ></div>
              </div>
              <span class="text-sm text-black">{{ option }}</span>
            </div>

            <!-- Opción "Otro" con campo de texto -->
            <div v-if="selectedFeedbackOption === feedbackOptions.length - 1" class="mt-3 animate-fade-in">
              <textarea
                  v-model="customFeedback"
                  placeholder="Por favor, cuéntanos más..."
                  class="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
                @click="closeFeedbackModal"
                class="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
                @click="submitFeedback"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                :disabled="selectedFeedbackOption === null"
                :class="{ 'opacity-50 cursor-not-allowed': selectedFeedbackOption === null }"
            >
              <LucideSend class="h-4 w-4" />
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue';
import axios from 'axios';
import {
  LucideBot,
  LucideX,
  LucideMessageCircle,
  LucideSend,
  LucideThumbsUp,
  LucideThumbsDown,
  LucideAlertCircle
} from 'lucide-vue-next';

const isOpen = ref(false);
const input = ref('');
const messagesContainer = ref(null);
const messages = reactive([
  {
    role: 'agent',
    content: '¡Hola! ¿En qué puedo ayudarte hoy?',
    timestamp: '14:08:28',
    isNew: false,
    feedback: null,
    feedbackDetails: null
  }
]);

// Estado para el modal de feedback
const showFeedbackModal = ref(false);
const currentFeedbackMessageIndex = ref(null);
const selectedFeedbackOption = ref(null);
const customFeedback = ref('');

// Opciones de feedback
const feedbackOptions = [
  'Respuesta incorrecta o imprecisa',
  'Respuesta incompleta',
  'No entendió mi pregunta',
  'Respuesta irrelevante al contexto',
  'Lenguaje demasiado técnico o complejo',
  'Respuesta demasiado básica o simple',
  'Otro'
];

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
    const { data } = await axios.post('https://chatbot-pcc-backend.vercel.app/chat', {
      message: userMessage
    });

    messages.push({
      role: 'agent',
      content: data.response,
      timestamp: data.timestamp || timestamp,
      isNew: true,
      feedback: null,
      feedbackDetails: null
    });
  } catch (error) {
    console.error('Error al comunicarse con el backend:', error);
    messages.push({
      role: 'agent',
      content: 'Lo siento, ha ocurrido un error al procesar tu mensaje.',
      timestamp,
      isNew: true,
      feedback: null,
      feedbackDetails: null
    });
  }

  // Remover la clase 'isNew' después de la animación
  setTimeout(() => {
    messages.forEach(msg => msg.isNew = false);
  }, 500);
};

// Función para manejar el feedback
const toggleFeedback = (messageIndex, type) => {
  const message = messages[messageIndex];

  // Si ya está seleccionado el mismo tipo, lo deseleccionamos
  if (message.feedback === type) {
    message.feedback = null;
    message.feedbackDetails = null;
  } else {
    // Si no, seleccionamos el nuevo tipo
    message.feedback = type;

    // Si es feedback negativo, mostramos el modal
    if (type === 'negative') {
      currentFeedbackMessageIndex.value = messageIndex;
      selectedFeedbackOption.value = null;
      customFeedback.value = '';
      showFeedbackModal.value = true;
    }
  }
};

// Cerrar el modal de feedback
const closeFeedbackModal = () => {
  showFeedbackModal.value = false;

  // Si se cierra sin enviar, quitamos el feedback negativo
  if (currentFeedbackMessageIndex.value !== null && messages[currentFeedbackMessageIndex.value].feedbackDetails === null) {
    messages[currentFeedbackMessageIndex.value].feedback = null;
  }

  currentFeedbackMessageIndex.value = null;
};

// Enviar el feedback detallado
const submitFeedback = () => {
  if (currentFeedbackMessageIndex.value === null || selectedFeedbackOption.value === null) return;

  const feedbackDetail = {
    option: feedbackOptions[selectedFeedbackOption.value],
    customText: selectedFeedbackOption.value === feedbackOptions.length - 1 ? customFeedback.value : null
  };

  // Guardar los detalles del feedback en el mensaje
  messages[currentFeedbackMessageIndex.value].feedbackDetails = feedbackDetail;

  // Aquí se podría enviar el feedback al backend
  console.log('Feedback enviado:', feedbackDetail);

  // Cerrar el modal
  showFeedbackModal.value = false;
  currentFeedbackMessageIndex.value = null;
  selectedFeedbackOption.value = null;
  customFeedback.value = '';
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

.animate-feedback {
  animation: pulse 0.4s ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.animate-modal-in {
  animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Transición para el modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Estilizar scrollbar */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #3b82f6 transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #3b82f6;
  border-radius: 3px;
}
</style>