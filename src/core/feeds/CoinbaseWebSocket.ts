// 🔥 COINBASE WEBSOCKET FEED - Datos reales de Coinbase Pro
import { realDataBridge, RealMarketTick } from './RealDataBridge';

interface CoinbaseTickerMessage {
  type: string;
  sequence: number;
  product_id: string;
  price: string;
  open_24h: string;
  volume_24h: string;
  low_24h: string;
  high_24h: string;
  volume_30d: string;
  best_bid: string;
  best_ask: string;
  side: string;
  time: string;
  trade_id: number;
  last_size: string;
}

class CoinbaseWebSocketFeed {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000;

  private readonly SYMBOLS = [
    'BTC-USD', 'ETH-USD', 'SOL-USD', 'ADA-USD', 'DOT-USD',
    'MATIC-USD', 'LINK-USD', 'UNI-USD', 'AVAX-USD', 'ATOM-USD'
  ];

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      // Verificar si WebSocket está disponible
      if (typeof WebSocket === 'undefined') {
        console.error('❌ WebSocket no disponible en este entorno');
        return;
      }

      console.log('🔗 Conectando a Coinbase Pro WebSocket...');
      this.ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');

      this.ws.onopen = () => {
        console.log('✅ Coinbase Pro WebSocket conectado');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.subscribe();
      };

      this.ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ticker') {
            await this.processCoinbaseTick(data);
          }
        } catch (error) {
          console.error('Error procesando mensaje de Coinbase:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('❌ Coinbase Pro WebSocket desconectado');
        this.isConnected = false;
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ Error en Coinbase Pro WebSocket:', error);
        this.isConnected = false;
      };

    } catch (error) {
      console.error('❌ Error conectando a Coinbase Pro:', error);
      this.handleReconnect();
    }
  }

  private subscribe(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const subscribeMessage = {
      type: 'subscribe',
      product_ids: this.SYMBOLS,
      channels: ['ticker']
    };

    this.ws.send(JSON.stringify(subscribeMessage));
    console.log('📡 Suscrito a feeds de Coinbase Pro');
  }

  private async processCoinbaseTick(data: CoinbaseTickerMessage): Promise<void> {
    const tick: RealMarketTick = {
      exchange: 'COINBASE',
      symbol: this.formatSymbol(data.product_id),
      price: parseFloat(data.price),
      timestamp: new Date(data.time).getTime(),
      volume: parseFloat(data.volume_24h),
      source: 'REAL_MARKET_DATA'
    };

    // Enviar al puente de datos reales
    await realDataBridge.processTick(tick);
  }

  private formatSymbol(coinbaseSymbol: string): string {
    // Convertir BTC-USD -> BTC/USD
    return coinbaseSymbol.replace('-', '/');
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo número de reconexiones alcanzado para Coinbase');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reintentando conexión a Coinbase (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  public disconnect(): void {
    if (this.ws) {
      // Unsubscribe antes de desconectar
      const unsubscribeMessage = {
        type: 'unsubscribe',
        product_ids: this.SYMBOLS,
        channels: ['ticker']
      };
      this.ws.send(JSON.stringify(unsubscribeMessage));
      
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  public getStatus(): { connected: boolean; exchange: string; latency?: number } {
    return {
      connected: this.isConnected,
      exchange: 'COINBASE'
    };
  }
}

// 🚀 Instancia global del feed de Coinbase
export const coinbaseWebSocketFeed = new CoinbaseWebSocketFeed();
