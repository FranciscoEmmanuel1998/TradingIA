// 📡 REAL WEBSOCKET FEEDS - Datos en tiempo real sin simulaciones
// Conexiones WebSocket auténticas a exchanges reales

import WebSocket from 'ws';

interface RealTickData {
  exchange: string;
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  side?: 'buy' | 'sell';
}

export class RealWebSocketFeeds {
  private connections: Map<string, WebSocket> = new Map();
  private tickCallbacks: ((tick: RealTickData) => void)[] = [];
  private isActive: boolean = false;

  start(): void {
    console.log('📡 Iniciando feeds WebSocket REALES...\n');
    this.isActive = true;

    // Binance WebSocket (datos públicos, sin autenticación requerida)
    this.connectBinance();
    
    // KuCoin WebSocket (datos públicos)
    this.connectKuCoin();
    
    // Coinbase WebSocket (datos públicos)
    this.connectCoinbase();
  }

  stop(): void {
    this.isActive = false;
    this.connections.forEach((ws, exchange) => {
      console.log(`🔌 Cerrando conexión WebSocket para ${exchange}`);
      ws.close();
    });
    this.connections.clear();
  }

  onTick(callback: (tick: RealTickData) => void): void {
    this.tickCallbacks.push(callback);
  }

  private emitTick(tick: RealTickData): void {
    this.tickCallbacks.forEach(callback => callback(tick));
  }

  // 🟡 Binance WebSocket - El más confiable para datos públicos
  private connectBinance(): void {
    const wsUrl = 'wss://stream.binance.com:9443/ws/btcusdt@trade';
    
    console.log('🟡 Conectando a Binance WebSocket...');
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
      console.log('✅ Binance WebSocket conectado exitosamente');
      this.connections.set('BINANCE', ws);
    });

    ws.on('message', (data: Buffer) => {
      try {
        const trade = JSON.parse(data.toString());
        
        const tick: RealTickData = {
          exchange: 'BINANCE',
          symbol: 'BTC/USDT',
          price: parseFloat(trade.p),
          volume: parseFloat(trade.q),
          timestamp: trade.T,
          side: trade.m ? 'sell' : 'buy' // m = market maker (seller)
        };

        console.log(`📊 BINANCE: ${tick.symbol} - $${tick.price} (${tick.volume} BTC) [${tick.side?.toUpperCase()}]`);
        this.emitTick(tick);
        
      } catch (error) {
        console.error('❌ Error procesando mensaje de Binance:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('❌ Error en Binance WebSocket:', error);
    });

    ws.on('close', () => {
      console.log('🔌 Binance WebSocket desconectado');
      if (this.isActive) {
        setTimeout(() => this.connectBinance(), 5000);
      }
    });
  }

  // 🔵 Coinbase WebSocket - Datos públicos
  private connectCoinbase(): void {
    const wsUrl = 'wss://ws-feed.exchange.coinbase.com';
    
    console.log('🔵 Conectando a Coinbase WebSocket...');
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
      console.log('✅ Coinbase WebSocket conectado exitosamente');
      
      // Suscribirse a ticker de BTC-USD
      const subscribeMessage = {
        type: 'subscribe',
        product_ids: ['BTC-USD', 'ETH-USD'],
        channels: ['ticker']
      };
      
      ws.send(JSON.stringify(subscribeMessage));
      this.connections.set('COINBASE', ws);
    });

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'ticker' && message.product_id) {
          const tick: RealTickData = {
            exchange: 'COINBASE',
            symbol: message.product_id.replace('-', '/'),
            price: parseFloat(message.price),
            volume: parseFloat(message.last_size || '0'),
            timestamp: new Date(message.time).getTime(),
            side: message.side
          };

          console.log(`📊 COINBASE: ${tick.symbol} - $${tick.price} (${tick.volume})`);
          this.emitTick(tick);
        }
        
      } catch (error) {
        console.error('❌ Error procesando mensaje de Coinbase:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('❌ Error en Coinbase WebSocket:', error);
    });

    ws.on('close', () => {
      console.log('🔌 Coinbase WebSocket desconectado');
      if (this.isActive) {
        setTimeout(() => this.connectCoinbase(), 5000);
      }
    });
  }

  // 🟡 KuCoin WebSocket - Requiere token público
  private async connectKuCoin(): Promise<void> {
    try {
      console.log('🟡 Obteniendo token público de KuCoin...');
      
      // Obtener token público para WebSocket
      const response = await fetch('https://api.kucoin.com/api/v1/bullet-public', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.code !== '200000') {
        throw new Error(`KuCoin token error: ${data.msg}`);
      }

      const token = data.data.token;
      const wsUrl = `${data.data.instanceServers[0].endpoint}?token=${token}`;
      
      console.log('🟡 Conectando a KuCoin WebSocket...');
      const ws = new WebSocket(wsUrl);
      
      ws.on('open', () => {
        console.log('✅ KuCoin WebSocket conectado exitosamente');
        
        // Suscribirse a ticker de BTC-USDT
        const subscribeMessage = {
          id: Date.now(),
          type: 'subscribe',
          topic: '/market/ticker:BTC-USDT',
          response: true
        };
        
        ws.send(JSON.stringify(subscribeMessage));
        this.connections.set('KUCOIN', ws);
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'message' && message.topic === '/market/ticker:BTC-USDT') {
            const tickerData = message.data;
            
            const tick: RealTickData = {
              exchange: 'KUCOIN',
              symbol: 'BTC/USDT',
              price: parseFloat(tickerData.price),
              volume: parseFloat(tickerData.size || '0'),
              timestamp: parseInt(tickerData.time),
            };

            console.log(`📊 KUCOIN: ${tick.symbol} - $${tick.price} (${tick.volume})`);
            this.emitTick(tick);
          }
          
        } catch (error) {
          console.error('❌ Error procesando mensaje de KuCoin:', error);
        }
      });

      ws.on('error', (error) => {
        console.error('❌ Error en KuCoin WebSocket:', error);
      });

      ws.on('close', () => {
        console.log('🔌 KuCoin WebSocket desconectado');
        if (this.isActive) {
          setTimeout(() => this.connectKuCoin(), 5000);
        }
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo token de KuCoin:', error);
    }
  }

  // 📊 Obtener estadísticas de conexión
  getConnectionStats(): { [exchange: string]: string } {
    const stats: { [exchange: string]: string } = {};
    
    this.connections.forEach((ws, exchange) => {
      stats[exchange] = ws.readyState === WebSocket.OPEN ? 'CONNECTED' : 'DISCONNECTED';
    });
    
    return stats;
  }

  // 📈 Obtener últimos ticks (para debugging)
  private lastTicks: RealTickData[] = [];
  
  constructor() {
    this.onTick((tick) => {
      this.lastTicks.push(tick);
      if (this.lastTicks.length > 100) {
        this.lastTicks.shift(); // Mantener solo los últimos 100
      }
    });
  }

  getLastTicks(count: number = 10): RealTickData[] {
    return this.lastTicks.slice(-count);
  }
}

// Instancia global
export const realWebSocketFeeds = new RealWebSocketFeeds();

// Auto-start solo en Node.js
if (
  typeof process !== 'undefined' &&
  process.versions?.node
) {
  let processArgv1: string | undefined = undefined;
  if (
    Array.isArray(process.argv) &&
    process.argv.length > 1
  ) {
    processArgv1 = process.argv[1];
  }

  if (typeof require !== 'undefined' && require.main === module) {
    console.log('🚀 Iniciando feeds WebSocket en modo standalone...\n');
    realWebSocketFeeds.onTick((tick) => {
      console.log(`🎯 TICK REAL: ${tick.exchange} | ${tick.symbol} | $${tick.price} | ${new Date(tick.timestamp).toLocaleTimeString()}`);
    });
    realWebSocketFeeds.start();
    // Mostrar stats cada 30 segundos
    setInterval(() => {
      const stats = realWebSocketFeeds.getConnectionStats();
      console.log('\n📊 ESTADO CONEXIONES:', stats);
      const lastTicks = realWebSocketFeeds.getLastTicks(5);
      console.log('📈 ÚLTIMOS 5 TICKS:');
      lastTicks.forEach(tick => {
        console.log(`   ${tick.exchange}: ${tick.symbol} - $${tick.price}`);
      });
      console.log('');
    }, 30000);
  }
}
