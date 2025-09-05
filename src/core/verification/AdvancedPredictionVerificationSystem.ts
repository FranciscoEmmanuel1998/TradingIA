// 🎯 SISTEMA AVANZADO DE VERIFICACIÓN DE PREDICCIONES V2
// Auto-reconoce éxito/fallo + Métricas comprehensivas + UI completa

import { AISignal } from '../ai/SuperinteligenciaAI';

export interface PredictionOutcome {
  signalId: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  confidence: number;
  timestamp: Date;
  
  // Resultado de la predicción
  outcome: 'PENDING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';
  exitPrice?: number;
  exitTimestamp?: Date;
  profitLoss: number;
  reasonClosed: 'TARGET_HIT' | 'STOP_LOSS' | 'TIMEOUT' | 'MANUAL' | 'PENDING';
  
  // Métricas de evaluación
  timeToOutcome?: number; // minutos hasta resolución
  actualProfitPercent: number;
  expectedProfitPercent: number;
  accuracyScore: number; // 0-100
  
  // Nuevos campos para análisis avanzado
  maxDrawdown: number; // Máxima pérdida durante la posición
  maxProfit: number; // Máximo beneficio alcanzado
  volatilityDuringPosition: number;
  marketCondition: 'TRENDING_UP' | 'TRENDING_DOWN' | 'SIDEWAYS' | 'VOLATILE';
  timeOfDay: number; // hora del día (0-23)
  confidence_bracket: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ComprehensiveMetrics {
  // Estadísticas Generales
  totalPredictions: number;
  successfulPredictions: number;
  failedPredictions: number;
  pendingPredictions: number;
  partialSuccesses: number;
  
  // Precisión por categorías
  overallAccuracy: number; // %
  buyAccuracy: number; // %
  sellAccuracy: number; // %
  
  // Por nivel de confianza
  highConfidenceAccuracy: number; // >90%
  mediumConfidenceAccuracy: number; // 80-90%
  lowConfidenceAccuracy: number; // <80%
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  
  // Métricas financieras
  totalProfitLoss: number;
  averageProfitLoss: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number; // Total ganancias / Total pérdidas
  sharpeRatio: number;
  maxDrawdownPercent: number;
  
  // Métricas de tiempo
  averageTimeToResolution: number; // minutos
  fastestResolution: number; // minutos
  slowestResolution: number; // minutos
  
  // Análisis por símbolo
  symbolPerformance: Map<string, SymbolMetrics>;
  
  // Análisis temporal
  hourlyPerformance: Map<number, number>; // accuracy por hora del día
  recentTrend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  
  // Streaks
  currentWinStreak: number;
  currentLossStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
  
  // Datos para gráficos
  dailyAccuracy: Array<{ date: string; accuracy: number; trades: number }>;
  profitLossHistory: Array<{ date: string; pnl: number; cumulative: number }>;
}

export interface SymbolMetrics {
  symbol: string;
  totalTrades: number;
  successRate: number;
  totalPnL: number;
  averagePnL: number;
  averageTime: number;
  bestTrade: number;
  worstTrade: number;
}

export interface UserFriendlyReport {
  // Resumen ejecutivo
  summary: {
    status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
    message: string;
    recommendation: string;
  };
  
  // Métricas principales para el usuario
  keyMetrics: {
    precision: string; // "95.5%"
    totalPredictions: number;
    pending: number;
    avgPnL: string; // "+12.92%"
    bestTrade: string; // "+13.00%"
    avgTime: string; // "15m"
    fastestTime: string; // "2m"
  };
  
  // Análisis detallado
  breakdown: {
    byAction: { buy: number; sell: number };
    byConfidence: { high: number; medium: number; low: number };
    recentTrades: PredictionOutcome[];
  };
  
  // Alertas y recomendaciones
  alerts: string[];
  insights: string[];
}

class AdvancedPredictionVerificationSystem {
  private predictions: Map<string, PredictionOutcome> = new Map();
  private currentPrices: Map<string, number> = new Map();
  private priceHistory: Map<string, Array<{ price: number; timestamp: number }>> = new Map();
  private isActive: boolean = false;
  
  // Configuración de timeouts y umbrales
  private readonly TIMEOUT_MINUTES = 240; // 4 horas
  private readonly PARTIAL_SUCCESS_THRESHOLD = 0.5; // 50% del target alcanzado
  private readonly HIGH_CONFIDENCE_THRESHOLD = 90;
  private readonly MEDIUM_CONFIDENCE_THRESHOLD = 80;

  constructor() {
    console.log('🎯 Sistema Avanzado de Verificación inicializado');
    this.isActive = true;
    
    // Auto-verificación cada minuto
    setInterval(() => this.autoVerifyPredictions(), 60000);
  }

  /**
   * 📊 Registrar nueva predicción del AI
   */
  registerPrediction(signal: AISignal): string {
    const outcome: PredictionOutcome = {
      signalId: signal.id,
      symbol: signal.symbol,
      action: signal.action,
      entryPrice: signal.price, // Usar signal.price como entryPrice
      targetPrice: signal.targetPrice,
      stopLoss: signal.stopLoss,
      confidence: signal.confidence,
      timestamp: new Date(),
      
      outcome: 'PENDING',
      profitLoss: 0,
      reasonClosed: 'PENDING',
      actualProfitPercent: 0,
      expectedProfitPercent: this.calculateExpectedProfit(signal),
      accuracyScore: 0,
      
      // Nuevos campos
      maxDrawdown: 0,
      maxProfit: 0,
      volatilityDuringPosition: 0,
      marketCondition: this.detectMarketCondition(signal.symbol),
      timeOfDay: new Date().getHours(),
      confidence_bracket: this.getConfidenceBracket(signal.confidence)
    };

    this.predictions.set(signal.id, outcome);
    console.log(`🎯 Predicción registrada: ${signal.symbol} ${signal.action} @${signal.price} (${signal.confidence}%)`);
    
    return signal.id;
  }

  /**
   * 📈 Actualizar precio actual para verificación automática
   */
  updatePrice(symbol: string, currentPrice: number): void {
    this.currentPrices.set(symbol, currentPrice);
    
    // Actualizar historial de precios
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, []);
    }
    
    const history = this.priceHistory.get(symbol)!;
    history.push({ price: currentPrice, timestamp: Date.now() });
    
    // Mantener solo últimas 500 entradas
    if (history.length > 500) {
      history.shift();
    }
    
    // Verificar predicciones pendientes para este símbolo
    this.checkPendingPredictions(symbol, currentPrice);
  }

  /**
   * 🔍 Auto-verificación de predicciones pendientes
   */
  private autoVerifyPredictions(): void {
    for (const [id, prediction] of this.predictions) {
      if (prediction.outcome === 'PENDING') {
        const currentPrice = this.currentPrices.get(prediction.symbol);
        if (currentPrice) {
          this.evaluatePrediction(prediction, currentPrice);
        }
        
        // Timeout check
        const timeElapsed = Date.now() - prediction.timestamp.getTime();
        if (timeElapsed > this.TIMEOUT_MINUTES * 60 * 1000) {
          this.closePredictionByTimeout(prediction);
        }
      }
    }
  }

  /**
   * 🎯 Verificar predicciones pendientes para un símbolo específico
   */
  private checkPendingPredictions(symbol: string, currentPrice: number): void {
    for (const [id, prediction] of this.predictions) {
      if (prediction.symbol === symbol && prediction.outcome === 'PENDING') {
        this.evaluatePrediction(prediction, currentPrice);
      }
    }
  }

  /**
   * ⚖️ Evaluar si una predicción fue exitosa
   */
  private evaluatePrediction(prediction: PredictionOutcome, currentPrice: number): void {
    const entryPrice = prediction.entryPrice;
    const targetPrice = prediction.targetPrice;
    const stopLoss = prediction.stopLoss;
    
    // Actualizar max profit y drawdown
    this.updatePositionMetrics(prediction, currentPrice);
    
    let shouldClose = false;
    let outcome: 'SUCCESS' | 'FAILED' | 'PARTIAL' = 'FAILED';
    let reasonClosed: PredictionOutcome['reasonClosed'] = 'PENDING';

    if (prediction.action === 'BUY') {
      // Para señales de compra
      if (currentPrice >= targetPrice) {
        outcome = 'SUCCESS';
        reasonClosed = 'TARGET_HIT';
        shouldClose = true;
      } else if (currentPrice <= stopLoss) {
        outcome = 'FAILED';
        reasonClosed = 'STOP_LOSS';
        shouldClose = true;
      } else {
        // Verificar éxito parcial
        const progressToTarget = (currentPrice - entryPrice) / (targetPrice - entryPrice);
        if (progressToTarget >= this.PARTIAL_SUCCESS_THRESHOLD) {
          prediction.accuracyScore = progressToTarget * 100;
        }
      }
    } else { // SELL
      // Para señales de venta
      if (currentPrice <= targetPrice) {
        outcome = 'SUCCESS';
        reasonClosed = 'TARGET_HIT';
        shouldClose = true;
      } else if (currentPrice >= stopLoss) {
        outcome = 'FAILED';
        reasonClosed = 'STOP_LOSS';
        shouldClose = true;
      } else {
        // Verificar éxito parcial
        const progressToTarget = (entryPrice - currentPrice) / (entryPrice - targetPrice);
        if (progressToTarget >= this.PARTIAL_SUCCESS_THRESHOLD) {
          prediction.accuracyScore = progressToTarget * 100;
        }
      }
    }

    if (shouldClose) {
      this.closePrediction(prediction, currentPrice, outcome, reasonClosed);
    }
  }

  /**
   * 📊 Actualizar métricas de posición (max profit, drawdown)
   */
  private updatePositionMetrics(prediction: PredictionOutcome, currentPrice: number): void {
    const profitPercent = this.calculateProfitPercent(prediction, currentPrice);
    
    // Actualizar max profit
    if (profitPercent > prediction.maxProfit) {
      prediction.maxProfit = profitPercent;
    }
    
    // Actualizar max drawdown
    if (profitPercent < prediction.maxDrawdown) {
      prediction.maxDrawdown = profitPercent;
    }
    
    // Actualizar profit/loss actual
    prediction.actualProfitPercent = profitPercent;
  }

  /**
   * 🔒 Cerrar predicción con resultado
   */
  private closePrediction(
    prediction: PredictionOutcome, 
    exitPrice: number, 
    outcome: 'SUCCESS' | 'FAILED' | 'PARTIAL',
    reason: PredictionOutcome['reasonClosed']
  ): void {
    prediction.outcome = outcome;
    prediction.exitPrice = exitPrice;
    prediction.exitTimestamp = new Date();
    prediction.reasonClosed = reason;
    prediction.timeToOutcome = (Date.now() - prediction.timestamp.getTime()) / (1000 * 60);
    
    // Calcular profit/loss final
    prediction.profitLoss = this.calculateProfitLoss(prediction, exitPrice);
    prediction.actualProfitPercent = this.calculateProfitPercent(prediction, exitPrice);
    
    // Calcular accuracy score
    if (outcome === 'SUCCESS') {
      prediction.accuracyScore = 100;
    } else if (outcome === 'PARTIAL') {
      prediction.accuracyScore = Math.max(50, prediction.accuracyScore);
    } else {
      prediction.accuracyScore = 0;
    }
    
    // Calcular volatilidad durante la posición
    prediction.volatilityDuringPosition = this.calculateVolatilityDuringPosition(prediction);
    
    console.log(`🎯 Predicción cerrada: ${prediction.symbol} ${outcome} - P&L: ${prediction.actualProfitPercent.toFixed(2)}% en ${prediction.timeToOutcome?.toFixed(0)}m`);
  }

  /**
   * ⏰ Cerrar predicción por timeout
   */
  private closePredictionByTimeout(prediction: PredictionOutcome): void {
    const currentPrice = this.currentPrices.get(prediction.symbol);
    if (!currentPrice) return;
    
    // Determinar si fue éxito parcial
    const progressToTarget = this.calculateProgressToTarget(prediction, currentPrice);
    const outcome = progressToTarget >= this.PARTIAL_SUCCESS_THRESHOLD ? 'PARTIAL' : 'FAILED';
    
    this.closePrediction(prediction, currentPrice, outcome, 'TIMEOUT');
  }

  /**
   * 📊 Calcular progreso hacia el target
   */
  private calculateProgressToTarget(prediction: PredictionOutcome, currentPrice: number): number {
    if (prediction.action === 'BUY') {
      return (currentPrice - prediction.entryPrice) / (prediction.targetPrice - prediction.entryPrice);
    } else {
      return (prediction.entryPrice - currentPrice) / (prediction.entryPrice - prediction.targetPrice);
    }
  }

  /**
   * 💰 Calcular profit/loss en dinero
   */
  private calculateProfitLoss(prediction: PredictionOutcome, exitPrice: number): number {
    // Asumiendo $1000 por operación para el cálculo
    const positionSize = 1000;
    
    if (prediction.action === 'BUY') {
      return (exitPrice - prediction.entryPrice) / prediction.entryPrice * positionSize;
    } else {
      return (prediction.entryPrice - exitPrice) / prediction.entryPrice * positionSize;
    }
  }

  /**
   * 📈 Calcular profit/loss en porcentaje
   */
  private calculateProfitPercent(prediction: PredictionOutcome, currentPrice: number): number {
    if (prediction.action === 'BUY') {
      return ((currentPrice - prediction.entryPrice) / prediction.entryPrice) * 100;
    } else {
      return ((prediction.entryPrice - currentPrice) / prediction.entryPrice) * 100;
    }
  }

  /**
   * 🎯 Calcular profit esperado
   */
  private calculateExpectedProfit(signal: AISignal): number {
    if (signal.action === 'BUY') {
      return ((signal.targetPrice - signal.price) / signal.price) * 100;
    } else {
      return ((signal.price - signal.targetPrice) / signal.price) * 100;
    }
  }

  /**
   * 📊 Detectar condición del mercado
   */
  private detectMarketCondition(symbol: string): PredictionOutcome['marketCondition'] {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length < 10) return 'SIDEWAYS';
    
    const recent = history.slice(-10);
    const prices = recent.map(h => h.price);
    const first = prices[0];
    const last = prices[prices.length - 1];
    const change = (last - first) / first;
    
    // Calcular volatilidad
    const avg = prices.reduce((a, b) => a + b) / prices.length;
    const variance = prices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance) / avg;
    
    if (volatility > 0.02) return 'VOLATILE';
    if (change > 0.005) return 'TRENDING_UP';
    if (change < -0.005) return 'TRENDING_DOWN';
    return 'SIDEWAYS';
  }

  /**
   * 🎚️ Obtener bracket de confianza
   */
  private getConfidenceBracket(confidence: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (confidence >= this.HIGH_CONFIDENCE_THRESHOLD) return 'HIGH';
    if (confidence >= this.MEDIUM_CONFIDENCE_THRESHOLD) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * 📊 Calcular volatilidad durante la posición
   */
  private calculateVolatilityDuringPosition(prediction: PredictionOutcome): number {
    const history = this.priceHistory.get(prediction.symbol);
    if (!history) return 0;
    
    const startTime = prediction.timestamp.getTime();
    const endTime = prediction.exitTimestamp?.getTime() || Date.now();
    
    const positionPrices = history
      .filter(h => h.timestamp >= startTime && h.timestamp <= endTime)
      .map(h => h.price);
    
    if (positionPrices.length < 2) return 0;
    
    const avg = positionPrices.reduce((a, b) => a + b) / positionPrices.length;
    const variance = positionPrices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / positionPrices.length;
    return Math.sqrt(variance) / avg;
  }

  /**
   * 📈 Obtener métricas comprehensivas
   */
  getComprehensiveMetrics(): ComprehensiveMetrics {
    const allPredictions = Array.from(this.predictions.values());
    const completedPredictions = allPredictions.filter(p => p.outcome !== 'PENDING');
    const successfulPredictions = completedPredictions.filter(p => p.outcome === 'SUCCESS');
    const failedPredictions = completedPredictions.filter(p => p.outcome === 'FAILED');
    const partialPredictions = completedPredictions.filter(p => p.outcome === 'PARTIAL');
    
    // Métricas por confianza
    const highConfidencePredictions = completedPredictions.filter(p => p.confidence_bracket === 'HIGH');
    const mediumConfidencePredictions = completedPredictions.filter(p => p.confidence_bracket === 'MEDIUM');
    const lowConfidencePredictions = completedPredictions.filter(p => p.confidence_bracket === 'LOW');
    
    // Métricas financieras
    const profitLosses = completedPredictions.map(p => p.actualProfitPercent);
    const totalPnL = profitLosses.reduce((sum, pnl) => sum + pnl, 0);
    const wins = profitLosses.filter(pnl => pnl > 0);
    const losses = profitLosses.filter(pnl => pnl < 0);
    
    // Métricas de tiempo
    const times = completedPredictions.map(p => p.timeToOutcome || 0);
    
    // Análisis por símbolo
    const symbolPerformance = new Map<string, SymbolMetrics>();
    const symbolData = new Map<string, PredictionOutcome[]>();
    
    completedPredictions.forEach(p => {
      if (!symbolData.has(p.symbol)) {
        symbolData.set(p.symbol, []);
      }
      symbolData.get(p.symbol)!.push(p);
    });
    
    symbolData.forEach((predictions, symbol) => {
      const successCount = predictions.filter(p => p.outcome === 'SUCCESS').length;
      const pnls = predictions.map(p => p.actualProfitPercent);
      
      symbolPerformance.set(symbol, {
        symbol,
        totalTrades: predictions.length,
        successRate: (successCount / predictions.length) * 100,
  totalPnL: pnls.length > 0 ? pnls.reduce((sum, pnl) => sum + pnl, 0) : 0,
  averagePnL: pnls.length > 0 ? pnls.reduce((sum, pnl) => sum + pnl, 0) / pnls.length : 0,
        averageTime: predictions.reduce((sum, p) => sum + (p.timeToOutcome || 0), 0) / predictions.length,
  bestTrade: pnls.length > 0 ? Math.max(...pnls) : 0,
  worstTrade: pnls.length > 0 ? Math.min(...pnls) : 0
      });
    });

    return {
      totalPredictions: allPredictions.length,
      successfulPredictions: successfulPredictions.length,
      failedPredictions: failedPredictions.length,
      pendingPredictions: allPredictions.filter(p => p.outcome === 'PENDING').length,
      partialSuccesses: partialPredictions.length,
      
      overallAccuracy: completedPredictions.length > 0 ? (successfulPredictions.length / completedPredictions.length) * 100 : 0,
      buyAccuracy: this.calculateAccuracyByAction(completedPredictions, 'BUY'),
      sellAccuracy: this.calculateAccuracyByAction(completedPredictions, 'SELL'),
      
      highConfidenceAccuracy: highConfidencePredictions.length > 0 ? (highConfidencePredictions.filter(p => p.outcome === 'SUCCESS').length / highConfidencePredictions.length) * 100 : 0,
      mediumConfidenceAccuracy: mediumConfidencePredictions.length > 0 ? (mediumConfidencePredictions.filter(p => p.outcome === 'SUCCESS').length / mediumConfidencePredictions.length) * 100 : 0,
      lowConfidenceAccuracy: lowConfidencePredictions.length > 0 ? (lowConfidencePredictions.filter(p => p.outcome === 'SUCCESS').length / lowConfidencePredictions.length) * 100 : 0,
      highConfidenceCount: highConfidencePredictions.length,
      mediumConfidenceCount: mediumConfidencePredictions.length,
      lowConfidenceCount: lowConfidencePredictions.length,
      
      totalProfitLoss: totalPnL,
      averageProfitLoss: profitLosses.length > 0 ? totalPnL / profitLosses.length : 0,
      bestTrade: profitLosses.length > 0 ? Math.max(...profitLosses) : 0,
      worstTrade: profitLosses.length > 0 ? Math.min(...profitLosses) : 0,
      profitFactor: losses.reduce((sum, loss) => sum + Math.abs(loss), 0) > 0 ? 
        wins.reduce((sum, win) => sum + win, 0) / losses.reduce((sum, loss) => sum + Math.abs(loss), 0) : 0,
      sharpeRatio: this.calculateSharpeRatio(profitLosses),
      maxDrawdownPercent: Math.min(...profitLosses.concat([0])),
      
      averageTimeToResolution: times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0,
      fastestResolution: times.length > 0 ? Math.min(...times) : 0,
      slowestResolution: times.length > 0 ? Math.max(...times) : 0,
      
      symbolPerformance,
      
      hourlyPerformance: this.calculateHourlyPerformance(completedPredictions),
      recentTrend: this.calculateRecentTrend(completedPredictions),
      
      currentWinStreak: this.calculateCurrentStreak(allPredictions, 'WIN'),
      currentLossStreak: this.calculateCurrentStreak(allPredictions, 'LOSS'),
      longestWinStreak: this.calculateLongestStreak(completedPredictions, 'WIN'),
      longestLossStreak: this.calculateLongestStreak(completedPredictions, 'LOSS'),
      
  dailyAccuracy: this.calculateDailyAccuracy(completedPredictions),
  profitLossHistory: this.calculateProfitLossHistory(completedPredictions),
  // Timestamp para UI
  lastUpdated: new Date()
    };
  }

  /**
   * 👤 Generar reporte user-friendly
   */
  getUserFriendlyReport(): UserFriendlyReport {
    const metrics = this.getComprehensiveMetrics();
    
    // Determinar status general
    let status: UserFriendlyReport['summary']['status'] = 'AVERAGE';
    let message = '';
    let recommendation = '';
    
    if (metrics.overallAccuracy >= 85) {
      status = 'EXCELLENT';
      message = '¡Excelente rendimiento! Tu AI está funcionando muy bien.';
      recommendation = 'Continúa con la estrategia actual.';
    } else if (metrics.overallAccuracy >= 70) {
      status = 'GOOD';
      message = 'Buen rendimiento general con margen de mejora.';
      recommendation = 'Considera ajustar parámetros de confianza.';
    } else if (metrics.overallAccuracy >= 50) {
      status = 'AVERAGE';
      message = 'Rendimiento promedio. Hay oportunidades de optimización.';
      recommendation = 'Revisa las señales de baja confianza.';
    } else {
      status = 'POOR';
      message = 'El sistema necesita ajustes importantes.';
      recommendation = 'Considera revisar la configuración de la IA.';
    }
    
    // Generar alertas
    const alerts: string[] = [];
    if (metrics.currentLossStreak >= 3) {
      alerts.push(`⚠️ Racha de ${metrics.currentLossStreak} pérdidas consecutivas`);
    }
    if (metrics.averageProfitLoss < -5) {
      alerts.push('📉 P&L promedio negativo');
    }
    if (metrics.pendingPredictions > 10) {
      alerts.push(`⏳ ${metrics.pendingPredictions} predicciones pendientes`);
    }
    
    // Generar insights
    const insights: string[] = [];
    if (metrics.highConfidenceAccuracy > metrics.lowConfidenceAccuracy + 20) {
      insights.push('🎯 Las señales de alta confianza son significativamente mejores');
    }
    if (metrics.buyAccuracy > metrics.sellAccuracy + 10) {
      insights.push('📈 Mejor rendimiento en señales de compra');
    } else if (metrics.sellAccuracy > metrics.buyAccuracy + 10) {
      insights.push('📉 Mejor rendimiento en señales de venta');
    }
    
    // Obtener trades recientes
    const allPredictions = Array.from(this.predictions.values());
    const recentTrades = allPredictions
      .filter(p => p.outcome !== 'PENDING')
      .sort((a, b) => (b.exitTimestamp?.getTime() || 0) - (a.exitTimestamp?.getTime() || 0))
      .slice(0, 5);

    return {
      summary: { status, message, recommendation },
      keyMetrics: {
        precision: `${metrics.overallAccuracy.toFixed(1)}%`,
        totalPredictions: metrics.totalPredictions,
        pending: metrics.pendingPredictions,
        avgPnL: `${metrics.averageProfitLoss >= 0 ? '+' : ''}${metrics.averageProfitLoss.toFixed(2)}%`,
        bestTrade: `${metrics.bestTrade >= 0 ? '+' : ''}${metrics.bestTrade.toFixed(2)}%`,
        avgTime: `${Math.round(metrics.averageTimeToResolution)}m`,
        fastestTime: `${Math.round(metrics.fastestResolution)}m`
      },
      breakdown: {
        byAction: { 
          buy: Math.round(metrics.buyAccuracy), 
          sell: Math.round(metrics.sellAccuracy) 
        },
        byConfidence: { 
          high: Math.round(metrics.highConfidenceAccuracy), 
          medium: Math.round(metrics.mediumConfidenceAccuracy), 
          low: Math.round(metrics.lowConfidenceAccuracy) 
        },
        recentTrades
      },
      alerts,
      insights
    };
  }

  // Métodos auxiliares privados
  private calculateAccuracyByAction(predictions: PredictionOutcome[], action: 'BUY' | 'SELL'): number {
    const filtered = predictions.filter(p => p.action === action);
    if (filtered.length === 0) return 0;
    return (filtered.filter(p => p.outcome === 'SUCCESS').length / filtered.length) * 100;
  }

  private calculateSharpeRatio(returns: number[]): number {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    return stdDev > 0 ? mean / stdDev : 0;
  }

  private calculateHourlyPerformance(predictions: PredictionOutcome[]): Map<number, number> {
    const hourlyData = new Map<number, { total: number; success: number }>();
    
    predictions.forEach(p => {
      const hour = p.timeOfDay;
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { total: 0, success: 0 });
      }
      const data = hourlyData.get(hour)!;
      data.total++;
      if (p.outcome === 'SUCCESS') data.success++;
    });
    
    const result = new Map<number, number>();
    hourlyData.forEach((data, hour) => {
      result.set(hour, (data.success / data.total) * 100);
    });
    
    return result;
  }

  private calculateRecentTrend(predictions: PredictionOutcome[]): 'IMPROVING' | 'DECLINING' | 'STABLE' {
    if (predictions.length < 10) return 'STABLE';
    
    const recent = predictions.slice(-10);
    const older = predictions.slice(-20, -10);
    
    const recentAccuracy = (recent.filter(p => p.outcome === 'SUCCESS').length / recent.length) * 100;
    const olderAccuracy = older.length > 0 ? (older.filter(p => p.outcome === 'SUCCESS').length / older.length) * 100 : recentAccuracy;
    
    const diff = recentAccuracy - olderAccuracy;
    
    if (diff > 10) return 'IMPROVING';
    if (diff < -10) return 'DECLINING';
    return 'STABLE';
  }

  private calculateCurrentStreak(predictions: PredictionOutcome[], type: 'WIN' | 'LOSS'): number {
    const completed = predictions.filter(p => p.outcome !== 'PENDING');
    if (completed.length === 0) return 0;
    
    // Ordenar por timestamp descendente
    const sorted = completed.sort((a, b) => (b.exitTimestamp?.getTime() || 0) - (a.exitTimestamp?.getTime() || 0));
    
    let streak = 0;
    for (const prediction of sorted) {
      const isWin = prediction.outcome === 'SUCCESS';
      if ((type === 'WIN' && isWin) || (type === 'LOSS' && !isWin)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private calculateLongestStreak(predictions: PredictionOutcome[], type: 'WIN' | 'LOSS'): number {
    let maxStreak = 0;
    let currentStreak = 0;
    
    predictions.forEach(prediction => {
      const isWin = prediction.outcome === 'SUCCESS';
      if ((type === 'WIN' && isWin) || (type === 'LOSS' && !isWin)) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return maxStreak;
  }

  private calculateDailyAccuracy(predictions: PredictionOutcome[]): Array<{ date: string; accuracy: number; trades: number }> {
    const dailyData = new Map<string, { total: number; success: number }>();
    
    predictions.forEach(p => {
      const date = p.timestamp.toISOString().split('T')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, { total: 0, success: 0 });
      }
      const data = dailyData.get(date)!;
      data.total++;
      if (p.outcome === 'SUCCESS') data.success++;
    });
    
    return Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      accuracy: (data.success / data.total) * 100,
      trades: data.total
    }));
  }

  private calculateProfitLossHistory(predictions: PredictionOutcome[]): Array<{ date: string; pnl: number; cumulative: number }> {
    const sorted = predictions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    let cumulative = 0;
    
    return sorted.map(p => {
      cumulative += p.actualProfitPercent;
      return {
        date: p.timestamp.toISOString().split('T')[0],
        pnl: p.actualProfitPercent,
        cumulative
      };
    });
  }

  /**
   * 🏁 Obtener todas las predicciones
   */
  getAllPredictions(): PredictionOutcome[] {
    return Array.from(this.predictions.values());
  }

  /**
   * 🔍 Obtener predicción por ID
   */
  getPrediction(id: string): PredictionOutcome | undefined {
    return this.predictions.get(id);
  }

  /**
   * 🧹 Limpiar predicciones antiguas
   */
  cleanOldPredictions(daysOld: number = 30): void {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    for (const [id, prediction] of this.predictions) {
      if (prediction.timestamp < cutoffDate && prediction.outcome !== 'PENDING') {
        this.predictions.delete(id);
      }
    }
    
    console.log(`🧹 Predicciones antiguas limpiadas (>${daysOld} días)`);
  }

  /**
   * 📊 Estado del sistema
   */
  getSystemStatus(): { active: boolean; predictions: number; pending: number } {
    return {
      active: this.isActive,
      predictions: this.predictions.size,
      pending: Array.from(this.predictions.values()).filter(p => p.outcome === 'PENDING').length
    };
  }
}

// Singleton export
export const advancedPredictionVerificationSystem = new AdvancedPredictionVerificationSystem();
