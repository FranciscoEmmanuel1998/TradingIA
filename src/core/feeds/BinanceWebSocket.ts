// 🔥 BINANCE WEBSOCKET FEED - Datos reales de Binance
import { realDataBridge, RealMarketTick } from './RealDataBridge';

interface BinanceTickerData {
  e: string;       // Event type
  E: number;       // Event time
  s: string;       // Symbol
  c: string;       // Close price
  v: string;       // Total traded base asset volume
  q: string;       // Total traded quote asset volume
}

class BinanceWebSocketFeed {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000;

  private readonly SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOTUSDT',
    'MATICUSDT', 'LINKUSDT', 'UNIUSDT', 'AVAXUSDT', 'ATOMUSDT'
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

      // Crear stream para múltiples símbolos
      const streams = this.SYMBOLS.map(symbol => `${symbol.toLowerCase()}@ticker`).join('/');
      const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;

      console.log('🔗 Conectando a Binance WebSocket...');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Binance WebSocket conectado');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = async (event) => {
        try {
          const data: BinanceTickerData = JSON.parse(event.data);
          if (data.e === '24hrTicker') {
            await this.processBinanceTick(data);
          }
        } catch (error) {
          console.error('Error procesando mensaje de Binance:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('❌ Binance WebSocket desconectado');
        this.isConnected = false;
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ Error en Binance WebSocket:', error);
        this.isConnected = false;
      };

    } catch (error) {
      console.error('❌ Error conectando a Binance:', error);
      this.handleReconnect();
    }
  }

  private async processBinanceTick(data: BinanceTickerData): Promise<void> {
    // Convertir formato de Binance a nuestro formato estándar
    const tick: RealMarketTick = {
      exchange: 'BINANCE',
      symbol: this.formatSymbol(data.s),
      price: parseFloat(data.c),
      timestamp: data.E,
      volume: parseFloat(data.v),
      source: 'REAL_MARKET_DATA'
    };

    // Enviar al puente de datos reales
    await realDataBridge.processTick(tick);
  }

  private formatSymbol(binanceSymbol: string): string {
    // Convertir BTCUSDT -> BTC/USD
    return binanceSymbol.replace('USDT', '/USD').replace('BUSD', '/USD');
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo número de reconexiones alcanzado para Binance');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reintentando conexión a Binance (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  public getStatus(): { connected: boolean; exchange: string; latency?: number } {
    return {
      connected: this.isConnected,
      exchange: 'BINANCE'
    };
  }
}

// 🚀 Instancia global del feed de Binance
export const binanceWebSocketFeed = new BinanceWebSocketFeed();
