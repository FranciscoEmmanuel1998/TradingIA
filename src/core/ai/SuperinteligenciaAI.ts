// 🧠 SUPERINTELIGENCIA AI - Motor de Señales REALES
// Sistema de IA que genera señales usando SOLO datos reales de mercado

import { realDataBridge, ProcessedMarketData } from '../feeds/RealDataBridge';
import { uniqueIdGenerator } from '../utils/UniqueIdGenerator';

export interface MarketData {
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
}

export interface TechnicalAnalysis {
  trendStrength: number;
  momentum: number;
  volatilityScore: number;
  volumeProfile: number;
  supportResistance: number;
  fibonacciLevel: number;
  patternRecognition: string;
  institutionalFlow: number;
}

export interface AISignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  confidence: number;
  price: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  reasoning: string;
  profitPotential: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  marketConditions: string;
  technicalScore: number;
  fundamentalScore: number;
  sentimentScore: number;
  timestamp: Date;
  exchange: string;
}

class SuperinteligenciaAI {
  private isActive: boolean = false;
  private signalCallbacks: ((signal: AISignal) => void)[] = [];
  private realMarketData: Map<string, MarketData> = new Map();
  private analysisHistory: TechnicalAnalysis[] = [];
  private simulationKillSwitch: boolean = false;
  
  constructor() {
    // 🚫 VERIFICACIÓN ANTI-SIMULACIÓN
    this.verifyNoSimulation();
    
    // 🔗 Conectar con puente de datos reales
    this.connectToRealDataBridge();
  }

  // 🚫 Verificar que NO hay simulaciones activas
  private verifyNoSimulation(): void {
    if (process.env.ENABLE_SIMULATION === 'true') {
      console.error('❌ SIMULATION DETECTED - SuperinteligenciaAI refusing to start');
      this.simulationKillSwitch = true;
      return;
    }
    
    console.log('✅ NO SIMULATION - SuperinteligenciaAI authorized for real data');
    this.simulationKillSwitch = false;
  }

  // 🔗 Conectar con el puente de datos reales
  private connectToRealDataBridge(): void {
    if (this.simulationKillSwitch) return;

    // Escuchar datos procesados del puente
    realDataBridge.on('processed_data', (data: ProcessedMarketData) => {
      this.updateRealMarketData(data);
    });

    // Escuchar actualizaciones de mercado
    realDataBridge.on('market_data_update', (data: ProcessedMarketData) => {
      this.updateRealMarketData(data);
    });

    console.log('🔗 SuperinteligenciaAI conectado a RealDataBridge');
  }

  // 📊 Actualizar datos REALES de mercado
  private updateRealMarketData(data: ProcessedMarketData): void {
    if (this.simulationKillSwitch) return;

    // Convertir a formato MarketData
    const marketData: MarketData = {
      symbol: data.symbol,
      price: data.price,
      volume: data.volume,
      change24h: data.change24h,
      volatility: data.volatility,
      rsi: data.rsi,
      macd: data.macd,
      ema20: data.ema20,
      ema50: data.ema50,
      support: data.support,
      resistance: data.resistance,
      marketCap: data.marketCap,
      liquidity: data.liquidity
    };

    this.realMarketData.set(data.symbol, marketData);
    
    // Generar análisis inmediato si tenemos datos suficientes
    if (this.isActive && this.realMarketData.size > 0) {
      this.performRealTimeAnalysis(data.symbol);
    }
  }

  // 🚀 Iniciar el sistema REAL perpetuo
  start(): void {
    if (this.simulationKillSwitch) {
      console.error('❌ Cannot start - simulation detected');
      return;
    }

    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🔥 SuperinteligenciaAI REAL iniciado - Solo datos reales');
    
    // Iniciar análisis técnico continuo
    this.startRealTechnicalAnalysis();
    
    // Iniciar generación de señales REALES
    this.startRealSignalGeneration();
  }

  // 🛑 Detener el sistema
  stop(): void {
    this.isActive = false;
    console.log('🛑 SuperinteligenciaAI REAL detenido');
  }

  // 📡 Suscribirse a señales en tiempo real
  onSignal(callback: (signal: AISignal) => void): void {
    this.signalCallbacks.push(callback);
  }

  // ⚡ Análisis en tiempo real de un símbolo
  private performRealTimeAnalysis(symbol: string): void {
    if (this.simulationKillSwitch || !this.isActive) return;

    const marketData = this.realMarketData.get(symbol);
    if (!marketData) return;

    // Realizar análisis técnico REAL
    const analysis = this.performDeepRealAnalysis(symbol);
    
    // Agregar al historial
    this.analysisHistory.push(analysis);
    
    // Mantener solo los últimos 100 análisis
    if (this.analysisHistory.length > 100) {
      this.analysisHistory.shift();
    }

    // Verificar si se debe generar señal
    this.evaluateSignalGeneration(symbol, marketData, analysis);
  }

  // 🔍 Análisis técnico profundo REAL
  private performDeepRealAnalysis(symbol: string): TechnicalAnalysis {
    const marketData = this.realMarketData.get(symbol);
    if (!marketData) throw new Error(`No real data for ${symbol}`);

    return {
      trendStrength: this.calculateRealTrendStrength(marketData),
      momentum: this.calculateRealMomentum(marketData),
      volatilityScore: this.calculateRealVolatilityScore(marketData),
      volumeProfile: this.analyzeRealVolumeProfile(marketData),
      supportResistance: this.analyzeRealSupportResistance(marketData),
      fibonacciLevel: this.calculateRealFibonacciRetracement(marketData),
      patternRecognition: this.recognizeRealPatterns(marketData),
      institutionalFlow: this.detectRealInstitutionalFlow(marketData)
    };
  }

  // 🎯 Generar señal de trading usando SOLO datos REALES
  private generateRealSignal(): AISignal | null {
    if (this.simulationKillSwitch || this.realMarketData.size === 0) return null;

    const availableSymbols = Array.from(this.realMarketData.keys());
    const symbol = this.selectBestRealSymbol(availableSymbols);
    const marketData = this.realMarketData.get(symbol);
    const analysis = this.performDeepRealAnalysis(symbol);
    
    if (!marketData) return null;

    const action = this.determineRealAction(analysis);
    const confidence = this.calculateRealConfidence(analysis);
    
    // Solo generar señales de alta confianza
    if (confidence < 75) return null;

    const { targetPrice, stopLoss } = this.calculateRealPriceTargets(marketData, action, analysis);
    const profitPotential = this.calculateRealProfitPotential(marketData.price, targetPrice);
    
    const signal: AISignal = {
      id: uniqueIdGenerator.generateSignalId(symbol),
      symbol,
      action,
      confidence,
      price: marketData.price,
      targetPrice,
      stopLoss,
      timeframe: this.selectOptimalRealTimeframe(analysis),
      reasoning: this.generateRealReasoning(analysis, action),
      profitPotential,
      riskLevel: this.assessRealRiskLevel(analysis),
      marketConditions: this.analyzeRealMarketConditions(),
      technicalScore: analysis.trendStrength,
      fundamentalScore: this.calculateRealFundamentalScore(symbol),
      sentimentScore: analysis.institutionalFlow,
      timestamp: new Date(),
      exchange: 'REAL_MARKET_DATA'
    };

    return signal;
  }

  // 🧮 Iniciar análisis técnico continuo REAL
  private startRealTechnicalAnalysis(): void {
    setInterval(() => {
      if (!this.isActive || this.simulationKillSwitch) return;
      
      // Analizar todos los símbolos con datos reales
      this.realMarketData.forEach((_, symbol) => {
        this.performRealTimeAnalysis(symbol);
      });
    }, 5000); // Cada 5 segundos
  }

  // 🎯 Generar señales automáticamente REALES
  private startRealSignalGeneration(): void {
    const generateSignal = () => {
      if (!this.isActive || this.simulationKillSwitch) return;
      
      try {
        const signal = this.generateRealSignal();
        
        // Solo emitir señales de alta calidad REALES
        if (signal && signal.confidence >= 75 && signal.profitPotential >= 5) {
          this.signalCallbacks.forEach(callback => callback(signal));
          console.log(`🎯 Nueva señal REAL generada: ${signal.action} ${signal.symbol} (${signal.confidence}% confianza)`);
        }
      } catch (error) {
        console.error('Error generando señal REAL:', error);
      }
      
      // Programar siguiente señal (cada 120 segundos = 2 minutos)
      const nextInterval = 120000; // Intervalo fijo de 2 minutos
      setTimeout(generateSignal, nextInterval);
    };

    // Iniciar generación de señales después de tener datos
    setTimeout(generateSignal, 10000);
  }

  // 📊 Evaluar si generar señal
  private evaluateSignalGeneration(symbol: string, marketData: MarketData, analysis: TechnicalAnalysis): void {
    // Generar señal solo si las condiciones son favorables
    const signalStrength = analysis.trendStrength + analysis.momentum + analysis.institutionalFlow;
    
    if (signalStrength > 200) { // Umbral alto para señales de calidad
      const signal = this.generateRealSignal();
      if (signal) {
        this.signalCallbacks.forEach(callback => callback(signal));
      }
    }
  }

  // ⚡ Métodos de cálculo REALES
  private calculateRealTrendStrength(data: MarketData): number {
    // Basado en EMAs reales
    const emaSpread = ((data.ema20 - data.ema50) / data.ema50) * 100;
    const rsiTrend = data.rsi > 50 ? (data.rsi - 50) * 2 : (50 - data.rsi) * -2;
    return Math.max(0, Math.min(100, 50 + emaSpread * 10 + rsiTrend));
  }

  private calculateRealMomentum(data: MarketData): number {
    // Basado en MACD real y cambio de precio
    const macdMomentum = data.macd * 50;
    const priceMomentum = data.change24h * 2;
    return Math.max(0, Math.min(100, 50 + macdMomentum + priceMomentum));
  }

  private calculateRealVolatilityScore(data: MarketData): number {
    return Math.min(100, data.volatility * 10);
  }

  private analyzeRealVolumeProfile(data: MarketData): number {
    return Math.min(100, (data.volume / 1000000000) * 100);
  }

  private analyzeRealSupportResistance(data: MarketData): number {
    const supportDistance = Math.abs(data.price - data.support) / data.price;
    const resistanceDistance = Math.abs(data.resistance - data.price) / data.price;
    return Math.min(100, (1 - Math.min(supportDistance, resistanceDistance)) * 100);
  }

  private calculateRealFibonacciRetracement(data: MarketData): number {
    // Calcular retroceso fibonacci basado en soporte/resistencia reales
    const range = data.resistance - data.support;
    const position = data.price - data.support;
    const fibLevel = (position / range) * 100;
    return Math.max(0, Math.min(100, fibLevel));
  }

  private recognizeRealPatterns(data: MarketData): string {
    // Reconocimiento basado en datos reales
    if (data.ema20 > data.ema50 && data.rsi < 70) return 'BULLISH_CONTINUATION';
    if (data.ema20 < data.ema50 && data.rsi > 30) return 'BEARISH_CONTINUATION';
    if (data.price > data.resistance * 0.99) return 'BREAKOUT_RESISTANCE';
    if (data.price < data.support * 1.01) return 'BREAKDOWN_SUPPORT';
    return 'CONSOLIDATION';
  }

  private detectRealInstitutionalFlow(data: MarketData): number {
    // Flujo institucional basado en volumen y liquidez reales
    const volumeStrength = Math.min(100, (data.volume / 100000000) * 10);
    const liquidityFlow = Math.min(100, (data.liquidity / 10000000) * 5);
    return (volumeStrength + liquidityFlow) / 2;
  }

  private selectBestRealSymbol(symbols: string[]): string {
    let bestSymbol = symbols[0];
    let bestScore = 0;

    symbols.forEach(symbol => {
      const data = this.realMarketData.get(symbol);
      if (!data) return;
      
      const analysis = this.performDeepRealAnalysis(symbol);
      const score = analysis.trendStrength + analysis.momentum + analysis.volumeProfile;
      
      if (score > bestScore) {
        bestScore = score;
        bestSymbol = symbol;
      }
    });

    return bestSymbol;
  }

  private determineRealAction(analysis: TechnicalAnalysis): 'BUY' | 'SELL' {
    const bullishScore = analysis.trendStrength + analysis.momentum + analysis.institutionalFlow;
    return bullishScore > 150 ? 'BUY' : 'SELL';
  }

  private calculateRealConfidence(analysis: TechnicalAnalysis): number {
    const baseConfidence = 70;
    const trendBonus = analysis.trendStrength / 100 * 20;
    const momentumBonus = analysis.momentum / 100 * 10;
    return Math.min(99, baseConfidence + trendBonus + momentumBonus);
  }

  private calculateRealPriceTargets(data: MarketData, action: 'BUY' | 'SELL', analysis: TechnicalAnalysis) {
    const multiplier = action === 'BUY' ? 1 : -1;
    const profitMargin = (analysis.trendStrength / 100) * 0.1 + 0.03; // 3-13%
    const riskMargin = 0.02; // 2%
    
    return {
      targetPrice: data.price * (1 + multiplier * profitMargin),
      stopLoss: data.price * (1 - multiplier * riskMargin)
    };
  }

  private calculateRealProfitPotential(currentPrice: number, targetPrice: number): number {
    return Math.abs((targetPrice - currentPrice) / currentPrice) * 100;
  }

  private generateRealReasoning(analysis: TechnicalAnalysis, action: 'BUY' | 'SELL'): string {
    // Generar reasoning basado en análisis técnico real
    let reasoning = `${action === 'BUY' ? 'Señal alcista' : 'Señal bajista'} detectada: `;
    
    // Agregar detalles basados en indicadores reales
    const details = [];
    
    if (analysis.trendStrength > 80) {
      details.push(`tendencia ${action === 'BUY' ? 'alcista' : 'bajista'} fuerte (${analysis.trendStrength}%)`);
    }
    
    if (analysis.momentum > 75) {
      details.push(`momentum ${action === 'BUY' ? 'positivo' : 'negativo'} elevado`);
    }
    
    if (analysis.patternRecognition && analysis.patternRecognition !== 'NONE') {
      details.push(`patrón ${analysis.patternRecognition} confirmado`);
    }
    
    if (analysis.institutionalFlow > 70) {
      details.push(`flujo institucional ${action === 'BUY' ? 'comprando' : 'vendiendo'}`);
    }
    
    // Si no hay detalles específicos, usar análisis general
    if (details.length === 0) {
      details.push('análisis técnico multifactor confirmado');
    }
    
    return reasoning + details.join(' + ');
  }

  private selectOptimalRealTimeframe(analysis: TechnicalAnalysis): string {
    if (analysis.trendStrength > 80) return '1h';
    if (analysis.momentum > 75) return '4h';
    return '15m';
  }

  private assessRealRiskLevel(analysis: TechnicalAnalysis): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (analysis.volatilityScore > 75) return 'HIGH';
    if (analysis.volatilityScore > 50) return 'MEDIUM';
    return 'LOW';
  }

  private analyzeRealMarketConditions(): string {
    // TODO: Implementar análisis real de condiciones de mercado basado en datos reales
    // Por ahora retornar condición basada en datos disponibles
    const marketDataAvailable = this.realMarketData.size > 0;
    
    if (!marketDataAvailable) {
      return 'Esperando datos de mercado en tiempo real';
    }
    
    // Análizar tendencia general basada en datos reales disponibles
    let bullishCount = 0;
    let totalAnalyzed = 0;
    
    for (const [symbol, data] of this.realMarketData.entries()) {
      totalAnalyzed++;
      if (data.price > data.ema20 && data.rsi < 70) {
        bullishCount++;
      }
    }
    
    const bullishRatio = totalAnalyzed > 0 ? bullishCount / totalAnalyzed : 0;
    
    if (bullishRatio > 0.7) return 'Mercado alcista confirmado con datos reales';
    if (bullishRatio > 0.3) return 'Mercado mixto con oportunidades selectivas';
    return 'Mercado bajista - mantener cautela';
  }

  private calculateRealFundamentalScore(symbol: string): number {
    // Puntuación fundamental basada en datos reales del mercado
    const data = this.realMarketData.get(symbol);
    if (!data) return 50;
    
    let score = 50;
    if (data.marketCap > 100000000000) score += 20; // Market cap alto
    if (data.volume > 1000000000) score += 15; // Volumen alto
    if (data.liquidity > 50000000) score += 15; // Liquidez alta
    
    return Math.min(100, score);
  }

  // 📊 Obtener estadísticas del sistema REAL
  getStats(): {
    isActive: boolean;
    activeSymbols: number;
    analysisCount: number;
    hasSimulation: boolean;
    dataSource: string;
  } {
    return {
      isActive: this.isActive,
      activeSymbols: this.realMarketData.size,
      analysisCount: this.analysisHistory.length,
      hasSimulation: this.simulationKillSwitch,
      dataSource: 'REAL_MARKET_DATA_ONLY'
    };
  }
}

// 🚀 Instancia global de la superinteligencia REAL
export const superinteligenciaAI = new SuperinteligenciaAI();

// 🔥 Auto-iniciar SOLO si no hay simulaciones
if (process.env.ENABLE_SIMULATION !== 'true') {
  superinteligenciaAI.start();
  console.log('🔥 SuperinteligenciaAI AUTO-INICIADO - Datos reales únicamente');
}
