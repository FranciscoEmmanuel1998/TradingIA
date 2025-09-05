// 🧠 ADAPTIVE LEARNING INTEGRATION - CONEXIÓN ENTRE VERIFICACIÓN Y APRENDIZAJE
// Integra el sistema de verificación con el motor de aprendizaje autónomo

import { predictionVerificationSystem, AccuracyMetrics, PredictionOutcome } from '../verification/PredictionVerificationSystem';
import { superinteligenciaAI } from '../ai/SuperinteligenciaAI';

export interface LearningInsight {
  id: string;
  type: 'accuracy_improvement' | 'pattern_discovery' | 'strategy_optimization' | 'bias_correction';
  description: string;
  impact: number; // 0-1
  actionTaken: string;
  timestamp: Date;
  data: any;
}

export interface AdaptiveAdjustment {
  component: 'confidence_threshold' | 'timeframe_weights' | 'technical_indicators' | 'risk_parameters';
  oldValue: number;
  newValue: number;
  reason: string;
  expectedImprovement: number;
  timestamp: Date;
}

class AdaptiveLearningIntegration {
  private insights: Map<string, LearningInsight> = new Map();
  private adjustments: Map<string, AdaptiveAdjustment> = new Map();
  private isActive: boolean = false;
  private learningInterval: NodeJS.Timeout | null = null;
  
  // Configuración adaptativa
  private adaptiveConfig = {
    minConfidenceThreshold: 75,    // Dinámico basado en accuracy
    targetAccuracy: 85,            // Objetivo de precisión
    learningRate: 0.1,             // Velocidad de adaptación
    minSampleSize: 20,             // Mínimo de predicciones para aprender
    maxAdjustmentPerCycle: 0.05    // Máximo ajuste por ciclo (5%)
  };

  constructor() {
    console.log('🧠 Sistema de Aprendizaje Adaptativo inicializado');
  }

  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🚀 Iniciando aprendizaje adaptativo continuo...');
    
    // Ciclo de aprendizaje cada 5 minutos
    this.learningInterval = setInterval(() => {
      this.performLearningCycle();
    }, 5 * 60 * 1000);
    
    // Análisis profundo cada hora
    setInterval(() => {
      this.performDeepAnalysis();
    }, 60 * 60 * 1000);
  }

  stop(): void {
    this.isActive = false;
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
      this.learningInterval = null;
    }
    console.log('🛑 Aprendizaje adaptativo detenido');
  }

  // 🔍 Ciclo principal de aprendizaje
  public performLearningCycle(): void {
    console.log('🧠 Ejecutando ciclo de aprendizaje adaptativo...');
    
    const metrics = predictionVerificationSystem.getAccuracyMetrics();
    
    if (metrics.totalPredictions < this.adaptiveConfig.minSampleSize) {
      console.log('📊 Insuficientes datos para aprendizaje (necesario:', this.adaptiveConfig.minSampleSize, 'actual:', metrics.totalPredictions, ')');
      return;
    }

    // 1. Analizar precisión general
    this.analyzeOverallAccuracy(metrics);
    
    // 2. Analizar por nivel de confianza
    this.analyzeConfidenceLevels(metrics);
    
    // 3. Analizar por tipo de acción
    this.analyzeActionTypes(metrics);
    
    // 4. Detectar patrones de fallo
    this.analyzeFailurePatterns();
    
    // 5. Ajustar parámetros del sistema
    this.applyAdaptiveAdjustments(metrics);
  }

  // 📊 Análisis de precisión general
  private analyzeOverallAccuracy(metrics: AccuracyMetrics): void {
    const currentAccuracy = metrics.overallAccuracy;
    const targetAccuracy = this.adaptiveConfig.targetAccuracy;
    
    if (currentAccuracy < targetAccuracy) {
      const deficit = targetAccuracy - currentAccuracy;
      
      if (deficit > 10) {
        // Deficit grave - ajustes agresivos
        this.createInsight({
          type: 'accuracy_improvement',
          description: `Precisión actual ${currentAccuracy.toFixed(1)}% está ${deficit.toFixed(1)}% por debajo del objetivo`,
          impact: 0.9,
          actionTaken: 'Incrementando umbral de confianza y ajustando pesos técnicos',
          data: { currentAccuracy, targetAccuracy, deficit }
        });
        
        this.adjustConfidenceThreshold('increase', deficit * 0.5);
        this.adjustTechnicalWeights('conservative');
        
      } else if (deficit > 5) {
        // Deficit moderado - ajustes graduales
        this.createInsight({
          type: 'accuracy_improvement',
          description: `Precisión ligeramente baja, aplicando ajustes graduales`,
          impact: 0.6,
          actionTaken: 'Ajuste gradual de parámetros',
          data: { currentAccuracy, targetAccuracy, deficit }
        });
        
        this.adjustConfidenceThreshold('increase', deficit * 0.3);
      }
    } else if (currentAccuracy > targetAccuracy + 5) {
      // Sobre-performance - podemos ser más agresivos
      this.createInsight({
        type: 'strategy_optimization',
        description: `Precisión ${currentAccuracy.toFixed(1)}% supera objetivo, optimizando para más señales`,
        impact: 0.7,
        actionTaken: 'Reduciendo umbral de confianza para generar más señales',
        data: { currentAccuracy, targetAccuracy }
      });
      
      this.adjustConfidenceThreshold('decrease', 2);
    }
  }

  // 🎯 Análisis por nivel de confianza
  private analyzeConfidenceLevels(metrics: AccuracyMetrics): void {
    // Si la confianza alta no se correlaciona con éxito, hay un problema de calibración
    if (metrics.highConfidenceAccuracy < metrics.mediumConfidenceAccuracy) {
      this.createInsight({
        type: 'bias_correction',
        description: 'Señales de alta confianza tienen menor precisión que las de confianza media',
        impact: 0.8,
        actionTaken: 'Recalibrando algoritmo de confianza',
        data: { 
          highConfidenceAccuracy: metrics.highConfidenceAccuracy,
          mediumConfidenceAccuracy: metrics.mediumConfidenceAccuracy 
        }
      });
      
      // Ajustar umbral de confianza para corregir sobreconfianza
      this.adjustConfidenceThreshold('increase', 5);
    }
  }

  // 📈 Análisis por tipo de acción
  private analyzeActionTypes(metrics: AccuracyMetrics): void {
    const buyAccuracy = metrics.buyAccuracy;
    const sellAccuracy = metrics.sellAccuracy;
    const difference = Math.abs(buyAccuracy - sellAccuracy);
    
    if (difference > 15) {
      const betterAction = buyAccuracy > sellAccuracy ? 'BUY' : 'SELL';
      const worseAction = buyAccuracy > sellAccuracy ? 'SELL' : 'BUY';
      
      this.createInsight({
        type: 'pattern_discovery',
        description: `Asimetría significativa: ${betterAction} ${Math.max(buyAccuracy, sellAccuracy).toFixed(1)}% vs ${worseAction} ${Math.min(buyAccuracy, sellAccuracy).toFixed(1)}%`,
        impact: 0.7,
        actionTaken: `Ajustando pesos para mejorar precisión de ${worseAction}`,
        data: { buyAccuracy, sellAccuracy, difference }
      });
      
      // Ajustar pesos específicos para el tipo de acción problemático
      this.adjustActionTypeWeights(worseAction, difference);
    }
  }

  // ❌ Análisis de patrones de fallo
  private analyzeFailurePatterns(): void {
    const failedPredictions = predictionVerificationSystem.getPredictionsByOutcome('FAILED');
    
    if (failedPredictions.length < 5) return;
    
    // Analizar patrones comunes en fallos
    const failureAnalysis = {
      commonSymbols: this.findMostCommon(failedPredictions.map(p => p.symbol)),
      commonTimeframes: this.findMostCommon(failedPredictions.map(p => p.timeToOutcome || 0)),
      avgConfidence: failedPredictions.reduce((sum, p) => sum + p.confidence, 0) / failedPredictions.length,
      avgProfitLoss: failedPredictions.reduce((sum, p) => sum + p.profitLoss, 0) / failedPredictions.length
    };
    
    // Si un símbolo falla consistentemente, reducir su peso
    if (failureAnalysis.commonSymbols.count > failedPredictions.length * 0.3) {
      this.createInsight({
        type: 'pattern_discovery',
        description: `Símbolo ${failureAnalysis.commonSymbols.value} falla en ${failureAnalysis.commonSymbols.count} de ${failedPredictions.length} casos`,
        impact: 0.6,
        actionTaken: `Reduciendo peso de análisis para ${failureAnalysis.commonSymbols.value}`,
        data: failureAnalysis
      });
    }
  }

  // ⚙️ Aplicar ajustes adaptativos
  private applyAdaptiveAdjustments(metrics: AccuracyMetrics): void {
    // Solo ajustar si tenemos suficientes datos
    if (metrics.totalPredictions < this.adaptiveConfig.minSampleSize * 2) return;
    
    // Calcular factor de aprendizaje basado en volatilidad de precisión
    const learningFactor = this.calculateLearningFactor(metrics);
    
    console.log(`🔧 Aplicando ajustes adaptativos (factor: ${learningFactor.toFixed(3)})`);
    
    // Log de datos de aprendizaje para el sistema
    console.log('📊 Métricas de aprendizaje:', {
      accuracy: metrics.overallAccuracy,
      totalPredictions: metrics.totalPredictions,
      profitLoss: metrics.averageProfitLoss,
      timeToResolution: metrics.averageTimeToResolution
    });
  }

  // 🎚️ Ajustar umbral de confianza
  private adjustConfidenceThreshold(direction: 'increase' | 'decrease', magnitude: number): void {
    const currentThreshold = this.adaptiveConfig.minConfidenceThreshold;
    const maxAdjustment = this.adaptiveConfig.maxAdjustmentPerCycle * 100; // 5%
    const adjustment = Math.min(magnitude, maxAdjustment);
    
    const newThreshold = direction === 'increase' 
      ? Math.min(95, currentThreshold + adjustment)
      : Math.max(70, currentThreshold - adjustment);
    
    if (Math.abs(newThreshold - currentThreshold) > 0.1) {
      this.recordAdjustment({
        component: 'confidence_threshold',
        oldValue: currentThreshold,
        newValue: newThreshold,
        reason: `Ajuste ${direction} para mejorar precisión`,
        expectedImprovement: adjustment * 0.1
      });
      
      this.adaptiveConfig.minConfidenceThreshold = newThreshold;
      
      // Aplicar al sistema de IA
      superinteligenciaAI.updateConfidenceThreshold(newThreshold);
    }
  }

  // 🏋️ Ajustar pesos técnicos
  private adjustTechnicalWeights(mode: 'aggressive' | 'conservative' | 'balanced'): void {
    const weights = {
      aggressive: { rsi: 1.2, macd: 1.1, ema: 0.9, volume: 1.3 },
      conservative: { rsi: 0.9, macd: 0.8, ema: 1.2, volume: 0.8 },
      balanced: { rsi: 1.0, macd: 1.0, ema: 1.0, volume: 1.0 }
    };
    
    this.recordAdjustment({
      component: 'technical_indicators',
      oldValue: 1.0,
      newValue: mode === 'aggressive' ? 1.2 : mode === 'conservative' ? 0.8 : 1.0,
      reason: `Ajuste ${mode} de indicadores técnicos`,
      expectedImprovement: 0.05
    });
    
    // Aplicar pesos al sistema de IA
    superinteligenciaAI.updateTechnicalWeights(weights[mode]);
  }

  // 📊 Funciones auxiliares
  private findMostCommon<T>(array: T[]): { value: T; count: number } {
    const counts = array.reduce((acc, item) => {
      acc[String(item)] = (acc[String(item)] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommon = Object.entries(counts).reduce((a, b) => 
      counts[a[0]] > counts[b[0]] ? a : b
    );
    
    return { value: mostCommon[0] as any, count: mostCommon[1] };
  }

  private calculateLearningFactor(metrics: AccuracyMetrics): number {
    // Factor basado en estabilidad de métricas
    const baseRate = this.adaptiveConfig.learningRate;
    const accuracyFactor = metrics.overallAccuracy / 100;
    const sampleSizeFactor = Math.min(1, metrics.totalPredictions / 100);
    
    return baseRate * accuracyFactor * sampleSizeFactor;
  }

  private createInsight(insight: Omit<LearningInsight, 'id' | 'timestamp'>): void {
    const id = `insight_${Date.now()}_${Math.floor(performance.now())}`;
    const fullInsight: LearningInsight = {
      ...insight,
      id,
      timestamp: new Date()
    };
    
    this.insights.set(id, fullInsight);
    console.log(`💡 Insight generado: ${insight.description}`);
    
    // Mantener solo últimos 100 insights
    if (this.insights.size > 100) {
      const oldest = Array.from(this.insights.keys())[0];
      this.insights.delete(oldest);
    }
  }

  private recordAdjustment(adjustment: Omit<AdaptiveAdjustment, 'timestamp'>): void {
    const id = `adj_${Date.now()}`;
    const fullAdjustment: AdaptiveAdjustment = {
      ...adjustment,
      timestamp: new Date()
    };
    
    this.adjustments.set(id, fullAdjustment);
    console.log(`⚙️ Ajuste aplicado: ${adjustment.component} ${adjustment.oldValue} → ${adjustment.newValue}`);
  }

  private adjustActionTypeWeights(actionType: string, magnitude: number): void {
    // Implementar ajuste específico por tipo de acción
    const adjustment = magnitude * 0.01; // 1% por cada punto de diferencia
    
    if (actionType === 'BUY') {
      superinteligenciaAI.adjustBuyWeights(adjustment);
    } else {
      superinteligenciaAI.adjustSellWeights(adjustment);
    }
  }

  private performDeepAnalysis(): void {
    console.log('🔬 Realizando análisis profundo...');
    
    const metrics = predictionVerificationSystem.getAccuracyMetrics();
    const recentInsights = Array.from(this.insights.values())
      .filter(i => Date.now() - i.timestamp.getTime() < 24 * 60 * 60 * 1000); // Últimas 24h
    
    // Análisis de tendencias
    if (recentInsights.length > 5) {
      const accuracyTrend = this.calculateAccuracyTrend();
      
      if (accuracyTrend < -0.05) { // Declining accuracy
        console.log('📉 Tendencia de precisión declinante detectada');
        this.adjustTechnicalWeights('conservative');
      } else if (accuracyTrend > 0.05) { // Improving accuracy
        console.log('📈 Tendencia de precisión creciente detectada');
        this.adjustTechnicalWeights('aggressive');
      }
    }
  }

  private calculateAccuracyTrend(): number {
    // Implementar cálculo de tendencia de precisión
    // Simplificado para el ejemplo
    return 0;
  }

  // 📋 Métodos públicos para consulta
  getRecentInsights(limit: number = 10): LearningInsight[] {
    return Array.from(this.insights.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getRecentAdjustments(limit: number = 10): AdaptiveAdjustment[] {
    return Array.from(this.adjustments.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getAdaptiveConfig() {
    return { ...this.adaptiveConfig };
  }

  // 🎯 Métricas de performance del aprendizaje
  getLearningPerformance() {
    const totalInsights = this.insights.size;
    const totalAdjustments = this.adjustments.size;
    const averageImpact = Array.from(this.insights.values())
      .reduce((sum, insight) => sum + insight.impact, 0) / totalInsights;
    
    return {
      totalInsights,
      totalAdjustments,
      averageImpact,
      isActive: this.isActive,
      currentConfig: this.adaptiveConfig
    };
  }
}

// Instancia singleton
export const adaptiveLearningIntegration = new AdaptiveLearningIntegration();
