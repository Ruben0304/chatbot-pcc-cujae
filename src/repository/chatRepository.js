import axios from 'axios';

export class ChatRepository {
  constructor() {
    this.API_URL = "https://chatbot-pcc-backend.vercel.app";
  }

  async sendMessage(message) {
    try {
      const { data } = await axios.post(`${this.API_URL}/chat?message=${encodeURIComponent(message)}`);
      return data;
    } catch (error) {
      console.error('Error al comunicarse con el backend:', error);
      
      // Añadir información de depuración
      if (error.response) {
        console.error('Detalles del error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      throw error;
    }
  }
}