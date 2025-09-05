import { createClient, RedisClientType } from 'redis';
import { format, parseISO } from 'date-fns';

/**
 * Feast Feature Store Implementation
 * Sistema de gestión de features para ML con consistencia online/offline
 */

// ===== ENTITY DEFINITIONS =====
export interface FeastEntity {
  name: string;
  valueType: 'STRING' | 'INT32' | 'INT64' | 'DOUBLE' | 'FLOAT' | 'BOOL';
  description: string;
}

export const TRADING_ENTITIES: FeastEntity[] = [
  {
    name: 'symbol',
    valueType: 'STRING',
    description: 'Trading pair identifier (BTC/USDT, ETH/USDT, etc.)'
  },
  {
    name: 'exchange',
    valueType: 'STRING', 
    description: 'Exchange source (BINANCE, COINBASE, KUCOIN)'
  }
];

// ===== FEATURE DEFINITIONS =====
export interface FeatureDefinition {
  name: string;
  valueType: 'STRING' | 'INT32' | 'INT64' | 'DOUBLE' | 'FLOAT' | 'BOOL';
  description: string;
  source: 'REALTIME' | 'COMPUTED' | 'DERIVED';
}

export const MARKET_FEATURES: FeatureDefinition[] = [
  // Real-time market data
  { name: 'price', valueType: 'DOUBLE', description: 'Current market price', source: 'REALTIME' },
  { name: 'volume', valueType: 'DOUBLE', description: 'Trade volume', source: 'REALTIME' },
  { name: 'side', valueType: 'STRING', description: 'Trade side (buy/sell)', source: 'REALTIME' },
  
  // Technical indicators (computed)
  { name: 'rsi_14', valueType: 'DOUBLE', description: 'RSI with 14 periods', source: 'COMPUTED' },
  { name: 'rsi_21', valueType: 'DOUBLE', description: 'RSI with 21 periods', source: 'COMPUTED' },
  { name: 'macd_signal', valueType: 'DOUBLE', description: 'MACD signal line', source: 'COMPUTED' },
  { name: 'macd_histogram', valueType: 'DOUBLE', description: 'MACD histogram', source: 'COMPUTED' },
  { name: 'bollinger_upper', valueType: 'DOUBLE', description: 'Bollinger upper band', source: 'COMPUTED' },
  { name: 'bollinger_middle', valueType: 'DOUBLE', description: 'Bollinger middle band', source: 'COMPUTED' },
  { name: 'bollinger_lower', valueType: 'DOUBLE', description: 'Bollinger lower band', source: 'COMPUTED' },
  
  // Derived features (engineered)
  { name: 'price_change_1m', valueType: 'DOUBLE', description: '1-minute price change %', source: 'DERIVED' },
  { name: 'price_change_5m', valueType: 'DOUBLE', description: '5-minute price change %', source: 'DERIVED' },
  { name: 'volume_ratio', valueType: 'DOUBLE', description: 'Volume vs 20-period average', source: 'DERIVED' },
  { name: 'volatility_index', valueType: 'DOUBLE', description: 'Price volatility index', source: 'DERIVED' }
];

// ===== FEATURE VALUES =====
export interface FeatureValue {
  entityKey: string;        // symbol:exchange (e.g., "BTC/USDT:BINANCE")
  featureName: string;
  value: any;
  timestamp: number;        // Unix timestamp in milliseconds
  eventTime: Date;
}

export interface FeatureVector {
  entityKey: string;
  timestamp: number;
  features: Record<string, any>;
}

// ===== FEAST FEATURE STORE =====
export class FeastFeatureStore {
  private redis: RedisClientType;
  private isConnected: boolean = false;
  private readonly FEATURE_TTL = 24 * 60 * 60; // 24 hours in seconds
  private readonly ONLINE_STORE_PREFIX = 'feast:online:';
  private readonly OFFLINE_STORE_PREFIX = 'feast:offline:';

  constructor(redisUrl: string = 'redis://localhost:6379') {
    this.redis = createClient({ url: redisUrl });
    this.setupConnection();
  }

  private async setupConnection(): Promise<void> {
    try {
      this.redis.on('connect', () => {
        console.log('🔗 Feast Feature Store: Conectado a Redis');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        console.error('❌ Feast Feature Store: Error Redis:', error);
        this.isConnected = false;
      });

      // Conectar a Redis
      await this.redis.connect();
      console.log('✅ Feast Feature Store inicializado correctamente');

    } catch (error) {
      console.warn('⚠️ Redis no disponible, usando almacenamiento en memoria:', error);
      this.isConnected = false;
    }
  }

  /**
   * Ingesta features en tiempo real al online store
   */
  async ingestOnlineFeatures(features: FeatureValue[]): Promise<void> {
    if (!this.isConnected) {
      console.warn('⚠️ Redis no conectado, saltando ingesta online');
      return;
    }

    try {
      const pipeline = this.redis.multi();

      for (const feature of features) {
        const key = `${this.ONLINE_STORE_PREFIX}${feature.entityKey}:${feature.featureName}`;
        const value = JSON.stringify({
          value: feature.value,
          timestamp: feature.timestamp,
          eventTime: feature.eventTime.toISOString()
        });

        pipeline.setEx(key, this.FEATURE_TTL, value);
      }

      await pipeline.exec();
      
      console.log(`✅ Feast: Ingestadas ${features.length} features online`);
      
    } catch (error) {
      console.error('❌ Error ingesting online features:', error);
    }
  }

  /**
   * Obtiene features del online store para inferencia
   */
  async getOnlineFeatures(
    entityKeys: string[], 
    featureNames: string[]
  ): Promise<FeatureVector[]> {
    if (!this.isConnected) {
      console.warn('⚠️ Redis no conectado, retornando features vacías');
      return [];
    }

    try {
      const results: FeatureVector[] = [];

      for (const entityKey of entityKeys) {
        const features: Record<string, any> = {};
        let latestTimestamp = 0;

        for (const featureName of featureNames) {
          const key = `${this.ONLINE_STORE_PREFIX}${entityKey}:${featureName}`;
          const value = await this.redis.get(key);

          if (value) {
            const parsed = JSON.parse(value);
            features[featureName] = parsed.value;
            latestTimestamp = Math.max(latestTimestamp, parsed.timestamp);
          } else {
            features[featureName] = null;
          }
        }

        results.push({
          entityKey,
          timestamp: latestTimestamp,
          features
        });
      }

      console.log(`📊 Feast: Obtenidas features para ${entityKeys.length} entidades`);
      return results;

    } catch (error) {
      console.error('❌ Error getting online features:', error);
      return [];
    }
  }

  /**
   * Procesa tick de mercado y genera features
   */
  async processMarketTick(tick: {
    exchange: string;
    symbol: string;
    price: number;
    volume: number;
    timestamp: number;
    side?: string;
  }): Promise<void> {
    const entityKey = `${tick.symbol}:${tick.exchange}`;
    const eventTime = new Date(tick.timestamp);

    // Features directas del tick
    const directFeatures: FeatureValue[] = [
      {
        entityKey,
        featureName: 'price',
        value: tick.price,
        timestamp: tick.timestamp,
        eventTime
      },
      {
        entityKey,
        featureName: 'volume',
        value: tick.volume,
        timestamp: tick.timestamp,
        eventTime
      }
    ];

    if (tick.side) {
      directFeatures.push({
        entityKey,
        featureName: 'side',
        value: tick.side,
        timestamp: tick.timestamp,
        eventTime
      });
    }

    // Ingestar features directas
    await this.ingestOnlineFeatures(directFeatures);

    // Calcular y almacenar features derivadas
    await this.computeDerivedFeatures(entityKey, tick);
  }

  /**
   * Calcula features derivadas basadas en datos históricos
   */
  private async computeDerivedFeatures(
    entityKey: string, 
    currentTick: any
  ): Promise<void> {
    try {
      // Obtener histórico de precios para cálculos
      const priceHistory = await this.getPriceHistory(entityKey, 20); // Últimos 20 ticks
      
      if (priceHistory.length < 2) {
        console.log(`📊 Feast: Insuficiente histórico para ${entityKey}`);
        return;
      }

      const derivedFeatures: FeatureValue[] = [];
      const eventTime = new Date(currentTick.timestamp);

      // Calcular cambio de precio 1m (aproximado con ticks)
      const oneMinuteAgo = currentTick.timestamp - 60 * 1000;
      const oneMinuteTick = priceHistory.find(tick => tick.timestamp >= oneMinuteAgo);
      
      if (oneMinuteTick) {
        const priceChange1m = ((currentTick.price - oneMinuteTick.price) / oneMinuteTick.price) * 100;
        derivedFeatures.push({
          entityKey,
          featureName: 'price_change_1m',
          value: priceChange1m,
          timestamp: currentTick.timestamp,
          eventTime
        });
      }

      // Calcular ratio de volumen
      const avgVolume = priceHistory.reduce((sum, tick) => sum + tick.volume, 0) / priceHistory.length;
      const volumeRatio = currentTick.volume / avgVolume;
      
      derivedFeatures.push({
        entityKey,
        featureName: 'volume_ratio',
        value: volumeRatio,
        timestamp: currentTick.timestamp,
        eventTime
      });

      // Calcular índice de volatilidad
      const prices = priceHistory.map(tick => tick.price);
      const volatility = this.calculateVolatility(prices);
      
      derivedFeatures.push({
        entityKey,
        featureName: 'volatility_index',
        value: volatility,
        timestamp: currentTick.timestamp,
        eventTime
      });

      // Ingestar features derivadas
      if (derivedFeatures.length > 0) {
        await this.ingestOnlineFeatures(derivedFeatures);
      }

    } catch (error) {
      console.error('❌ Error computing derived features:', error);
    }
  }

  /**
   * Obtiene histórico de precios para cálculos
   */
  private async getPriceHistory(entityKey: string, count: number): Promise<any[]> {
    try {
      const historyKey = `${this.OFFLINE_STORE_PREFIX}history:${entityKey}`;
      const history = await this.redis.lRange(historyKey, 0, count - 1);
      
      return history.map(item => JSON.parse(item)).reverse(); // Más reciente primero
      
    } catch (error) {
      console.error('❌ Error getting price history:', error);
      return [];
    }
  }

  /**
   * Almacena tick en histórico para feature engineering
   */
  async storeHistoricalTick(tick: any): Promise<void> {
    if (!this.isConnected) return;

    try {
      const entityKey = `${tick.symbol}:${tick.exchange}`;
      const historyKey = `${this.OFFLINE_STORE_PREFIX}history:${entityKey}`;
      
      const tickData = JSON.stringify({
        price: tick.price,
        volume: tick.volume,
        timestamp: tick.timestamp,
        side: tick.side
      });

      // Almacenar con límite (últimos 1000 ticks)
      await this.redis.lPush(historyKey, tickData);
      await this.redis.lTrim(historyKey, 0, 999);

    } catch (error) {
      console.error('❌ Error storing historical tick:', error);
    }
  }

  /**
   * Calcula volatilidad de precios
   */
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Obtiene metadata de features disponibles
   */
  getFeatureMetadata(): {
    entities: FeastEntity[];
    features: FeatureDefinition[];
    stats: {
      totalFeatures: number;
      realtimeFeatures: number;
      computedFeatures: number;
      derivedFeatures: number;
    };
  } {
    const realtimeCount = MARKET_FEATURES.filter(f => f.source === 'REALTIME').length;
    const computedCount = MARKET_FEATURES.filter(f => f.source === 'COMPUTED').length;
    const derivedCount = MARKET_FEATURES.filter(f => f.source === 'DERIVED').length;

    return {
      entities: TRADING_ENTITIES,
      features: MARKET_FEATURES,
      stats: {
        totalFeatures: MARKET_FEATURES.length,
        realtimeFeatures: realtimeCount,
        computedFeatures: computedCount,
        derivedFeatures: derivedCount
      }
    };
  }

  /**
   * Limpia feature store (para testing)
   */
  async clearFeatureStore(): Promise<void> {
    if (!this.isConnected) return;

    try {
      const onlineKeys = await this.redis.keys(`${this.ONLINE_STORE_PREFIX}*`);
      const historyKeys = await this.redis.keys(`${this.OFFLINE_STORE_PREFIX}*`);
      
      if (onlineKeys.length > 0) {
        await this.redis.del(onlineKeys);
      }
      
      if (historyKeys.length > 0) {
        await this.redis.del(historyKeys);
      }
      
      console.log('🗑️ Feast Feature Store limpiado');
      
    } catch (error) {
      console.error('❌ Error clearing feature store:', error);
    }
  }

  /**
   * Obtiene estadísticas del feature store
   */
  async getFeatureStoreStats(): Promise<{
    onlineFeatures: number;
    historicalTicks: number;
    activeEntities: string[];
    isConnected: boolean;
  }> {
    if (!this.isConnected) {
      return {
        onlineFeatures: 0,
        historicalTicks: 0,
        activeEntities: [],
        isConnected: false
      };
    }

    try {
      const onlineKeys = await this.redis.keys(`${this.ONLINE_STORE_PREFIX}*`);
      const historyKeys = await this.redis.keys(`${this.OFFLINE_STORE_PREFIX}history:*`);
      
      const activeEntities = [...new Set(
        onlineKeys.map(key => {
          const parts = key.replace(this.ONLINE_STORE_PREFIX, '').split(':');
          return parts.slice(0, -1).join(':'); // Remove feature name
        })
      )] as string[];

      return {
        onlineFeatures: onlineKeys.length,
        historicalTicks: historyKeys.length,
        activeEntities,
        isConnected: true
      };

    } catch (error) {
      console.error('❌ Error getting feature store stats:', error);
      return {
        onlineFeatures: 0,
        historicalTicks: 0,
        activeEntities: [],
        isConnected: false
      };
    }
  }
}

// Singleton instance
export const feastFeatureStore = new FeastFeatureStore();
