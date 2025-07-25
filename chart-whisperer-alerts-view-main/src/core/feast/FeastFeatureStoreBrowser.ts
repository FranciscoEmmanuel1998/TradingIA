/**
 * 🗄️ Feast Feature Store - Browser Compatible Version
 * Simulación de feature store sin Redis para entorno browser
 */

export interface MarketTick {
  exchange: string;
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  side?: string;
}

export interface FeatureVector {
  symbol: string;
  exchange: string;
  price: number;
  volume: number;
  price_change_1m: number;
  price_change_5m: number;
  price_change_15m: number;
  volume_ma_5m: number;
  volatility_1m: number;
  rsi_14: number;
  timestamp: number;
}

export class FeastFeatureStore {
  private historicalTicks: Map<string, MarketTick[]> = new Map();
  private onlineFeatures: Map<string, FeatureVector> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log('🗄️ Inicializando Feast Feature Store (Browser Mode)...');
      this.isInitialized = true;
      console.log('✅ Feast Feature Store inicializado en modo browser');
    } catch (error) {
      console.warn('⚠️ Feast Feature Store inicializado en modo fallback:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Procesar tick de mercado para feature engineering
   */
  async processMarketTick(tick: MarketTick): Promise<FeatureVector> {
    try {
      const key = `${tick.exchange}:${tick.symbol}`;
      
      // Obtener histórico o inicializar
      if (!this.historicalTicks.has(key)) {
        this.historicalTicks.set(key, []);
      }
      
      const history = this.historicalTicks.get(key)!;
      history.push(tick);
      
      // Mantener solo últimos 100 ticks para cálculos
      if (history.length > 100) {
        history.shift();
      }

      // Calcular features derivados
      const features = this.computeDerivedFeatures(tick, history);
      
      // Almacenar en online store
      this.onlineFeatures.set(key, features);
      
      return features;
    } catch (error) {
      console.error('❌ Error procesando tick en Feast:', error);
      
      // Fallback: retornar features básicos
      return {
        symbol: tick.symbol,
        exchange: tick.exchange,
        price: tick.price,
        volume: tick.volume,
        price_change_1m: 0,
        price_change_5m: 0,
        price_change_15m: 0,
        volume_ma_5m: tick.volume,
        volatility_1m: 0,
        rsi_14: 50,
        timestamp: tick.timestamp
      };
    }
  }

  /**
   * Calcular features derivados a partir del histórico
   */
  private computeDerivedFeatures(currentTick: MarketTick, history: MarketTick[]): FeatureVector {
    const now = currentTick.timestamp;
    const currentPrice = currentTick.price;
    
    // Filtrar por ventanas de tiempo
    const ticks1m = history.filter(t => now - t.timestamp <= 60000);
    const ticks5m = history.filter(t => now - t.timestamp <= 300000);
    const ticks15m = history.filter(t => now - t.timestamp <= 900000);

    // Price changes
    const price_1m_ago = ticks1m.length > 0 ? ticks1m[0].price : currentPrice;
    const price_5m_ago = ticks5m.length > 0 ? ticks5m[0].price : currentPrice;
    const price_15m_ago = ticks15m.length > 0 ? ticks15m[0].price : currentPrice;

    const price_change_1m = (currentPrice - price_1m_ago) / price_1m_ago;
    const price_change_5m = (currentPrice - price_5m_ago) / price_5m_ago;
    const price_change_15m = (currentPrice - price_15m_ago) / price_15m_ago;

    // Volume moving average
    const volumes5m = ticks5m.map(t => t.volume);
    const volume_ma_5m = volumes5m.length > 0 
      ? volumes5m.reduce((a, b) => a + b, 0) / volumes5m.length 
      : currentTick.volume;

    // Volatility (standard deviation of prices in 1m)
    const prices1m = ticks1m.map(t => t.price);
    let volatility_1m = 0;
    if (prices1m.length > 1) {
      const mean = prices1m.reduce((a, b) => a + b, 0) / prices1m.length;
      const variance = prices1m.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices1m.length;
      volatility_1m = Math.sqrt(variance) / mean;
    }

    // RSI simplificado
    let rsi_14 = 50; // Default neutral
    if (history.length >= 14) {
      const recent14 = history.slice(-14);
      let gains = 0, losses = 0;
      
      for (let i = 1; i < recent14.length; i++) {
        const change = recent14[i].price - recent14[i-1].price;
        if (change > 0) gains += change;
        else losses += Math.abs(change);
      }
      
      if (losses > 0) {
        const rs = gains / losses;
        rsi_14 = 100 - (100 / (1 + rs));
      }
    }

    return {
      symbol: currentTick.symbol,
      exchange: currentTick.exchange,
      price: currentPrice,
      volume: currentTick.volume,
      price_change_1m,
      price_change_5m,
      price_change_15m,
      volume_ma_5m,
      volatility_1m,
      rsi_14,
      timestamp: now
    };
  }

  /**
   * Obtener features online para predicción
   */
  async getOnlineFeatures(exchange: string, symbol: string): Promise<FeatureVector | null> {
    const key = `${exchange}:${symbol}`;
    return this.onlineFeatures.get(key) || null;
  }

  /**
   * Almacenar tick histórico (para compatibilidad)
   */
  async storeHistoricalTick(tick: MarketTick): Promise<void> {
    // En browser mode, esto ya se hace en processMarketTick
    return Promise.resolve();
  }

  /**
   * Obtener estadísticas del feature store
   */
  getStats(): Record<string, any> {
    const totalTicks = Array.from(this.historicalTicks.values())
      .reduce((total, history) => total + history.length, 0);

    return {
      initialized: this.isInitialized,
      trackedSymbols: this.historicalTicks.size,
      totalTicks,
      onlineFeatures: this.onlineFeatures.size,
      mode: 'browser-compatible'
    };
  }

  /**
   * Estado de inicialización
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Limpiar datos (para testing)
   */
  clearData(): void {
    this.historicalTicks.clear();
    this.onlineFeatures.clear();
  }

  /**
   * Shutdown graceful
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Cerrando Feast Feature Store...');
    this.clearData();
    this.isInitialized = false;
  }
}

// Exportar instancia singleton
export const feastFeatureStore = new FeastFeatureStore();
