// 📊 SISTEMA DE EVALUACIÓN DE ESTRATEGIAS - Juez Supremo de Performance
import { EventBus } from '../../circulation/channels/EventBus';
import { StrategyDNA } from './AutonomousLearningEngine';

export interface PerformanceMetrics {
  // Métricas básicas
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  
  // Métricas de rendimiento
  totalReturn: number;
  avgReturn: number;
  avgWinningReturn: number;
  avgLosingReturn: number;
  profitFactor: number;
  
  // Métricas de riesgo
  maxDrawdown: number;
  avgDrawdown: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  
  // Métricas avanzadas
  informationRatio: number;
  treynorRatio: number;
  jensenAlpha: number;
  beta: number;
  
  // Métricas de consistencia
  winStreak: number;
  lossStreak: number;
  reliability: number;
  consistency: number;
  
  // Métricas temporales
  timeInMarket: number;
  avgHoldingPeriod: number;
  turnoverRate: number;
  
  // Métricas adaptativas
  adaptabilityScore: number;
  learningRate: number;
  evolutionScore: number;
}

export interface StrategyEvaluation {
  strategyId: string;
  timestamp: number;
  metrics: PerformanceMetrics;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  confidence: number;
  predictedPerformance: {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
  };
}

export interface MarketConditionContext {
  trend: 'bullish' | 'bearish' | 'sideways';
  volatility: 'low' | 'medium' | 'high' | 'extreme';
  volume: 'low' | 'normal' | 'high';
  correlation: number;
  momentum: number;
  supportResistance: {
    support: number;
    resistance: number;
    proximity: 'near_support' | 'near_resistance' | 'middle' | 'breakout';
  };
}

export class StrategyEvaluationEngine {
  private eventBus: EventBus;
  private evaluationHistory: Map<string, StrategyEvaluation[]>;
  private benchmarkReturns: number[];
  private riskFreeRate: number = 0.02; // 2% anual
  private marketBeta: number = 1.0;
  
  constructor() {
    this.eventBus = EventBus.getInstance();
    this.evaluationHistory = new Map();
    this.benchmarkReturns = [];
  }

  async initialize(): Promise<void> {
    console.log('📊 StrategyEvaluationEngine: Inicializando sistema de evaluación...');
    
    // Suscribirse a eventos de trading
    this.eventBus.subscribe('execution.trade_completed', this.recordTradeResult.bind(this));
    this.eventBus.subscribe('strategy.performance_update', this.evaluateStrategy.bind(this));
    this.eventBus.subscribe('market.conditions_changed', this.updateMarketContext.bind(this));
    
    // Inicializar evaluaciones periódicas
    this.startEvaluationCycle();
    
    console.log('✅ StrategyEvaluationEngine: Sistema de evaluación activo');
  }

  private startEvaluationCycle(): void {
    // Evaluación en tiempo real cada 5 minutos
    setInterval(() => {
      this.performRealTimeEvaluation();
    }, 5 * 60 * 1000);
    
    // Evaluación profunda cada hora
    setInterval(() => {
      this.performDeepEvaluation();
    }, 60 * 60 * 1000);
    
    // Evaluación comparativa diaria
    setInterval(() => {
      this.performComparativeEvaluation();
    }, 24 * 60 * 60 * 1000);
  }

  async evaluateStrategy(
    strategy: StrategyDNA, 
    trades: any[], 
    marketContext: MarketConditionContext
  ): Promise<StrategyEvaluation> {
    
    console.log(`📈 Evaluando estrategia: ${strategy.id}`);
    
    // Calcular métricas de performance
    const metrics = this.calculatePerformanceMetrics(trades);
    
    // Asignar calificación
    const score = this.calculateOverallScore(metrics, marketContext);
    const grade = this.assignGrade(score);
    
    // Identificar fortalezas y debilidades
    const strengths = this.identifyStrengths(metrics);
    const weaknesses = this.identifyWeaknesses(metrics);
    const recommendations = this.generateRecommendations(metrics, weaknesses);
    
    // Evaluar riesgo
    const riskLevel = this.assessRiskLevel(metrics);
    
    // Calcular confianza en la evaluación
    const confidence = this.calculateEvaluationConfidence(trades.length, metrics);
    
    // Predecir performance futura
    const predictedPerformance = this.predictFuturePerformance(metrics, marketContext);
    
    const evaluation: StrategyEvaluation = {
      strategyId: strategy.id,
      timestamp: Date.now(),
      metrics,
      grade,
      score,
      strengths,
      weaknesses,
      recommendations,
      riskLevel,
      confidence,
      predictedPerformance
    };
    
    // Guardar en historial
    if (!this.evaluationHistory.has(strategy.id)) {
      this.evaluationHistory.set(strategy.id, []);
    }
    this.evaluationHistory.get(strategy.id)!.push(evaluation);
    
    // Emitir evento de evaluación completada
    this.eventBus.emit('strategy.evaluation_completed', {
      strategyId: strategy.id,
      evaluation,
      previousEvaluations: this.evaluationHistory.get(strategy.id)!.slice(-5) // Últimas 5
    });
    
    console.log(`✅ Estrategia evaluada: ${strategy.id} - Calificación: ${grade} (${score}/100)`);
    
    return evaluation;
  }

  private calculatePerformanceMetrics(trades: any[]): PerformanceMetrics {
    if (trades.length === 0) {
      return this.getEmptyMetrics();
    }
    
    const returns = trades.map(trade => trade.pnl || 0);
    const winningTrades = trades.filter(trade => (trade.pnl || 0) > 0);
    const losingTrades = trades.filter(trade => (trade.pnl || 0) < 0);
    
    // Métricas básicas
    const totalTrades = trades.length;
    const winRate = winningTrades.length / totalTrades;
    const totalReturn = returns.reduce((sum, r) => sum + r, 0);
    const avgReturn = totalReturn / totalTrades;
    
    // Métricas de riesgo
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / totalTrades;
    const volatility = Math.sqrt(variance);
    
    // Drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let currentDrawdown = 0;
    let cumulativeReturn = 0;
    
    for (const returnVal of returns) {
      cumulativeReturn += returnVal;
      if (cumulativeReturn > peak) {
        peak = cumulativeReturn;
        currentDrawdown = 0;
      } else {
        currentDrawdown = peak - cumulativeReturn;
        maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
      }
    }
    
    // Sharpe Ratio
    const excessReturn = avgReturn - (this.riskFreeRate / 365); // Diario
    const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;
    
    // Sortino Ratio (solo desviación negativa)
    const negativeReturns = returns.filter(r => r < avgReturn);
    const downwardDeviation = negativeReturns.length > 0 
      ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / negativeReturns.length)
      : volatility;
    const sortinoRatio = downwardDeviation > 0 ? excessReturn / downwardDeviation : 0;
    
    // Calmar Ratio
    const calmarRatio = maxDrawdown > 0 ? (totalReturn * 365) / maxDrawdown : 0;
    
    // Profit Factor
    const totalWins = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
    
    // Métricas de consistencia
    const winStreak = this.calculateMaxStreak(trades, true);
    const lossStreak = this.calculateMaxStreak(trades, false);
    const reliability = this.calculateReliability(returns);
    const consistency = this.calculateConsistency(returns);
    
    // Métricas temporales
    const avgHoldingPeriod = this.calculateAvgHoldingPeriod(trades);
    const timeInMarket = this.calculateTimeInMarket(trades);
    
    return {
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalReturn,
      avgReturn,
      avgWinningReturn: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
      avgLosingReturn: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
      profitFactor,
      maxDrawdown,
      avgDrawdown: maxDrawdown * 0.6, // Estimación
      volatility,
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      informationRatio: this.calculateInformationRatio(returns),
      treynorRatio: volatility > 0 ? excessReturn / this.marketBeta : 0,
      jensenAlpha: this.calculateJensenAlpha(returns),
      beta: this.marketBeta,
      winStreak,
      lossStreak,
      reliability,
      consistency,
      timeInMarket,
      avgHoldingPeriod,
      turnoverRate: this.calculateTurnoverRate(trades),
      adaptabilityScore: this.calculateAdaptabilityScore(trades),
      learningRate: this.calculateLearningRate(trades),
      evolutionScore: this.calculateEvolutionScore(trades)
    };
  }

  private calculateOverallScore(metrics: PerformanceMetrics, context: MarketConditionContext): number {
    let score = 0;
    
    // Performance (40%)
    const returnScore = Math.min(100, Math.max(0, (metrics.totalReturn + 1) * 50));
    const sharpeScore = Math.min(100, Math.max(0, (metrics.sharpeRatio + 1) * 25));
    const winRateScore = metrics.winRate * 100;
    score += (returnScore * 0.5 + sharpeScore * 0.3 + winRateScore * 0.2) * 0.4;
    
    // Risk Management (30%)
    const drawdownScore = Math.max(0, 100 - (metrics.maxDrawdown * 500));
    const volatilityScore = Math.max(0, 100 - (metrics.volatility * 1000));
    const consistencyScore = metrics.consistency * 100;
    score += (drawdownScore * 0.4 + volatilityScore * 0.3 + consistencyScore * 0.3) * 0.3;
    
    // Adaptability (20%)
    const adaptabilityScore = metrics.adaptabilityScore * 100;
    const learningScore = metrics.learningRate * 100;
    const evolutionScore = metrics.evolutionScore * 100;
    score += (adaptabilityScore * 0.4 + learningScore * 0.3 + evolutionScore * 0.3) * 0.2;
    
    // Market Context Adjustment (10%)
    const contextScore = this.evaluateMarketContextFit(metrics, context);
    score += contextScore * 0.1;
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private assignGrade(score: number): StrategyEvaluation['grade'] {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private identifyStrengths(metrics: PerformanceMetrics): string[] {
    const strengths: string[] = [];
    
    if (metrics.winRate > 0.6) strengths.push('Alta tasa de éxito');
    if (metrics.sharpeRatio > 1.5) strengths.push('Excelente ratio riesgo-retorno');
    if (metrics.maxDrawdown < 0.05) strengths.push('Bajo drawdown máximo');
    if (metrics.profitFactor > 2.0) strengths.push('Factor de ganancia superior');
    if (metrics.consistency > 0.7) strengths.push('Rendimiento consistente');
    if (metrics.adaptabilityScore > 0.8) strengths.push('Alta adaptabilidad');
    if (metrics.calmarRatio > 1.0) strengths.push('Excelente ratio Calmar');
    if (metrics.reliability > 0.8) strengths.push('Alta confiabilidad');
    if (metrics.winStreak > 5) strengths.push('Buenas rachas ganadoras');
    
    return strengths;
  }

  private identifyWeaknesses(metrics: PerformanceMetrics): string[] {
    const weaknesses: string[] = [];
    
    if (metrics.winRate < 0.4) weaknesses.push('Baja tasa de éxito');
    if (metrics.sharpeRatio < 0.5) weaknesses.push('Pobre ratio riesgo-retorno');
    if (metrics.maxDrawdown > 0.15) weaknesses.push('Drawdown excesivo');
    if (metrics.profitFactor < 1.2) weaknesses.push('Factor de ganancia insuficiente');
    if (metrics.consistency < 0.3) weaknesses.push('Rendimiento inconsistente');
    if (metrics.volatility > 0.05) weaknesses.push('Volatilidad excesiva');
    if (metrics.lossStreak > 7) weaknesses.push('Rachas perdedoras largas');
    if (metrics.adaptabilityScore < 0.3) weaknesses.push('Baja adaptabilidad');
    if (metrics.totalTrades < 10) weaknesses.push('Insuficientes datos de muestra');
    
    return weaknesses;
  }

  private generateRecommendations(metrics: PerformanceMetrics, weaknesses: string[]): string[] {
    const recommendations: string[] = [];
    
    if (weaknesses.includes('Baja tasa de éxito')) {
      recommendations.push('Ajustar criterios de entrada para mayor precisión');
    }
    if (weaknesses.includes('Drawdown excesivo')) {
      recommendations.push('Implementar stops más estrictos');
      recommendations.push('Reducir tamaño de posición');
    }
    if (weaknesses.includes('Volatilidad excesiva')) {
      recommendations.push('Diversificar entradas temporalmente');
      recommendations.push('Usar averaging down controlado');
    }
    if (weaknesses.includes('Baja adaptabilidad')) {
      recommendations.push('Incrementar tasa de mutación');
      recommendations.push('Añadir más indicadores adaptativos');
    }
    if (weaknesses.includes('Rendimiento inconsistente')) {
      recommendations.push('Implementar filtros de condiciones de mercado');
      recommendations.push('Ajustar parámetros dinámicamente');
    }
    
    return recommendations;
  }

  // Métodos auxiliares de cálculo
  private calculateMaxStreak(trades: any[], winning: boolean): number {
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (const trade of trades) {
      const isWin = (trade.pnl || 0) > 0;
      if (isWin === winning) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  }

  private calculateReliability(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const positiveReturns = returns.filter(r => r > 0).length;
    const reliability = positiveReturns / returns.length;
    
    // Ajustar por consistencia temporal
    const segments = Math.min(5, Math.floor(returns.length / 10));
    const segmentSize = Math.floor(returns.length / segments);
    
    let consistentSegments = 0;
    for (let i = 0; i < segments; i++) {
      const segmentStart = i * segmentSize;
      const segmentEnd = Math.min((i + 1) * segmentSize, returns.length);
      const segmentReturns = returns.slice(segmentStart, segmentEnd);
      const segmentPositive = segmentReturns.filter(r => r > 0).length;
      const segmentReliability = segmentPositive / segmentReturns.length;
      
      if (Math.abs(segmentReliability - reliability) < 0.2) {
        consistentSegments++;
      }
    }
    
    return reliability * (consistentSegments / segments);
  }

  private calculateConsistency(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Coeficiente de variación invertido
    const cv = stdDev / Math.abs(mean);
    return Math.max(0, 1 - cv);
  }

  private calculateInformationRatio(returns: number[]): number {
    // Comparar con benchmark (asumimos benchmark = 0 para simplicidad)
    const benchmarkReturn = 0;
    const excessReturns = returns.map(r => r - benchmarkReturn);
    const avgExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
    const trackingError = Math.sqrt(
      excessReturns.reduce((sum, r) => sum + Math.pow(r - avgExcessReturn, 2), 0) / excessReturns.length
    );
    
    return trackingError > 0 ? avgExcessReturn / trackingError : 0;
  }

  private calculateJensenAlpha(returns: number[]): number {
    // Simplified Jensen's Alpha calculation
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const riskFreeDaily = this.riskFreeRate / 365;
    const marketPremium = 0.001; // Asumimos 0.1% diario de prima de mercado
    
    return avgReturn - (riskFreeDaily + this.marketBeta * marketPremium);
  }

  private getEmptyMetrics(): PerformanceMetrics {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalReturn: 0,
      avgReturn: 0,
      avgWinningReturn: 0,
      avgLosingReturn: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      avgDrawdown: 0,
      volatility: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      informationRatio: 0,
      treynorRatio: 0,
      jensenAlpha: 0,
      beta: 1.0,
      winStreak: 0,
      lossStreak: 0,
      reliability: 0,
      consistency: 0,
      timeInMarket: 0,
      avgHoldingPeriod: 0,
      turnoverRate: 0,
      adaptabilityScore: 0,
      learningRate: 0,
      evolutionScore: 0
    };
  }

  // Métodos adicionales para completar la implementación
  private calculateAvgHoldingPeriod(trades: any[]): number {
    // Placeholder - calcular tiempo promedio de retención
    return trades.length > 0 ? 24 : 0; // 24 horas por defecto
  }

  private calculateTimeInMarket(trades: any[]): number {
    // Placeholder - calcular tiempo total en mercado
    return trades.length * 0.5; // 50% del tiempo por defecto
  }

  private calculateTurnoverRate(trades: any[]): number {
    // Placeholder - calcular tasa de rotación
    return trades.length / 30; // Trades por mes
  }

  private calculateAdaptabilityScore(trades: any[]): number {
    // Evaluar qué tan bien se adapta a diferentes condiciones
    if (trades.length < 10) return 0.5;
    
    // Analizar performance en diferentes períodos
    const segments = Math.min(5, Math.floor(trades.length / 5));
    const segmentSize = Math.floor(trades.length / segments);
    
    let consistentPerformance = 0;
    for (let i = 0; i < segments; i++) {
      const segmentStart = i * segmentSize;
      const segmentEnd = Math.min((i + 1) * segmentSize, trades.length);
      const segmentTrades = trades.slice(segmentStart, segmentEnd);
      const segmentWinRate = segmentTrades.filter(t => (t.pnl || 0) > 0).length / segmentTrades.length;
      
      if (segmentWinRate > 0.4) consistentPerformance++;
    }
    
    return consistentPerformance / segments;
  }

  private calculateLearningRate(trades: any[]): number {
    // Evaluar mejora a lo largo del tiempo
    if (trades.length < 20) return 0.5;
    
    const firstHalf = trades.slice(0, Math.floor(trades.length / 2));
    const secondHalf = trades.slice(Math.floor(trades.length / 2));
    
    const firstHalfWinRate = firstHalf.filter(t => (t.pnl || 0) > 0).length / firstHalf.length;
    const secondHalfWinRate = secondHalf.filter(t => (t.pnl || 0) > 0).length / secondHalf.length;
    
    const improvement = secondHalfWinRate - firstHalfWinRate;
    return Math.max(0, Math.min(1, 0.5 + improvement));
  }

  private calculateEvolutionScore(trades: any[]): number {
    // Evaluar capacidad de evolución y mejora
    if (trades.length < 30) return 0.5;
    
    // Analizar variabilidad controlada en estrategias
    const returns = trades.map(t => t.pnl || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    
    // Score basado en mejora progresiva
    let improvementTrend = 0;
    const windowSize = Math.min(10, Math.floor(trades.length / 3));
    
    for (let i = windowSize; i < trades.length - windowSize; i += windowSize) {
      const previousWindow = returns.slice(i - windowSize, i);
      const currentWindow = returns.slice(i, i + windowSize);
      
      const prevAvg = previousWindow.reduce((sum, r) => sum + r, 0) / previousWindow.length;
      const currAvg = currentWindow.reduce((sum, r) => sum + r, 0) / currentWindow.length;
      
      if (currAvg > prevAvg) improvementTrend++;
    }
    
    const windows = Math.floor((trades.length - windowSize) / windowSize);
    return windows > 0 ? improvementTrend / windows : 0.5;
  }

  private evaluateMarketContextFit(metrics: PerformanceMetrics, context: MarketConditionContext): number {
    let score = 50; // Base score
    
    // Ajustar por tendencia del mercado
    if (context.trend === 'bullish' && metrics.totalReturn > 0) score += 20;
    if (context.trend === 'bearish' && metrics.maxDrawdown < 0.1) score += 20;
    if (context.trend === 'sideways' && metrics.consistency > 0.6) score += 15;
    
    // Ajustar por volatilidad
    if (context.volatility === 'high' && metrics.adaptabilityScore > 0.7) score += 15;
    if (context.volatility === 'low' && metrics.winRate > 0.6) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private predictFuturePerformance(metrics: PerformanceMetrics, context: MarketConditionContext): {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
  } {
    const basePerformance = metrics.avgReturn * 7; // Semanal
    const volatilityAdjustment = metrics.volatility * (context.volatility === 'high' ? 1.5 : 1.0);
    const trendAdjustment = context.trend === 'bullish' ? 1.1 : context.trend === 'bearish' ? 0.9 : 1.0;
    
    return {
      nextWeek: basePerformance * trendAdjustment,
      nextMonth: basePerformance * 4 * trendAdjustment * (1 - volatilityAdjustment * 0.1),
      nextQuarter: basePerformance * 12 * trendAdjustment * (1 - volatilityAdjustment * 0.2)
    };
  }

  private calculateEvaluationConfidence(sampleSize: number, metrics: PerformanceMetrics): number {
    let confidence = 0.3; // Base confidence
    
    // Incrementar confianza con más datos
    confidence += Math.min(0.4, sampleSize / 100);
    
    // Incrementar confianza con mejor consistencia
    confidence += metrics.consistency * 0.2;
    
    // Incrementar confianza con menor volatilidad
    confidence += Math.max(0, (0.05 - metrics.volatility) * 2);
    
    return Math.min(1.0, confidence);
  }

  private assessRiskLevel(metrics: PerformanceMetrics): StrategyEvaluation['riskLevel'] {
    const riskScore = (
      metrics.maxDrawdown * 30 +
      metrics.volatility * 100 +
      (1 - metrics.consistency) * 20 +
      Math.max(0, metrics.lossStreak - 3) * 5
    );
    
    if (riskScore < 10) return 'Very Low';
    if (riskScore < 20) return 'Low';
    if (riskScore < 35) return 'Medium';
    if (riskScore < 50) return 'High';
    return 'Very High';
  }

  // Métodos para ciclos de evaluación
  private async performRealTimeEvaluation(): Promise<void> {
    // Evaluación rápida en tiempo real
    console.log('🔄 Realizando evaluación en tiempo real...');
    this.eventBus.emit('strategy.realtime_evaluation_started', { timestamp: Date.now() });
  }

  private async performDeepEvaluation(): Promise<void> {
    // Evaluación profunda y detallada
    console.log('🔍 Realizando evaluación profunda...');
    this.eventBus.emit('strategy.deep_evaluation_started', { timestamp: Date.now() });
  }

  private async performComparativeEvaluation(): Promise<void> {
    // Evaluación comparativa entre estrategias
    console.log('📊 Realizando evaluación comparativa...');
    this.eventBus.emit('strategy.comparative_evaluation_started', { timestamp: Date.now() });
  }

  private async recordTradeResult(tradeData: any): Promise<void> {
    // Registrar resultado de trade para evaluación
    console.log('📝 Registrando resultado de trade:', tradeData);
  }

  private async updateMarketContext(contextData: any): Promise<void> {
    // Actualizar contexto de mercado
    console.log('🌍 Actualizando contexto de mercado:', contextData);
  }

  // Interfaz pública para consultas
  getStrategyEvaluation(strategyId: string): StrategyEvaluation | null {
    const history = this.evaluationHistory.get(strategyId);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  getEvaluationHistory(strategyId: string, limit: number = 10): StrategyEvaluation[] {
    const history = this.evaluationHistory.get(strategyId) || [];
    return history.slice(-limit);
  }

  getTopStrategies(limit: number = 5): StrategyEvaluation[] {
    const allEvaluations: StrategyEvaluation[] = [];
    
    for (const [_, evaluations] of this.evaluationHistory) {
      if (evaluations.length > 0) {
        allEvaluations.push(evaluations[evaluations.length - 1]);
      }
    }
    
    return allEvaluations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getSystemPerformanceReport(): any {
    const allEvaluations: StrategyEvaluation[] = [];
    
    for (const [_, evaluations] of this.evaluationHistory) {
      allEvaluations.push(...evaluations);
    }
    
    if (allEvaluations.length === 0) {
      return { message: 'No hay evaluaciones disponibles' };
    }
    
    const avgScore = allEvaluations.reduce((sum, e) => sum + e.score, 0) / allEvaluations.length;
    const gradeDistribution = allEvaluations.reduce((dist, e) => {
      dist[e.grade] = (dist[e.grade] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);
    
    return {
      totalEvaluations: allEvaluations.length,
      averageScore: avgScore.toFixed(2),
      gradeDistribution,
      topPerformers: this.getTopStrategies(3),
      evaluationTrend: 'improving' // Placeholder
    };
  }
}
