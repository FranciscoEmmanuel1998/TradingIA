// 📊 FREE DATA AGGREGATOR - Agregador de datos gratuitos para optimización
// Utiliza APIs gratuitas: Alpha Vantage, Yahoo Finance, Cryptocompare

interface FreeDataSource {
  name: string;
  url: string;
  apiKey?: string;
  rateLimit: number; // calls per day
  symbols: string[];
  dataTypes: string[];
  isActive: boolean;
}

interface MarketDataPoint {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  timestamp: Date;
  source: string;
}

interface TechnicalIndicators {
  symbol: string;
  rsi: number;
  macd: number;
  macdSignal: number;
  ema20: number;
  ema50: number;
  sma200: number;
  support: number;
  resistance: number;
  timestamp: Date;
}

class FreeDataAggregator {
  private dataSources: Map<string, FreeDataSource>;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private requestCounts: Map<string, { count: number; resetTime: number }>;
  private isActive: boolean = false;
  
  constructor() {
    this.dataSources = new Map();
    this.cache = new Map();
    this.requestCounts = new Map();
    this.initializeDataSources();
  }
  
  private initializeDataSources(): void {
    // Alpha Vantage - 500 calls/day (gratuito)
    this.dataSources.set('alphavantage', {
      name: 'Alpha Vantage',
      url: 'https://www.alphavantage.co/query',
      apiKey: process.env.ALPHA_VANTAGE_API_KEY || 'demo', // Usar 'demo' para testing
      rateLimit: 500,
      symbols: ['IBM', 'MSFT', 'AAPL', 'GOOGL', 'TSLA'],
      dataTypes: ['quote', 'intraday', 'technical'],
      isActive: true
    });
    
    // Yahoo Finance (sin API key necesaria)
    this.dataSources.set('yahoo', {
      name: 'Yahoo Finance',
      url: 'https://query1.finance.yahoo.com/v8/finance/chart',
      rateLimit: 10000, // Muy generoso
      symbols: ['BTC-USD', 'ETH-USD', 'BNB-USD', 'ADA-USD', 'SOL-USD'],
      dataTypes: ['quote', 'chart'],
      isActive: true
    });
    
    // CryptoCompare - 1000 calls/mes (gratuito)
    this.dataSources.set('cryptocompare', {
      name: 'CryptoCompare',
      url: 'https://min-api.cryptocompare.com/data',
      apiKey: process.env.CRYPTOCOMPARE_API_KEY || '',
      rateLimit: 1000,
      symbols: ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOGE', 'DOT', 'MATIC'],
      dataTypes: ['price', 'historical', 'social'],
      isActive: true
    });
    
    console.log('📊 Free Data Aggregator inicializado con', this.dataSources.size, 'fuentes');
  }
  
  // 🎯 OBTENER DATOS DE MERCADO PRINCIPALES
  async getMarketData(symbol: string): Promise<MarketDataPoint | null> {
    try {
      // Primero intentar desde cache
      const cached = this.getFromCache(`market_${symbol}`);
      if (cached) {
        console.log(`📋 Datos de ${symbol} obtenidos desde cache`);
        return cached;
      }
      
      // Determinar la mejor fuente para el símbolo
      const source = this.selectBestSource(symbol);
      if (!source) {
        console.log(`❌ No hay fuente disponible para ${symbol}`);
        return null;
      }
      
      let data: MarketDataPoint | null = null;
      
      switch (source) {
        case 'yahoo':
          data = await this.fetchFromYahoo(symbol);
          break;
        case 'cryptocompare':
          data = await this.fetchFromCryptoCompare(symbol);
          break;
        case 'alphavantage':
          data = await this.fetchFromAlphaVantage(symbol);
          break;
      }
      
      if (data) {
        this.saveToCache(`market_${symbol}`, data, 60000); // Cache por 1 minuto
        console.log(`📊 Datos de ${symbol} obtenidos de ${source}`);
      }
      
      return data;
      
    } catch (error) {
      console.error(`❌ Error obteniendo datos de ${symbol}:`, error);
      return null;
    }
  }
  
  // 📈 OBTENER INDICADORES TÉCNICOS
  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators | null> {
    try {
      const cached = this.getFromCache(`technical_${symbol}`);
      if (cached) {
        return cached;
      }
      
      // Para indicadores técnicos, preferimos Alpha Vantage
      if (this.canMakeRequest('alphavantage')) {
        const indicators = await this.fetchTechnicalFromAlphaVantage(symbol);
        if (indicators) {
          this.saveToCache(`technical_${symbol}`, indicators, 300000); // Cache por 5 minutos
          return indicators;
        }
      }
      
      // Fallback: calcular indicadores básicos con datos de Yahoo
      const marketData = await this.getMarketData(symbol);
      if (marketData) {
        return this.calculateBasicIndicators(marketData);
      }
      
      return null;
      
    } catch (error) {
      console.error(`❌ Error obteniendo indicadores técnicos de ${symbol}:`, error);
      return null;
    }
  }
  
  // 🌐 MÉTODOS DE FETCH ESPECÍFICOS POR FUENTE
  private async fetchFromYahoo(symbol: string): Promise<MarketDataPoint | null> {
    if (!this.canMakeRequest('yahoo')) return null;
    
    try {
      // Convertir símbolo (BTC -> BTC-USD)
      const yahooSymbol = this.convertSymbolForYahoo(symbol);
      
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TradingIA/1.0)'
          }
        }
      );
      
      if (!response.ok) throw new Error(`Yahoo API error: ${response.status}`);
      
      const data = await response.json();
      this.incrementRequestCount('yahoo');
      
      if (data.chart?.result?.[0]) {
        const result = data.chart.result[0];
        const meta = result.meta;
        const quotes = result.indicators?.quote?.[0];
        
        return {
          symbol: symbol,
          price: meta.regularMarketPrice || meta.previousClose,
          volume: meta.regularMarketVolume || 0,
          change24h: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
          changePercent24h: ((meta.regularMarketPrice || 0) - (meta.previousClose || 0)) / (meta.previousClose || 1) * 100,
          high24h: meta.regularMarketDayHigh || meta.regularMarketPrice,
          low24h: meta.regularMarketDayLow || meta.regularMarketPrice,
          timestamp: new Date(),
          source: 'yahoo'
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Error en Yahoo Finance:', error);
      return null;
    }
  }
  
  private async fetchFromCryptoCompare(symbol: string): Promise<MarketDataPoint | null> {
    if (!this.canMakeRequest('cryptocompare')) return null;
    
    try {
      const baseSymbol = symbol.replace(/USDT|USD|-USD/g, '');
      const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${baseSymbol}&tsyms=USD`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`CryptoCompare API error: ${response.status}`);
      
      const data = await response.json();
      this.incrementRequestCount('cryptocompare');
      
      if (data.RAW?.[baseSymbol]?.USD) {
        const coinData = data.RAW[baseSymbol].USD;
        
        return {
          symbol: symbol,
          price: coinData.PRICE || 0,
          volume: coinData.VOLUME24HOUR || 0,
          change24h: coinData.CHANGE24HOUR || 0,
          changePercent24h: coinData.CHANGEPCT24HOUR || 0,
          high24h: coinData.HIGH24HOUR || coinData.PRICE,
          low24h: coinData.LOW24HOUR || coinData.PRICE,
          timestamp: new Date(),
          source: 'cryptocompare'
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Error en CryptoCompare:', error);
      return null;
    }
  }
  
  private async fetchFromAlphaVantage(symbol: string): Promise<MarketDataPoint | null> {
    if (!this.canMakeRequest('alphavantage')) return null;
    
    try {
      const apiKey = this.dataSources.get('alphavantage')?.apiKey || 'demo';
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Alpha Vantage API error: ${response.status}`);
      
      const data = await response.json();
      this.incrementRequestCount('alphavantage');
      
      if (data['Global Quote']) {
        const quote = data['Global Quote'];
        
        return {
          symbol: symbol,
          price: parseFloat(quote['05. price']) || 0,
          volume: parseFloat(quote['06. volume']) || 0,
          change24h: parseFloat(quote['09. change']) || 0,
          changePercent24h: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
          high24h: parseFloat(quote['03. high']) || 0,
          low24h: parseFloat(quote['04. low']) || 0,
          timestamp: new Date(),
          source: 'alphavantage'
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Error en Alpha Vantage:', error);
      return null;
    }
  }
  
  private async fetchTechnicalFromAlphaVantage(symbol: string): Promise<TechnicalIndicators | null> {
    try {
      const apiKey = this.dataSources.get('alphavantage')?.apiKey || 'demo';
      
      // Obtener RSI
      const rsiResponse = await fetch(
        `https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${apiKey}`
      );
      
      const rsiData = await rsiResponse.json();
      this.incrementRequestCount('alphavantage');
      
      // Obtener MACD
      const macdResponse = await fetch(
        `https://www.alphavantage.co/query?function=MACD&symbol=${symbol}&interval=daily&series_type=close&apikey=${apiKey}`
      );
      
      const macdData = await macdResponse.json();
      this.incrementRequestCount('alphavantage');
      
      // Obtener EMAs
      const ema20Response = await fetch(
        `https://www.alphavantage.co/query?function=EMA&symbol=${symbol}&interval=daily&time_period=20&series_type=close&apikey=${apiKey}`
      );
      
      const ema20Data = await ema20Response.json();
      this.incrementRequestCount('alphavantage');
      
      // Procesar datos (simplificado para demo)
      const latestDate = Object.keys(rsiData['Technical Analysis: RSI'] || {})[0];
      
      if (latestDate) {
        return {
          symbol: symbol,
          rsi: parseFloat(rsiData['Technical Analysis: RSI'][latestDate]['RSI']) || 50,
          macd: parseFloat(macdData['Technical Analysis: MACD'][latestDate]['MACD']) || 0,
          macdSignal: parseFloat(macdData['Technical Analysis: MACD'][latestDate]['MACD_Signal']) || 0,
          ema20: parseFloat(ema20Data['Technical Analysis: EMA'][latestDate]['EMA']) || 0,
          ema50: parseFloat(ema20Data['Technical Analysis: EMA'][latestDate]['EMA']) || 0, // Placeholder
          sma200: 0, // Placeholder
          support: 0, // Calculado localmente
          resistance: 0, // Calculado localmente
          timestamp: new Date()
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Error obteniendo indicadores técnicos:', error);
      return null;
    }
  }
  
  // 🧮 MÉTODOS AUXILIARES
  private selectBestSource(symbol: string): string | null {
    // Crypto symbols -> CryptoCompare o Yahoo
    if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('USD')) {
      if (this.canMakeRequest('cryptocompare')) return 'cryptocompare';
      if (this.canMakeRequest('yahoo')) return 'yahoo';
    }
    
    // Stock symbols -> Alpha Vantage o Yahoo
    if (this.canMakeRequest('alphavantage')) return 'alphavantage';
    if (this.canMakeRequest('yahoo')) return 'yahoo';
    
    return null;
  }
  
  private convertSymbolForYahoo(symbol: string): string {
    const conversions: { [key: string]: string } = {
      'BTCUSDT': 'BTC-USD',
      'ETHUSDT': 'ETH-USD',
      'BNBUSDT': 'BNB-USD',
      'ADAUSDT': 'ADA-USD',
      'SOLUSDT': 'SOL-USD',
      'BTC': 'BTC-USD',
      'ETH': 'ETH-USD'
    };
    
    return conversions[symbol] || symbol;
  }
  
  private canMakeRequest(source: string): boolean {
    const sourceConfig = this.dataSources.get(source);
    if (!sourceConfig?.isActive) return false;
    
    const requestData = this.requestCounts.get(source);
    if (!requestData) {
      this.requestCounts.set(source, { count: 0, resetTime: Date.now() + 24 * 60 * 60 * 1000 });
      return true;
    }
    
    // Reset counter si pasó un día
    if (Date.now() > requestData.resetTime) {
      this.requestCounts.set(source, { count: 0, resetTime: Date.now() + 24 * 60 * 60 * 1000 });
      return true;
    }
    
    return requestData.count < sourceConfig.rateLimit;
  }
  
  private incrementRequestCount(source: string): void {
    const requestData = this.requestCounts.get(source);
    if (requestData) {
      requestData.count++;
    }
  }
  
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.timestamp + cached.ttl) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }
  
  private saveToCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  private calculateBasicIndicators(marketData: MarketDataPoint): TechnicalIndicators {
    // ⚠️ DATOS SIMULADOS ELIMINADOS - CONECTAR A API REAL DE INDICADORES
    console.error('🚫 calculateBasicIndicators usa datos FALSOS - implementar cálculo real');
    
    return {
      symbol: marketData.symbol,
      rsi: 50, // Valor neutro hasta conectar indicadores reales
      macd: 0, // Sin datos falsos
      macdSignal: 0, // Sin datos falsos
      ema20: marketData.price, // Usar precio actual hasta tener EMA real
      ema50: marketData.price, // Usar precio actual hasta tener EMA real
      sma200: marketData.price, // Usar precio actual hasta tener SMA real
      support: marketData.low24h,
      resistance: marketData.high24h,
      timestamp: new Date()
    };
  }
  
  // 📊 MÉTODOS PÚBLICOS
  start(): void {
    this.isActive = true;
    console.log('📊 Free Data Aggregator INICIADO');
  }
  
  stop(): void {
    this.isActive = false;
    console.log('⏸️ Free Data Aggregator DETENIDO');
  }
  
  getStatus(): any {
    return {
      isActive: this.isActive,
      sources: Array.from(this.dataSources.entries()).map(([key, source]) => ({
        name: source.name,
        isActive: source.isActive,
        requestsUsed: this.requestCounts.get(key)?.count || 0,
        rateLimit: source.rateLimit,
        symbols: source.symbols.length
      })),
      cacheSize: this.cache.size
    };
  }
  
  async getMultipleSymbols(symbols: string[]): Promise<MarketDataPoint[]> {
    console.log(`📊 Obteniendo datos para ${symbols.length} símbolos...`);
    
    const promises = symbols.map(symbol => this.getMarketData(symbol));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<MarketDataPoint> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }
  
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache limpiado');
  }
}

// Exportar instancia singleton
export const freeDataAggregator = new FreeDataAggregator();
export type { MarketDataPoint, TechnicalIndicators, FreeDataSource };
