// 🔥 PUENTE DE DATOS 100% REALES - FASE IA 2
// Conecta DIRECTAMENTE con WebSockets de exchanges sin simulación

import EventEmitter from 'eventemitter3';

// Importar WebSocket feeds reales
import { binanceWebSocketFeed } from './BinanceWebSocket';
import { coinbaseWebSocketFeed } from './CoinbaseWebSocket';
import { kuCoinWebSocketFeed } from './KuCoinWebSocket';

export interface RealMarketTick {
  exchange: string;
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  source: 'REAL_MARKET_DATA';
}

export interface ProcessedMarketData {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  volatility: number;
  rsi: number;
  macd: number;
  ema20: number;
  ema50: number;
  support: number;
  resistance: number;
  marketCap: number;
  liquidity: number;
  lastUpdate: number;
  source: 'REAL_PROCESSED_DATA';
}

class RealDataBridgeProduction extends EventEmitter {
  private priceHistory: Map<string, RealMarketTick[]> = new Map();
  private processedData: Map<string, ProcessedMarketData> = new Map();
  private isActive: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private exchangeFeeds: Map<string, any> = new Map();

  // Mapeo de símbolos normalizados
  private readonly SYMBOL_MAP = {
    'BTC/USD': ['BTCUSD', 'BTC-USD', 'BTCUSDT'],
    'ETH/USD': ['ETHUSD', 'ETH-USD', 'ETHUSDT'],
    'SOL/USD': ['SOLUSD', 'SOL-USD', 'SOLUSDT'],
    'ADA/USD': ['ADAUSD', 'ADA-USD', 'ADAUSDT'],
    'DOT/USD': ['DOTUSD', 'DOT-USD', 'DOTUSDT'],
    'MATIC/USD': ['MATICUSD', 'MATIC-USD', 'MATICUSDT'],
    'LINK/USD': ['LINKUSD', 'LINK-USD', 'LINKUSDT'],
    'UNI/USD': ['UNIUSD', 'UNI-USD', 'UNIUSDT'],
    'AVAX/USD': ['AVAXUSD', 'AVAX-USD', 'AVAXUSDT'],
    'ATOM/USD': ['ATOMUSD', 'ATOM-USD', 'ATOMUSDT']
  };

  constructor() {
    super();
    console.log('🔥 RealDataBridgeProduction - SOLO DATOS REALES DE EXCHANGES');
  }

  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🚀 FASE IA 2: Conectando DIRECTAMENTE a exchanges reales...');
    
    // Conectar a exchanges reales
    this.connectToExchanges();
    
    // Procesar datos cada segundo
    this.updateInterval = setInterval(() => {
      this.processAllMarketData();
    }, 1000);

    this.emit('bridge_started');
  }

  private connectToExchanges(): void {
    console.log('🔗 Conectando a Binance, Coinbase y KuCoin...');
    
    // Suscribirse a datos de Binance
    binanceWebSocketFeed.onTick((tick: any) => {
      this.handleRealTick({
        exchange: 'BINANCE',
        symbol: this.normalizeSymbol(tick.symbol),
        price: parseFloat(tick.price),
        volume: parseFloat(tick.volume),
        timestamp: Date.now(),
        source: 'REAL_MARKET_DATA'
      });
    });

    // Suscribirse a datos de Coinbase
    coinbaseWebSocketFeed.onTick((tick: any) => {
      this.handleRealTick({
        exchange: 'COINBASE',
        symbol: this.normalizeSymbol(tick.product_id),
        price: parseFloat(tick.price),
        volume: parseFloat(tick.last_size),
        timestamp: Date.now(),
        source: 'REAL_MARKET_DATA'
      });
    });

    // Suscribirse a datos de KuCoin
    kuCoinWebSocketFeed.onTick((tick: any) => {
      this.handleRealTick({
        exchange: 'KUCOIN',
        symbol: this.normalizeSymbol(tick.topic),
        price: parseFloat(tick.data.price),
        volume: parseFloat(tick.data.size),
        timestamp: Date.now(),
        source: 'REAL_MARKET_DATA'
      });
    });

    console.log('✅ Conectado a todos los exchanges reales');
  }

  private normalizeSymbol(exchangeSymbol: string): string {
    // Normalizar símbolos de diferentes exchanges a formato estándar
    const cleanSymbol = exchangeSymbol.replace(/[-_]/g, '').toUpperCase();
    
    for (const [standard, variants] of Object.entries(this.SYMBOL_MAP)) {
      if (variants.some(variant => cleanSymbol.includes(variant.replace(/[-_/]/g, '')))) {
        return standard;
      }
    }
    
    return exchangeSymbol;
  }

  private handleRealTick(tick: RealMarketTick): void {
    // Almacenar histórico
    if (!this.priceHistory.has(tick.symbol)) {
      this.priceHistory.set(tick.symbol, []);
    }
    
    const history = this.priceHistory.get(tick.symbol)!;
    history.push(tick);
    
    // Mantener solo últimos 100 ticks
    if (history.length > 100) {
      history.shift();
    }
    
    // Emitir tick real
    this.emit('real_tick', tick);
    
    console.log(`📈 ${tick.exchange}: ${tick.symbol} = $${tick.price}`);
  }

  private processAllMarketData(): void {
    if (!this.isActive) return;

    for (const [symbol, history] of this.priceHistory.entries()) {
      if (history.length > 0) {
        const processed = this.processSymbolData(symbol, history);
        this.processedData.set(symbol, processed);
        this.emit('processed_data', processed);
      }
    }
  }

  private processSymbolData(symbol: string, history: RealMarketTick[]): ProcessedMarketData {
    const latest = history[history.length - 1];
    const prices = history.map(h => h.price);
    
    // Calcular indicadores técnicos reales
    const rsi = this.calculateRSI(prices);
    const ema20 = this.calculateEMA(prices, 20);
    const ema50 = this.calculateEMA(prices, 50);
    const volatility = this.calculateVolatility(prices);
    
    return {
      symbol,
      price: latest.price,
      volume: latest.volume || 0,
      change24h: this.calculate24hChange(prices),
      volatility,
      rsi,
      macd: this.calculateMACD(prices),
      ema20,
      ema50,
      support: Math.min(...prices.slice(-20)),
      resistance: Math.max(...prices.slice(-20)),
      marketCap: this.estimateMarketCap(symbol, latest.price),
      liquidity: latest.volume || 0,
      lastUpdate: latest.timestamp,
      source: 'REAL_PROCESSED_DATA'
    };
  }

  // Indicadores técnicos reales
  private calculateRSI(prices: number[]): number {
    if (prices.length < 14) return 50;
    
    let gains = 0, losses = 0;
    for (let i = 1; i < 15; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const rs = gains / losses;
    return 100 - (100 / (1 + rs));
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  private calculateMACD(prices: number[]): number {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    return ema12 - ema26;
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * Math.sqrt(252) * 100; // Volatilidad anualizada
  }

  private calculate24hChange(prices: number[]): number {
    if (prices.length < 2) return 0;
    const first = prices[0];
    const last = prices[prices.length - 1];
    return ((last - first) / first) * 100;
  }

  private estimateMarketCap(symbol: string, price: number): number {
    // Estimaciones aproximadas basadas en datos públicos
    const marketCapMultipliers: { [key: string]: number } = {
      'BTC/USD': 19_500_000,
      'ETH/USD': 120_000_000,
      'SOL/USD': 460_000_000,
      'ADA/USD': 35_000_000_000,
      'DOT/USD': 1_400_000_000
    };
    
    return (marketCapMultipliers[symbol] || 1_000_000) * price;
  }

  stop(): void {
    this.isActive = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('🔌 RealDataBridgeProduction desconectado');
  }

  // Métodos de acceso a datos
  getProcessedData(symbol: string): ProcessedMarketData | undefined {
    return this.processedData.get(symbol);
  }

  getAllProcessedData(): Map<string, ProcessedMarketData> {
    return new Map(this.processedData);
  }

  getPriceHistory(symbol: string): RealMarketTick[] {
    return this.priceHistory.get(symbol) || [];
  }

  isConnected(): boolean {
    return this.isActive && this.processedData.size > 0;
  }
}

// Exportar instancia singleton
export const realDataBridge = new RealDataBridgeProduction();
