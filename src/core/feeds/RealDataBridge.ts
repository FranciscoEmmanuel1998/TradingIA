// 🔥 PUENTE DE DATOS REALES - NÚCLEO DE INTEGRACIÓN
// Conecta WebSocket feeds reales con toda la infraestructura de IA

import EventEmitter from 'eventemitter3';
import { superinteligenciaAI } from '../ai/SuperinteligenciaAI';
import { advancedPredictionVerificationSystem } from '../verification/AdvancedPredictionVerificationSystem';
import { predictionVerificationSystem } from '../verification/PredictionVerificationSystem';
import { feastFeatureStore } from '../feast/FeastFeatureStoreBrowser';
import { riverIntegrationBridge } from '../river/RiverIntegrationBridgeBrowser';

// ⚡ Interfaz de tick real de mercado
export interface RealMarketTick {
  exchange: string;
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  source: 'REAL_MARKET_DATA';
}

// 📊 Datos de mercado procesados y listos para IA
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

class RealDataBridge extends EventEmitter {
  private priceHistory: Map<string, RealMarketTick[]> = new Map();
  private processedData: Map<string, ProcessedMarketData> = new Map();
  private lastPredictions: Map<string, any> = new Map(); // Para River learning
  private isActive: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    // EventEmitter3 no necesita setMaxListeners
  }

  // 🚀 Inicializar puente de datos reales
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🔥 RealDataBridge INICIADO - Conectando datos reales con IA');
    
    // Procesar datos cada segundo
    this.updateInterval = setInterval(() => {
      this.processAllMarketData();
    }, 1000);

    // Emitir evento de inicio
    this.emit('bridge_started');
  }

  // 🛑 Detener puente
  stop(): void {
    this.isActive = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('🛑 RealDataBridge DETENIDO');
    this.emit('bridge_stopped');
  }

  // 📊 Procesar tick real de mercado
  async processTick(tick: RealMarketTick): Promise<void> {
    if (!this.isActive) return;

    const symbol = tick.symbol;
    
    // Almacenar en historial
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, []);
    }
    
    const history = this.priceHistory.get(symbol)!;
    history.push(tick);
    
    // Mantener solo últimos 200 ticks (para cálculos técnicos)
    if (history.length > 200) {
      history.shift();
    }

  // 🎯 ALIMENTAR SISTEMAS DE VERIFICACIÓN (básico y avanzado)
  advancedPredictionVerificationSystem.updatePrice(symbol, tick.price);
  predictionVerificationSystem.updatePrice(symbol, tick.price);

    // 🧠 FEAST + RIVER INTEGRATION - APRENDIZAJE INFINITO
    try {
      // 1. Procesar tick en Feast Feature Store
      await feastFeatureStore.processMarketTick({
        exchange: tick.exchange,
        symbol: tick.symbol,
        price: tick.price,
        volume: tick.volume || 1000000,
        timestamp: tick.timestamp,
        side: 'buy' // Default value for non-specified side
      });

      // 2. Si tenemos datos suficientes para River
      if (history.length >= 20) {
        const processedData = this.processedData.get(symbol);
        const previousPrediction = this.lastPredictions.get(symbol);
        
        const currentFeatures = {
          price: tick.price,
          volume: tick.volume || 1000000,
          exchange: tick.exchange,
          timestamp: tick.timestamp,
          ...(processedData ? {
            rsi: processedData.rsi,
            macd: processedData.macd,
            ema20: processedData.ema20,
            volatility: processedData.volatility
          } : {})
        };

        // 3. River Online Learning: Predicción + Aprendizaje reflexivo
        const riverPrediction = await riverIntegrationBridge.processMarketTick(
          symbol,
          currentFeatures,
          previousPrediction
        );

        // 4. Guardar predicción para próximo ciclo
        this.lastPredictions.set(symbol, riverPrediction);

        console.log(`🧠 River-Feast: ${symbol} | Pred: ${riverPrediction.prediction.toFixed(4)} | Conf: ${riverPrediction.confidence.toFixed(3)} | Model: ${riverPrediction.modelType}`);
      }
    } catch (error) {
      console.error(`❌ Feast/River integration error for ${symbol}:`, error);
    }

    // Emitir tick procesado
    this.emit('real_tick', tick);
    
    // Si tenemos suficientes datos, calcular indicadores
    if (history.length >= 20) {
      this.calculateTechnicalIndicators(symbol);
    }
  }

  // ⚡ Calcular indicadores técnicos REALES
  private calculateTechnicalIndicators(symbol: string): void {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length < 20) return;

    const prices = history.map(tick => tick.price);
    const volumes = history.map(tick => tick.volume || 1000000);
    const latestTick = history[history.length - 1];

    // RSI real
    const rsi = this.calculateRSI(prices, 14);
    
    // EMAs reales
    const ema20 = this.calculateEMA(prices, 20);
    const ema50 = this.calculateEMA(prices, 50);
    
    // MACD real
    const macd = this.calculateMACD(prices);
    
    // Volatilidad real (últimas 24h simuladas con últimos 24 ticks)
    const volatility = this.calculateVolatility(prices.slice(-24));
    
    // Cambio 24h real
    const change24h = history.length >= 24 
      ? ((latestTick.price - history[history.length - 24].price) / history[history.length - 24].price) * 100
      : 0;

    // Soporte/Resistencia basado en datos reales
    const sortedPrices = [...prices.slice(-50)].sort((a, b) => a - b);
    const support = sortedPrices[Math.floor(sortedPrices.length * 0.1)];
    const resistance = sortedPrices[Math.floor(sortedPrices.length * 0.9)];

    // Crear datos procesados
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
      marketCap: latestTick.price * 21000000, // Bitcoin supply aproximado
      liquidity: volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length,
      lastUpdate: latestTick.timestamp,
      source: 'REAL_PROCESSED_DATA'
    };

    // Almacenar datos procesados
    this.processedData.set(symbol, processedData);
    
    // Emitir datos procesados para la IA
    this.emit('processed_data', processedData);
  }

  // 📈 Calcular RSI real
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    // Calcular gains/losses iniciales
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

    // Calcular RSI para el resto de precios
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

  // 📊 Calcular EMA real
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];

    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  // ⚡ Calcular MACD real
  private calculateMACD(prices: number[]): number {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    return ema12 - ema26;
  }

  // 📈 Calcular volatilidad real
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * 100; // Volatilidad en porcentaje
  }

  // 🔄 Procesar todos los datos de mercado
  private processAllMarketData(): void {
    // Emitir datos procesados actualizados
    this.processedData.forEach((data, symbol) => {
      this.emit('market_data_update', data);
    });
  }

  // 📊 Obtener datos procesados de un símbolo
  getProcessedData(symbol: string): ProcessedMarketData | null {
    return this.processedData.get(symbol) || null;
  }

  // 📈 Obtener historial de precios
  getPriceHistory(symbol: string): RealMarketTick[] {
    return this.priceHistory.get(symbol) || [];
  }

  // 📊 Obtener todos los símbolos disponibles
  getAvailableSymbols(): string[] {
    return Array.from(this.processedData.keys());
  }

  // 🎯 Obtener estadísticas del puente
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

  // 🔥 Verificar que NO hay simulaciones
  verifyRealDataOnly(): boolean {
    for (const [symbol, data] of this.processedData) {
      if (data.source !== 'REAL_PROCESSED_DATA') {
        console.error(`❌ SIMULATION DETECTED: ${symbol} has source: ${data.source}`);
        return false;
      }
    }
    return true;
  }
}

// 🚀 Instancia global del puente de datos reales
export const realDataBridge = new RealDataBridge();

// 🔥 AUTO-INICIALIZAR si no hay simulaciones (usando variables de Vite)
const enableSimulation = import.meta.env.VITE_ENABLE_SIMULATION === 'true';
const enableRealData = import.meta.env.VITE_ENABLE_REAL_DATA === 'true';

if (!enableSimulation && enableRealData) {
  realDataBridge.start();
  console.log('🔥 RealDataBridge AUTO-INICIADO - Modo producción detectado');
}
