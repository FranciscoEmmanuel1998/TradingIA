// 🎯 SISTEMA DE VERIFICACIÓN DE PREDICCIONES
// Rastrea si las señales de trading fueron acertadas o fallidas

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
}

export interface AccuracyMetrics {
  totalPredictions: number;
  successfulPredictions: number;
  failedPredictions: number;
  pendingPredictions: number;
  
  // Tasas de éxito
  overallAccuracy: number; // %
  buyAccuracy: number; // %
  sellAccuracy: number; // %
  
  // Por nivel de confianza
  highConfidenceAccuracy: number; // >90%
  mediumConfidenceAccuracy: number; // 80-90%
  lowConfidenceAccuracy: number; // <80%
  
  // Métricas financieras
  totalProfitLoss: number;
  averageProfitLoss: number;
  bestTrade: number;
  worstTrade: number;
  
  // Métricas temporales
  averageTimeToResolution: number; // minutos
  quickestResolution: number;
  slowestResolution: number;
  
  lastUpdated: Date;
}

class PredictionVerificationSystem {
  private predictions: Map<string, PredictionOutcome> = new Map();
  private priceHistory: Map<string, Array<{price: number, timestamp: Date}>> = new Map();
  private verificationInterval: NodeJS.Timeout | null = null;
  private isActive: boolean = false;
  
  // Configuración
  private readonly TIMEOUT_MINUTES = 240; // 4 horas para considerar timeout
  private readonly MIN_PROFIT_THRESHOLD = 0.5; // 0.5% mínimo para considerar éxito
  
  constructor() {
    console.log('🎯 Sistema de Verificación de Predicciones inicializado');
  }
  
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🚀 Iniciando verificación continua de predicciones...');
    
    // Verificar predicciones cada 30 segundos
    this.verificationInterval = setInterval(() => {
      this.verifyPendingPredictions();
    }, 30000);
  }
  
  stop(): void {
    this.isActive = false;
    if (this.verificationInterval) {
      clearInterval(this.verificationInterval);
      this.verificationInterval = null;
    }
    console.log('🔌 Sistema de verificación detenido');
  }
  
  // Agregar una nueva predicción para rastrear
  addPrediction(signal: AISignal): void {
    const prediction: PredictionOutcome = {
      signalId: signal.id,
      symbol: signal.symbol,
      action: signal.action,
      entryPrice: signal.price,
      targetPrice: signal.targetPrice,
      stopLoss: signal.stopLoss,
      confidence: signal.confidence,
      timestamp: signal.timestamp,
      
      outcome: 'PENDING',
      profitLoss: 0,
      reasonClosed: 'PENDING',
      actualProfitPercent: 0,
      expectedProfitPercent: signal.profitPotential,
      accuracyScore: 0
    };
    
    this.predictions.set(signal.id, prediction);
    console.log(`📊 Rastreando predicción: ${signal.action} ${signal.symbol} @ $${signal.price} (${signal.confidence}% confianza)`);
  }
  
  // Actualizar precio actual para verificación
  updatePrice(symbol: string, price: number): void {
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, []);
    }
    
    const history = this.priceHistory.get(symbol)!;
    history.push({ price, timestamp: new Date() });
    
    // Mantener solo últimas 1000 entradas (aprox 8 horas a 30s/entrada)
    if (history.length > 1000) {
      history.shift();
    }

    // ⚡ Verificación inmediata para este símbolo (reduce latencia de métricas)
    const now = new Date();
    for (const [signalId, prediction] of this.predictions.entries()) {
      if (prediction.symbol === symbol && prediction.outcome === 'PENDING') {
        const timeElapsed = (now.getTime() - prediction.timestamp.getTime()) / (1000 * 60); // minutos
        const result = this.evaluatePrediction(prediction, price, timeElapsed);
        if (result.outcome && result.outcome !== 'PENDING') {
          this.updatePredictionOutcome(signalId, result);
        }
      }
    }
  }
  
  // Verificar predicciones pendientes
  private verifyPendingPredictions(): void {
    const now = new Date();
    
    for (const [signalId, prediction] of this.predictions.entries()) {
      if (prediction.outcome !== 'PENDING') continue;
      
      const currentPrice = this.getCurrentPrice(prediction.symbol);
      if (!currentPrice) continue;
      
      const timeElapsed = (now.getTime() - prediction.timestamp.getTime()) / (1000 * 60); // minutos
      
      // Verificar si se alcanzó el objetivo o stop loss
      const result = this.evaluatePrediction(prediction, currentPrice, timeElapsed);
      
      if (result.outcome !== 'PENDING') {
        this.updatePredictionOutcome(signalId, result);
      }
    }
  }
  
  private getCurrentPrice(symbol: string): number | null {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length === 0) return null;
    
    return history[history.length - 1].price;
  }
  
  private evaluatePrediction(prediction: PredictionOutcome, currentPrice: number, timeElapsed: number): Partial<PredictionOutcome> {
    const { action, entryPrice, targetPrice, stopLoss } = prediction;
    
    // Calcular profit/loss actual
    let profitLoss: number;
    if (action === 'BUY') {
      profitLoss = ((currentPrice - entryPrice) / entryPrice) * 100;
    } else {
      profitLoss = ((entryPrice - currentPrice) / entryPrice) * 100;
    }
    
    // Verificar condiciones de cierre
    if (action === 'BUY') {
      // Para BUY: precio debe subir
      if (currentPrice >= targetPrice) {
        return {
          outcome: 'SUCCESS',
          exitPrice: currentPrice,
          exitTimestamp: new Date(),
          profitLoss: ((targetPrice - entryPrice) / entryPrice) * 100,
          reasonClosed: 'TARGET_HIT',
          timeToOutcome: timeElapsed,
          actualProfitPercent: profitLoss,
          accuracyScore: 100
        };
      } else if (currentPrice <= stopLoss) {
        return {
          outcome: 'FAILED',
          exitPrice: currentPrice,
          exitTimestamp: new Date(),
          profitLoss: ((stopLoss - entryPrice) / entryPrice) * 100,
          reasonClosed: 'STOP_LOSS',
          timeToOutcome: timeElapsed,
          actualProfitPercent: profitLoss,
          accuracyScore: 0
        };
      }
    } else {
      // Para SELL: precio debe bajar
      if (currentPrice <= targetPrice) {
        return {
          outcome: 'SUCCESS',
          exitPrice: currentPrice,
          exitTimestamp: new Date(),
          profitLoss: ((entryPrice - targetPrice) / entryPrice) * 100,
          reasonClosed: 'TARGET_HIT',
          timeToOutcome: timeElapsed,
          actualProfitPercent: profitLoss,
          accuracyScore: 100
        };
      } else if (currentPrice >= stopLoss) {
        return {
          outcome: 'FAILED',
          exitPrice: currentPrice,
          exitTimestamp: new Date(),
          profitLoss: ((entryPrice - stopLoss) / entryPrice) * 100,
          reasonClosed: 'STOP_LOSS',
          timeToOutcome: timeElapsed,
          actualProfitPercent: profitLoss,
          accuracyScore: 0
        };
      }
    }
    
    // Verificar timeout
    if (timeElapsed > this.TIMEOUT_MINUTES) {
      const accuracyScore = Math.max(0, Math.min(100, 50 + profitLoss * 10)); // Puntuación basada en profit
      
      return {
        outcome: profitLoss > this.MIN_PROFIT_THRESHOLD ? 'PARTIAL' : 'FAILED',
        exitPrice: currentPrice,
        exitTimestamp: new Date(),
        profitLoss,
        reasonClosed: 'TIMEOUT',
        timeToOutcome: timeElapsed,
        actualProfitPercent: profitLoss,
        accuracyScore
      };
    }
    
    return { outcome: 'PENDING' };
  }
  
  private updatePredictionOutcome(signalId: string, updates: Partial<PredictionOutcome>): void {
    const prediction = this.predictions.get(signalId);
    if (!prediction) return;
    
    Object.assign(prediction, updates);
    
    console.log(`✅ Predicción ${updates.outcome}: ${prediction.symbol} ${prediction.action} - Profit: ${updates.profitLoss?.toFixed(2)}% (Razón: ${updates.reasonClosed})`);
  }
  
  // Obtener métricas de precisión
  getAccuracyMetrics(): AccuracyMetrics {
    const allPredictions = Array.from(this.predictions.values());
    const completedPredictions = allPredictions.filter(p => p.outcome !== 'PENDING');
    
    const successful = completedPredictions.filter(p => p.outcome === 'SUCCESS' || p.outcome === 'PARTIAL');
    const failed = completedPredictions.filter(p => p.outcome === 'FAILED');
    const pending = allPredictions.filter(p => p.outcome === 'PENDING');
    
    // Calcular precisión por acción
    const buyPredictions = completedPredictions.filter(p => p.action === 'BUY');
    const sellPredictions = completedPredictions.filter(p => p.action === 'SELL');
    const successfulBuys = buyPredictions.filter(p => p.outcome === 'SUCCESS' || p.outcome === 'PARTIAL');
    const successfulSells = sellPredictions.filter(p => p.outcome === 'SUCCESS' || p.outcome === 'PARTIAL');
    
    // Calcular precisión por confianza
    const highConfidence = completedPredictions.filter(p => p.confidence >= 90);
    const mediumConfidence = completedPredictions.filter(p => p.confidence >= 80 && p.confidence < 90);
    const lowConfidence = completedPredictions.filter(p => p.confidence < 80);
    
    const highConfidenceSuccess = highConfidence.filter(p => p.outcome === 'SUCCESS' || p.outcome === 'PARTIAL');
    const mediumConfidenceSuccess = mediumConfidence.filter(p => p.outcome === 'SUCCESS' || p.outcome === 'PARTIAL');
    const lowConfidenceSuccess = lowConfidence.filter(p => p.outcome === 'SUCCESS' || p.outcome === 'PARTIAL');
    
    // Métricas financieras
    const profitLosses = completedPredictions.map(p => p.profitLoss);
    const timeToResolutions = completedPredictions.filter(p => p.timeToOutcome).map(p => p.timeToOutcome!);
    
    return {
      totalPredictions: allPredictions.length,
      successfulPredictions: successful.length,
      failedPredictions: failed.length,
      pendingPredictions: pending.length,
      
      overallAccuracy: completedPredictions.length > 0 ? (successful.length / completedPredictions.length) * 100 : 0,
      buyAccuracy: buyPredictions.length > 0 ? (successfulBuys.length / buyPredictions.length) * 100 : 0,
      sellAccuracy: sellPredictions.length > 0 ? (successfulSells.length / sellPredictions.length) * 100 : 0,
      
      highConfidenceAccuracy: highConfidence.length > 0 ? (highConfidenceSuccess.length / highConfidence.length) * 100 : 0,
      mediumConfidenceAccuracy: mediumConfidence.length > 0 ? (mediumConfidenceSuccess.length / mediumConfidence.length) * 100 : 0,
      lowConfidenceAccuracy: lowConfidence.length > 0 ? (lowConfidenceSuccess.length / lowConfidence.length) * 100 : 0,
      
      totalProfitLoss: profitLosses.reduce((sum, pl) => sum + pl, 0),
      averageProfitLoss: profitLosses.length > 0 ? profitLosses.reduce((sum, pl) => sum + pl, 0) / profitLosses.length : 0,
      bestTrade: profitLosses.length > 0 ? Math.max(...profitLosses) : 0,
      worstTrade: profitLosses.length > 0 ? Math.min(...profitLosses) : 0,
      
      averageTimeToResolution: timeToResolutions.length > 0 ? timeToResolutions.reduce((sum, t) => sum + t, 0) / timeToResolutions.length : 0,
      quickestResolution: timeToResolutions.length > 0 ? Math.min(...timeToResolutions) : 0,
      slowestResolution: timeToResolutions.length > 0 ? Math.max(...timeToResolutions) : 0,
      
      lastUpdated: new Date()
    };
  }
  
  // Obtener predicciones por estado
  getPredictionsByOutcome(outcome: 'PENDING' | 'SUCCESS' | 'FAILED' | 'PARTIAL'): PredictionOutcome[] {
    return Array.from(this.predictions.values()).filter(p => p.outcome === outcome);
  }
  
  // Obtener todas las predicciones
  getAllPredictions(): PredictionOutcome[] {
    return Array.from(this.predictions.values());
  }
  
  // Limpiar predicciones antiguas (más de 7 días)
  cleanupOldPredictions(): void {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [signalId, prediction] of this.predictions.entries()) {
      if (prediction.timestamp < sevenDaysAgo && prediction.outcome !== 'PENDING') {
        this.predictions.delete(signalId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Limpiadas ${cleaned} predicciones antiguas`);
    }
  }
}

// Exportar instancia singleton
export const predictionVerificationSystem = new PredictionVerificationSystem();
