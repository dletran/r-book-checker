import axios from 'axios';

export class Notifier {
  private readonly botToken: string;
  private readonly chatId: string;
  private readonly bookFormUrl: string;
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
    this.bookFormUrl = process.env.BOOK_FORM_URL || '';

    if (!this.botToken || !this.chatId) {
      console.warn('Telegram credentials not found in environment variables');
    }
  }

  async sendNotification(dates: Date[]): Promise<void> {
    if (!dates.length) return;

    const formattedDates = dates
      .map(date => date.toISOString().split('T')[0])
      .join('\n');

    const message = `🎫 ¡Nuevas fechas disponibles!\n\n📅 Fechas:\n${formattedDates}\n\n🔗 Reserva tu plaza en: ${this.bookFormUrl}`;

    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML'
        }
      );

      if (response.data.ok) {
        console.log('Telegram notification sent successfully');
      } else {
        console.error('Failed to send Telegram notification:', response.data);
      }
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  }
} 