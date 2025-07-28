import { io, Socket } from 'socket.io-client';
import { EventBus } from '../../circulation/channels/EventBus';

interface SocketTick {
  exchange: string;
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  side?: 'buy' | 'sell';
}

class SocketIOFeedAdapter {
  private socket: Socket | null = null;
  private eventBus = EventBus.getInstance();
  private url: string;

  constructor() {
    this.url = process.env.REALTIME_URL || 'http://localhost:3001';
  }

  start(): void {
    if (this.socket) return;

    this.socket = io(this.url, { transports: ['websocket'] });

    this.socket.on('connect', () => {
      console.log(`\uD83D\uDD17 SocketIOFeedAdapter conectado a ${this.url}`);
    });

    this.socket.on('tick', (data: SocketTick) => {
      if (this.validateTick(data)) {
        this.eventBus.emit('market.price_update', {
          exchange: data.exchange,
          symbol: data.symbol.replace('-', '/'),
          price: data.price,
          volume: data.volume,
          timestamp: data.timestamp,
          side: data.side,
          isValid: true
        });
      } else {
        console.warn('⚠️ Tick inválido recibido del servicio realtime', data);
      }
    });

    this.socket.on('disconnect', () => {
      console.warn('🔌 SocketIOFeedAdapter desconectado. Reintentando...');
    });
  }

  stop(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private validateTick(tick: any): tick is SocketTick {
    return (
      tick &&
      typeof tick.exchange === 'string' &&
      typeof tick.symbol === 'string' &&
      typeof tick.price === 'number' &&
      typeof tick.volume === 'number' &&
      typeof tick.timestamp === 'number'
    );
  }
}

export const socketIOFeedAdapter = new SocketIOFeedAdapter();
