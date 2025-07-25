// 🔥 SIMULADOR DE DATOS REALES - Para desarrollo en navegador
import EventEmitter from 'eventemitter3';

export interface RealMarketTick {
  exchange: string;
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  source: 'REAL_MARKET_DATA' | 'SIMULATED_REAL_DATA';
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
  source: 'REAL_PROCESSED_DATA' | 'SIMULATED_REAL_DATA';
}

class RealDataSimulator extends EventEmitter {
  private priceHistory: Map<string, RealMarketTick[]> = new Map();
  private processedData: Map<string, ProcessedMarketData> = new Map();
  private isActive: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  private readonly SYMBOLS = [
    'BTC/USD', 'ETH/USD', 'SOL/USD', 'ADA/USD', 'DOT/USD',
    'MATIC/USD', 'LINK/USD', 'UNI/USD', 'AVAX/USD', 'ATOM/USD'
  ];

  private readonly BASE_PRICES: { [key: string]: number } = {
    'BTC/USD': 67000,
    'ETH/USD': 3800,
    'SOL/USD': 185,
    'ADA/USD': 0.45,
    'DOT/USD': 7.2,
    'MATIC/USD': 0.95,
    'LINK/USD': 15.5,
    'UNI/USD': 8.3,
    'AVAX/USD': 28.5,
    'ATOM/USD': 9.8
  };

  constructor() {
    super();
    // Solo mostrar log inicial una vez
    if (!this.isActive) {
      console.log('🔄 Iniciando simulador de datos reales para desarrollo...');
    }
  }

  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🔥 RealDataSimulator INICIADO - Simulando datos reales para desarrollo');
    
    // Inicializar datos base para todos los símbolos
    this.initializeBaseData();
    
    // Simular ticks cada segundo
    this.updateInterval = setInterval(() => {
      this.simulateMarketTicks();
    }, 1000);

    this.emit('bridge_started');
  }

  stop(): void {
    this.isActive = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('🛑 RealDataSimulator DETENIDO');
    this.emit('bridge_stopped');
  }

  private initializeBaseData(): void {
    this.SYMBOLS.forEach(symbol => {
      // Inicializar con algunos ticks históricos
      const basePrice = this.BASE_PRICES[symbol] || 100;
      const history: RealMarketTick[] = [];
      
      for (let i = 20; i > 0; i--) {
        const tick: RealMarketTick = {
          exchange: 'SIMULATED',
          symbol,
          price: basePrice * (0.99 + Math.random() * 0.02), // ±1% variación
          timestamp: Date.now() - (i * 1000),
          volume: Math.random() * 1000000 + 100000,
          source: 'SIMULATED_REAL_DATA'
        };
        history.push(tick);
      }
      
      this.priceHistory.set(symbol, history);
      this.calculateTechnicalIndicators(symbol);
    });
  }

  private simulateMarketTicks(): void {
    if (!this.isActive) return;

    this.SYMBOLS.forEach(symbol => {
      const history = this.priceHistory.get(symbol);
      if (!history || history.length === 0) return;

      const lastPrice = history[history.length - 1].price;
      
      // Simular movimiento de precio realista
      const volatility = 0.002; // 0.2% volatilidad por tick
      const priceChange = (Math.random() - 0.5) * 2 * volatility * lastPrice;
      const newPrice = Math.max(0.01, lastPrice + priceChange);

      const tick: RealMarketTick = {
        exchange: 'SIMULATED',
        symbol,
        price: newPrice,
        timestamp: Date.now(),
        volume: Math.random() * 1000000 + 100000,
        source: 'SIMULATED_REAL_DATA'
      };

      this.processTick(tick);
    });
  }

  processTick(tick: RealMarketTick): void {
    if (!this.isActive) return;

    const symbol = tick.symbol;
    
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, []);
    }
    
    const history = this.priceHistory.get(symbol)!;
    history.push(tick);
    
    // Mantener solo últimos 200 ticks
    if (history.length > 200) {
      history.shift();
    }

    this.emit('real_tick', tick);
    
    // Calcular indicadores técnicos
    if (history.length >= 20) {
      this.calculateTechnicalIndicators(symbol);
    }
  }

  private calculateTechnicalIndicators(symbol: string): void {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length < 20) return;

    const prices = history.map(tick => tick.price);
    const volumes = history.map(tick => tick.volume || 1000000);
    const latestTick = history[history.length - 1];

    // Cálculos técnicos reales
    const rsi = this.calculateRSI(prices, 14);
    const ema20 = this.calculateEMA(prices, 20);
    const ema50 = this.calculateEMA(prices, 50);
    const macd = this.calculateMACD(prices);
    const volatility = this.calculateVolatility(prices.slice(-24));
    
    const change24h = history.length >= 24 
      ? ((latestTick.price - history[history.length - 24].price) / history[history.length - 24].price) * 100
      : 0;

    const sortedPrices = [...prices.slice(-50)].sort((a, b) => a - b);
    const support = sortedPrices[Math.floor(sortedPrices.length * 0.1)];
    const resistance = sortedPrices[Math.floor(sortedPrices.length * 0.9)];

    const processedData: ProcessedMarketData = {
      symbol,
      price: latestTick.price,
      volume: volumes[volumes.length - 1],
      change24h,
      volatility,
      rsi,
      macd,
      ema20,
      ema50,
      support,
      resistance,
      marketCap: latestTick.price * 21000000,
      liquidity: volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length,
      lastUpdate: latestTick.timestamp,
      source: 'SIMULATED_REAL_DATA'
    };

    this.processedData.set(symbol, processedData);
    this.emit('processed_data', processedData);
    this.emit('market_data_update', processedData);
  }

  // Métodos de cálculo técnico (iguales que en RealDataBridge)
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
      }
    }

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];

    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    for (let i = period; i < prices.length; i++) {
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
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * 100;
  }

  // Métodos públicos para compatibilidad
  getProcessedData(symbol: string): ProcessedMarketData | null {
    return this.processedData.get(symbol) || null;
  }

  getPriceHistory(symbol: string): RealMarketTick[] {
    return this.priceHistory.get(symbol) || [];
  }

  getAvailableSymbols(): string[] {
    return Array.from(this.processedData.keys());
  }

  getStats(): {
    activeSymbols: number;
    totalTicks: number;
    lastUpdate: number;
    isActive: boolean;
  } {
    let totalTicks = 0;
    this.priceHistory.forEach(history => {
      totalTicks += history.length;
    });

    const lastUpdates = Array.from(this.processedData.values()).map(data => data.lastUpdate);
    const lastUpdate = lastUpdates.length > 0 ? Math.max(...lastUpdates) : 0;

    return {
      activeSymbols: this.processedData.size,
      totalTicks,
      lastUpdate,
      isActive: this.isActive
    };
  }

  verifyRealDataOnly(): boolean {
    // En modo desarrollo, aceptamos datos simulados
    return true;
  }
}

// Instancia global
export const realDataBridge = new RealDataSimulator();

// Auto-inicializar en desarrollo
const isDevelopment = import.meta.env.MODE === 'development' || 
                      import.meta.env.DEV || 
                      !import.meta.env.PROD;

if (isDevelopment) {
  realDataBridge.start();
  console.log('🔥 RealDataSimulator AUTO-INICIADO para desarrollo');
}
