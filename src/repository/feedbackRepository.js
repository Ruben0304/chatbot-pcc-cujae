import axios from 'axios';

export class FeedbackRepository {
  constructor() {
    this.API_URL = "https://chatbot-pcc-backend.vercel.app";
  }

  async sendFeedback(messageId, feedbackType, feedbackDetails) {
    try {
      await axios.patch(`${this.API_URL}/messages/${messageId}/feedback`, {
        feedback_type: feedbackType,
        feedback: feedbackDetails
      });
      console.log(`Feedback ${feedbackType} enviado para el mensaje ${messageId}`);
      return true;
    } catch (error) {
      console.error('Error al enviar feedback:', error);
      if (error.response) {
        console.error('Detalles del error de feedback:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  }
}