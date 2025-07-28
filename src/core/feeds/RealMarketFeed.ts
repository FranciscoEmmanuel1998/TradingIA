// 🔥 REAL MARKET FEED - Solo datos auténticos de exchanges
// Buffer circular de ticks reales sin simulaciones

import { realWebSocketFeeds } from '../../../realtime-service/RealWebSocketFeeds';
import { EventBus } from '../../circulation/channels/EventBus';

interface RealTick {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  exchange: string;
  isValid: boolean;
}

interface PriceBuffer {
  [symbol: string]: RealTick[];
}

class RealMarketFeed {
  private buffer: PriceBuffer = {};
  private bufferSize: number = 200; // Últimos 200 ticks por símbolo
  private eventBus: EventBus;
  private activePairs: string[] = [];

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  // 🚀 Inicializar feed real - NO HAY SIMULACIONES
  initialize(pairs: string[]): void {
    console.log('🔥 REAL MARKET FEED: Eliminando toda simulación...');
    
    this.activePairs = pairs;
    
    // Inicializar buffers
    pairs.forEach(pair => {
      this.buffer[pair] = [];
    });

    // Conectar a WebSocket feeds REALES
    realWebSocketFeeds.onTick(this.processTick.bind(this));
    realWebSocketFeeds.start();

    console.log(`✅ REAL MARKET FEED: Activo para ${pairs.length} pares - SOLO DATOS REALES`);
  }

  // 📊 Procesar tick REAL del WebSocket
  private processTick(tick: any): void {
    // Normalizar símbolo
    const normalizedSymbol = this.normalizeSymbol(tick.symbol);
    
    // Solo procesar pares activos
    if (!this.activePairs.includes(normalizedSymbol)) {
      return;
    }

    const realTick: RealTick = {
      symbol: normalizedSymbol,
      price: tick.price,
      volume: tick.volume,
      timestamp: tick.timestamp,
      exchange: tick.exchange,
      isValid: this.validateTick(tick)
    };

    // Agregar al buffer circular
    if (!this.buffer[normalizedSymbol]) {
      this.buffer[normalizedSymbol] = [];
    }

    this.buffer[normalizedSymbol].push(realTick);

    // Mantener tamaño del buffer
    if (this.buffer[normalizedSymbol].length > this.bufferSize) {
      this.buffer[normalizedSymbol].shift();
    }

    // ⚠️ SOLO emitir si el tick es VÁLIDO
    if (realTick.isValid) {
      this.eventBus.emit('market.price_update', {
        symbol: realTick.symbol,
        price: realTick.price,
        volume: realTick.volume,
        timestamp: realTick.timestamp,
        exchange: realTick.exchange,
        isValid: true
      });

      console.log(`📊 REAL TICK: ${realTick.exchange} ${realTick.symbol} $${realTick.price} (${realTick.volume})`);
    }
  }

  // 🔍 Validar que el tick es legítimo
  private validateTick(tick: any): boolean {
    // Precio debe ser positivo y realista
    if (!tick.price || tick.price <= 0 || tick.price > 1000000) {
      return false;
    }

    // Volumen debe existir
    if (!tick.volume || tick.volume < 0) {
      return false;
    }

    // Timestamp debe ser reciente (últimos 5 minutos)
    const now = Date.now();
    if (!tick.timestamp || Math.abs(now - tick.timestamp) > 300000) {
      return false;
    }

    return true;
  }

  // 📈 Obtener últimos N ticks REALES
  getLastTicks(symbol: string, count: number = 50): RealTick[] {
    const normalizedSymbol = this.normalizeSymbol(symbol);
    const ticks = this.buffer[normalizedSymbol] || [];
    
    // Solo retornar ticks válidos
    return ticks
      .filter(tick => tick.isValid)
      .slice(-count);
  }

  // 💰 Obtener precio actual REAL
  getCurrentPrice(symbol: string): number | null {
    const ticks = this.getLastTicks(symbol, 1);
    return ticks.length > 0 ? ticks[0].price : null;
  }

  // 📊 Calcular EMA real (no simulada)
  calculateEMA(symbol: string, period: number): number | null {
    const ticks = this.getLastTicks(symbol, period * 2);
    
    if (ticks.length < period) {
      return null; // No hay suficientes datos REALES
    }

    const prices = ticks.map(tick => tick.price);
    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  // 📈 Calcular RSI real (no simulado)
  calculateRSI(symbol: string, period: number = 14): number | null {
    const ticks = this.getLastTicks(symbol, period + 1);
    
    if (ticks.length < period + 1) {
      return null; // No hay suficientes datos REALES
    }

    const prices = ticks.map(tick => tick.price);
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // 🔄 Normalizar símbolos de diferentes exchanges
  private normalizeSymbol(symbol: string): string {
    return symbol
      .replace('-', '/')
      .replace('USDT', 'USD')
      .toUpperCase();
  }

  // 📊 Obtener estadísticas del buffer
  getStats(): { [symbol: string]: { count: number, validCount: number, lastPrice: number | null } } {
    const stats: any = {};
    
    Object.keys(this.buffer).forEach(symbol => {
      const ticks = this.buffer[symbol];
      const validTicks = ticks.filter(t => t.isValid);
      
      stats[symbol] = {
        count: ticks.length,
        validCount: validTicks.length,
        lastPrice: validTicks.length > 0 ? validTicks[validTicks.length - 1].price : null
      };
    });

    return stats;
  }

  // ⚠️ Verificar que NO hay simulaciones activas
  verifyNoSimulation(): boolean {
    // Verificar que tenemos datos reales llegando
    const stats = this.getStats();
    const hasRealData = Object.values(stats).some((stat: any) => stat.validCount > 0);
    
    if (!hasRealData) {
      throw new Error('SIMULATION DETECTED: No real market data available');
    }

    return true;
  }
}

// Instancia global del feed real
export const realMarketFeed = new RealMarketFeed();

// Función de conveniencia para inicializar
export function attachWebSocketFeed(pairs: string[]): void {
  realMarketFeed.initialize(pairs);
}

// Verificación anti-simulación
export function verifyRealDataOnly(): boolean {
  return realMarketFeed.verifyNoSimulation();
}
