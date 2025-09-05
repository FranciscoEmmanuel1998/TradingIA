// 🌐 MULTI-EXCHANGE MANAGER - Coordinador de Exchanges Reales
import { EventBus } from '../../circulation/channels/EventBus';
import { KrakenConnector } from './KrakenConnector';
import { CoinbaseAdvancedConnector } from './CoinbaseAdvancedConnector';
import { KuCoinConnector } from './KuCoinConnector';

export interface ExchangeConfig {
  kraken?: {
    apiKey: string;
    privateKey: string;
    enabled: boolean;
  };
  coinbase?: {
    keyId: string;
    privateKey: string;
    enabled: boolean;
  };
  kucoin?: {
    apiKey: string;
    apiSecret: string;
    passphrase: string;
    enabled: boolean;
  };
}

export interface MarketData {
  exchange: string;
  symbol: string;
  price: number;
  volume?: number;
  timestamp: number;
  [key: string]: any;
}

export interface ExchangeStatus {
  exchange: string;
  connected: boolean;
  reconnectAttempts: number;
  lastUpdate: number;
  error?: string;
}

export class MultiExchangeManager {
  private eventBus: EventBus;
  private exchanges: Map<string, any> = new Map();
  private marketData: Map<string, MarketData[]> = new Map();
  private exchangeStatuses: Map<string, ExchangeStatus> = new Map();
  private aggregationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupEventListeners();
  }

  async initialize(config: ExchangeConfig): Promise<void> {
    console.log('🌐 MultiExchangeManager: Inicializando conexiones multi-exchange...');

    // Inicializar Kraken
    if (config.kraken?.enabled) {
      try {
        const krakenConnector = new KrakenConnector(
          config.kraken.apiKey,
          config.kraken.privateKey
        );
        this.exchanges.set('kraken', krakenConnector);
        await krakenConnector.initialize();
        
        this.exchangeStatuses.set('kraken', {
          exchange: 'kraken',
          connected: true,
          reconnectAttempts: 0,
          lastUpdate: Date.now()
        });
      } catch (error) {
        console.error('❌ Error inicializando Kraken:', error);
        this.exchangeStatuses.set('kraken', {
          exchange: 'kraken',
          connected: false,
          reconnectAttempts: 0,
          lastUpdate: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Inicializar Coinbase Advanced Trade
    if (config.coinbase?.enabled) {
      try {
        const coinbaseConnector = new CoinbaseAdvancedConnector(
          config.coinbase.keyId,
          config.coinbase.privateKey
        );
        this.exchanges.set('coinbase', coinbaseConnector);
        await coinbaseConnector.initialize();
        
        this.exchangeStatuses.set('coinbase', {
          exchange: 'coinbase',
          connected: true,
          reconnectAttempts: 0,
          lastUpdate: Date.now()
        });
      } catch (error) {
        console.error('❌ Error inicializando Coinbase:', error);
        this.exchangeStatuses.set('coinbase', {
          exchange: 'coinbase',
          connected: false,
          reconnectAttempts: 0,
          lastUpdate: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Inicializar KuCoin
    if (config.kucoin?.enabled) {
      try {
        const kucoinConnector = new KuCoinConnector(
          config.kucoin.apiKey,
          config.kucoin.apiSecret,
          config.kucoin.passphrase
        );
        this.exchanges.set('kucoin', kucoinConnector);
        await kucoinConnector.initialize();
        
        this.exchangeStatuses.set('kucoin', {
          exchange: 'kucoin',
          connected: true,
          reconnectAttempts: 0,
          lastUpdate: Date.now()
        });
      } catch (error) {
        console.error('❌ Error inicializando KuCoin:', error);
        this.exchangeStatuses.set('kucoin', {
          exchange: 'kucoin',
          connected: false,
          reconnectAttempts: 0,
          lastUpdate: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Iniciar agregación de datos
    this.startDataAggregation();

    console.log(`✅ MultiExchangeManager: ${this.exchanges.size} exchanges inicializados`);
    this.eventBus.emit('multiexchange.initialized', {
      exchanges: Array.from(this.exchanges.keys()),
      statuses: Array.from(this.exchangeStatuses.values())
    });
  }

  private setupEventListeners(): void {
    // Escuchar actualizaciones de precios de todos los exchanges
    this.eventBus.subscribe('market.price_update', this.handleMarketData.bind(this));
    
    // Escuchar eventos de conexión/desconexión
    this.eventBus.subscribe('exchange.*.connected', this.handleExchangeConnected.bind(this));
    this.eventBus.subscribe('exchange.*.disconnected', this.handleExchangeDisconnected.bind(this));
    this.eventBus.subscribe('exchange.*.failed', this.handleExchangeFailed.bind(this));
  }

  private handleMarketData(data: MarketData): void {
    const symbol = data.symbol;
    
    if (!this.marketData.has(symbol)) {
      this.marketData.set(symbol, []);
    }
    
    const symbolData = this.marketData.get(symbol)!;
    
    // Remover datos antiguos (> 5 minutos)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const filteredData = symbolData.filter(d => d.timestamp > fiveMinutesAgo);
    
    // Agregar nueva data
    filteredData.push(data);
    this.marketData.set(symbol, filteredData);
  }

  private handleExchangeConnected(event: any): void {
    const exchange = event.exchange;
    if (this.exchangeStatuses.has(exchange)) {
      const status = this.exchangeStatuses.get(exchange)!;
      status.connected = true;
      status.lastUpdate = Date.now();
      status.error = undefined;
      this.exchangeStatuses.set(exchange, status);
    }
  }

  private handleExchangeDisconnected(event: any): void {
    const exchange = event.exchange;
    if (this.exchangeStatuses.has(exchange)) {
      const status = this.exchangeStatuses.get(exchange)!;
      status.connected = false;
      status.lastUpdate = Date.now();
      status.error = event.error;
      this.exchangeStatuses.set(exchange, status);
    }
  }

  private handleExchangeFailed(event: any): void {
    const exchange = event.exchange;
    if (this.exchangeStatuses.has(exchange)) {
      const status = this.exchangeStatuses.get(exchange)!;
      status.connected = false;
      status.lastUpdate = Date.now();
      status.error = `Failed: ${event.reason}`;
      this.exchangeStatuses.set(exchange, status);
    }
  }

  private startDataAggregation(): void {
    // Agregar datos cada 10 segundos
    this.aggregationInterval = setInterval(() => {
      this.aggregateAndEmitMarketData();
    }, 10000);
  }

  private aggregateAndEmitMarketData(): void {
    const aggregatedData: { [symbol: string]: any } = {};
    
    for (const [symbol, dataPoints] of this.marketData.entries()) {
      if (dataPoints.length === 0) continue;
      
      // Calcular precios promedio, volumen total, etc.
      const prices = dataPoints.map(d => d.price);
      const volumes = dataPoints.map(d => d.volume || 0);
      
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const totalVolume = volumes.reduce((a, b) => a + b, 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      // Calcular spread entre exchanges
      const exchanges = [...new Set(dataPoints.map(d => d.exchange))];
      const exchangePrices = exchanges.map(exchange => {
        const exchangeData = dataPoints.filter(d => d.exchange === exchange);
        const latestData = exchangeData[exchangeData.length - 1];
        return { exchange, price: latestData.price };
      });
      
      const spread = exchanges.length > 1 ? maxPrice - minPrice : 0;
      const spreadPercent = exchanges.length > 1 ? (spread / avgPrice) * 100 : 0;
      
      aggregatedData[symbol] = {
        symbol,
        averagePrice: avgPrice,
        totalVolume,
        minPrice,
        maxPrice,
        spread,
        spreadPercent,
        exchangeCount: exchanges.length,
        exchangePrices,
        lastUpdate: Math.max(...dataPoints.map(d => d.timestamp))
      };
    }
    
    // Emitir datos agregados
    this.eventBus.emit('market.aggregated_data', {
      symbols: aggregatedData,
      timestamp: Date.now(),
      exchangeCount: this.exchanges.size,
      connectedExchanges: Array.from(this.exchangeStatuses.values()).filter(s => s.connected).length
    });
  }

  // Obtener el mejor precio entre exchanges
  getBestPrice(symbol: string, side: 'buy' | 'sell'): { exchange: string; price: number } | null {
    const symbolData = this.marketData.get(symbol);
    if (!symbolData || symbolData.length === 0) return null;
    
    const latestData = symbolData.filter(d => Date.now() - d.timestamp < 30000); // Últimos 30 segundos
    if (latestData.length === 0) return null;
    
    if (side === 'buy') {
      // Para comprar, queremos el precio más bajo
      const lowest = latestData.reduce((min, current) => 
        current.price < min.price ? current : min
      );
      return { exchange: lowest.exchange, price: lowest.price };
    } else {
      // Para vender, queremos el precio más alto
      const highest = latestData.reduce((max, current) => 
        current.price > max.price ? current : max
      );
      return { exchange: highest.exchange, price: highest.price };
    }
  }

  // Ejecutar orden en el mejor exchange
  async placeBestOrder(symbol: string, side: 'buy' | 'sell', amount: number, maxSlippage: number = 0.001): Promise<any> {
    const bestPrice = this.getBestPrice(symbol, side);
    if (!bestPrice) {
      throw new Error(`No hay datos de precio disponibles para ${symbol}`);
    }
    
    const exchange = this.exchanges.get(bestPrice.exchange);
    if (!exchange) {
      throw new Error(`Exchange ${bestPrice.exchange} no está disponible`);
    }
    
    console.log(`🎯 Ejecutando orden en ${bestPrice.exchange} - ${side} ${amount} ${symbol} @ ${bestPrice.price}`);
    
    // Aquí ejecutarías la orden en el exchange específico
    // Cada exchange tiene su propia implementación de placeOrder
    
    this.eventBus.emit('order.best_execution', {
      exchange: bestPrice.exchange,
      symbol,
      side,
      amount,
      price: bestPrice.price,
      timestamp: Date.now()
    });
    
    return {
      exchange: bestPrice.exchange,
      price: bestPrice.price,
      amount,
      side,
      timestamp: Date.now()
    };
  }

  getExchangeStatuses(): ExchangeStatus[] {
    return Array.from(this.exchangeStatuses.values());
  }

  getConnectedExchanges(): string[] {
    return Array.from(this.exchangeStatuses.values())
      .filter(status => status.connected)
      .map(status => status.exchange);
  }

  getMarketDataSummary(): any {
    const summary: any = {};
    
    for (const [symbol, dataPoints] of this.marketData.entries()) {
      if (dataPoints.length > 0) {
        const latest = dataPoints[dataPoints.length - 1];
        summary[symbol] = {
          price: latest.price,
          exchanges: [...new Set(dataPoints.map(d => d.exchange))].length,
          lastUpdate: latest.timestamp
        };
      }
    }
    
    return summary;
  }

  async shutdown(): Promise<void> {
    console.log('🌐 MultiExchangeManager: Cerrando todas las conexiones...');
    
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
    }
    
    for (const [name, exchange] of this.exchanges.entries()) {
      try {
        await exchange.shutdown();
        console.log(`✅ ${name} desconectado correctamente`);
      } catch (error) {
        console.error(`❌ Error desconectando ${name}:`, error);
      }
    }
    
    this.exchanges.clear();
    this.marketData.clear();
    this.exchangeStatuses.clear();
    
    this.eventBus.emit('multiexchange.shutdown', { timestamp: Date.now() });
  }
}
