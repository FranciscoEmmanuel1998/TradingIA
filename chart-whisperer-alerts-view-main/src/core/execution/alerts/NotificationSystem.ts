import axios from 'axios';
import { EventBus } from '../../circulation/channels/EventBus';

export type NotificationLevel = 'info' | 'success' | 'error';

export class NotificationSystem {
  private static instance: NotificationSystem;
  private eventBus: EventBus;
  private discordWebhook: string | undefined;
  private telegramToken: string | undefined;
  private telegramChatId: string | undefined;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.discordWebhook = process.env.DISCORD_WEBHOOK_URL;
    this.telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID;

    this.subscribeToEvents();
  }

  static getInstance(): NotificationSystem {
    if (!NotificationSystem.instance) {
      NotificationSystem.instance = new NotificationSystem();
    }
    return NotificationSystem.instance;
  }

  private subscribeToEvents() {
    this.eventBus.subscribe('execution.order.completed', (data) => {
      this.notify(`✅ Orden ejecutada en ${data.exchange} - ${data.symbol} ${data.side} ${data.quantity}`, 'success');
    });

    this.eventBus.subscribe('execution.order.failed', (data) => {
      this.notify(`❌ Error ejecutando orden en ${data.exchange}: ${data.error}`, 'error');
    });
  }

  async notify(message: string, level: NotificationLevel = 'info'): Promise<void> {
    console.log(`🔔 [${level.toUpperCase()}] ${message}`);

    if (this.discordWebhook) {
      try {
        await axios.post(this.discordWebhook, { content: message });
      } catch (err) {
        console.error('Error enviando notificación a Discord:', err);
      }
    }

    if (this.telegramToken && this.telegramChatId) {
      try {
        await axios.post(`https://api.telegram.org/bot${this.telegramToken}/sendMessage`, {
          chat_id: this.telegramChatId,
          text: message
        });
      } catch (err) {
        console.error('Error enviando notificación a Telegram:', err);
      }
    }
  }
}

export const notificationSystem = NotificationSystem.getInstance();
