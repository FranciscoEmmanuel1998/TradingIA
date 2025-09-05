// 🔥 KUCOIN WEBSOCKET FEED - Datos reales de KuCoin
import { realDataBridge, RealMarketTick } from './RealDataBridge';

interface KuCoinTickerData {
  type: string;
  topic: string;
  subject: string;
  data: {
    sequence: string;
    price: string;
    size: string;
    bestAsk: string;
    bestBid: string;
    bestAskSize: string;
    bestBidSize: string;
    time: number;
  };
}

interface KuCoinTokenResponse {
  code: string;
  data: {
    token: string;
    instanceServers: Array<{
      endpoint: string;
      encrypt: boolean;
      protocol: string;
      pingInterval: number;
      pingTimeout: number;
    }>;
  };
}

class KuCoinWebSocketFeed {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000;
  private token: string | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  private readonly SYMBOLS = [
    'BTC-USDT', 'ETH-USDT', 'SOL-USDT', 'ADA-USDT', 'DOT-USDT',
    'MATIC-USDT', 'LINK-USDT', 'UNI-USDT', 'AVAX-USDT', 'ATOM-USDT'
  ];

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      // Primero obtener token de autenticación
      await this.getConnectionToken();
      this.connect();
    } catch (error) {
      console.error('❌ Error inicializando KuCoin WebSocket:', error);
      this.handleReconnect();
    }
  }

  private async getConnectionToken(): Promise<void> {
    try {
      // Usar el proxy configurado en Vite para evitar CORS
      const response = await fetch('/api/kucoin/api/v1/bullet-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data: KuCoinTokenResponse = await response.json();
      
      if (data.code === '200000' && data.data.token) {
        this.token = data.data.token;
        console.log('✅ Token de KuCoin obtenido');
      } else {
        throw new Error('No se pudo obtener token de KuCoin');
      }
    } catch (error) {
      console.error('❌ Error obteniendo token de KuCoin:', error);
      throw error;
    }
  }

  private connect(): void {
    if (!this.token) {
      console.error('❌ No hay token para conectar a KuCoin');
      return;
    }

    try {
      // Verificar si WebSocket está disponible
      if (typeof WebSocket === 'undefined') {
        console.error('❌ WebSocket no disponible en este entorno');
        return;
      }

      const wsUrl = `wss://ws-api-spot.kucoin.com/?token=${this.token}&[connectId=${Date.now()}]`;
      
      console.log('🔗 Conectando a KuCoin WebSocket...');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ KuCoin WebSocket conectado');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.subscribe();
        this.startPing();
      };

      this.ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'message' && data.topic.includes('/market/ticker:')) {
            await this.processKuCoinTick(data);
          } else if (data.type === 'pong') {
            // Respuesta al ping
            console.log('🏓 Pong recibido de KuCoin');
          }
        } catch (error) {
          console.error('Error procesando mensaje de KuCoin:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('❌ KuCoin WebSocket desconectado');
        this.isConnected = false;
        this.stopPing();
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ Error en KuCoin WebSocket:', error);
        this.isConnected = false;
        this.stopPing();
      };

    } catch (error) {
      console.error('❌ Error conectando a KuCoin:', error);
      this.handleReconnect();
    }
  }

  private subscribe(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Suscribirse a ticker de todos los símbolos
    const topics = this.SYMBOLS.map(symbol => `/market/ticker:${symbol}`);
    
    const subscribeMessage = {
      id: Date.now(),
      type: 'subscribe',
      topic: topics.join(','),
      privateChannel: false,
      response: true
    };

    this.ws.send(JSON.stringify(subscribeMessage));
    console.log('📡 Suscrito a feeds de KuCoin');
  }

  private async processKuCoinTick(data: KuCoinTickerData): Promise<void> {
    // Extraer símbolo del topic: /market/ticker:BTC-USDT
    const symbol = data.topic.split(':')[1];
    
    const tick: RealMarketTick = {
      exchange: 'KUCOIN',
      symbol: this.formatSymbol(symbol),
      price: parseFloat(data.data.price),
      timestamp: data.data.time,
      volume: parseFloat(data.data.size),
      source: 'REAL_MARKET_DATA'
    };

    // Enviar al puente de datos reales
    await realDataBridge.processTick(tick);
  }

  private formatSymbol(kuCoinSymbol: string): string {
    // Convertir BTC-USDT -> BTC/USD
    return kuCoinSymbol.replace('-USDT', '/USD').replace('-BUSD', '/USD');
  }

  private startPing(): void {
    // KuCoin requiere ping cada 50 segundos
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const pingMessage = {
          id: Date.now(),
          type: 'ping'
        };
        this.ws.send(JSON.stringify(pingMessage));
      }
    }, 50000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo número de reconexiones alcanzado para KuCoin');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reintentando conexión a KuCoin (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(async () => {
      try {
        await this.getConnectionToken();
        this.connect();
      } catch (error) {
        console.error('❌ Error en reconexión de KuCoin:', error);
      }
    }, this.reconnectDelay);
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopPing();
    this.isConnected = false;
  }

  public getStatus(): { connected: boolean; exchange: string; latency?: number } {
    return {
      connected: this.isConnected,
      exchange: 'KUCOIN'
    };
  }
}

// 🚀 Instancia global del feed de KuCoin
export const kuCoinWebSocketFeed = new KuCoinWebSocketFeed();
