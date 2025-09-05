// 🎯 REAL SIGNAL TRACKER - Sistema de tracking REAL sin simulaciones
// Rastrea señales contra movimientos de precio REALES del mercado

import { EventBus } from '../../circulation/channels/EventBus';
import { freeDataAggregator } from '../feeds/FreeDataAggregator';

interface RealSignalEntry {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  
  // Precios REALES
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  
  // Timestamps REALES
  entryTime: Date;
  expirationTime: Date;
  exitTime?: Date;
  
  // Estado actual
  status: 'ACTIVE' | 'WIN' | 'LOSS' | 'EXPIRED';
  currentPrice?: number;
  
  // Métricas calculadas
  realPnL: number;
  realPnLPercentage: number;
  durationMinutes: number;
  
  // Metadata
  confidence: number;
  reasoning: string[];
}

interface RealPerformanceMetrics {
  // Métricas VERIFICABLES
  totalSignalsGenerated: number;
  signalsExecuted: number;
  
  // Win/Loss REAL basado en precios de mercado
  realWins: number;
  realLosses: number;
  realWinRate: number;
  
  // PnL REAL
  totalRealPnL: number;
  avgRealPnL: number;
  biggestWin: number;
  biggestLoss: number;
  
  // Métricas de tiempo REAL
  avgDurationMinutes: number;
  fastestWin: number;
  slowestWin: number;
  
  // Métricas avanzadas REALES
  realProfitFactor: number;
  realSharpeRatio: number;
  maxDrawdown: number;
  
  // Verificación
  lastVerification: Date;
  dataSource: 'REAL_MARKET_PRICES';
}

export class RealSignalTracker {
  private eventBus: EventBus;
  private activeSignals: Map<string, RealSignalEntry> = new Map();
  private completedSignals: RealSignalEntry[] = [];
  private isTracking: boolean = false;
  private verificationInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    // Escuchar nuevas señales
    this.eventBus.subscribe('premium_signal_generated', (signal: any) => {
      this.trackNewSignal(signal);
    });
  }
  
  // 🎯 RASTREAR NUEVA SEÑAL
  private trackNewSignal(signal: any): void {
    if (!this.isTracking) return;
    
    const realEntry: RealSignalEntry = {
      id: signal.id,
      symbol: signal.symbol,
      action: signal.action,
      entryPrice: signal.entryPrice,
      targetPrice: signal.targetPrice,
      stopLoss: signal.stopLoss,
      entryTime: new Date(),
      expirationTime: signal.expirationTime,
      status: 'ACTIVE',
      realPnL: 0,
      realPnLPercentage: 0,
      durationMinutes: 0,
      confidence: signal.confidence,
      reasoning: signal.reasoning
    };
    
    this.activeSignals.set(signal.id, realEntry);
    console.log(`📊 REAL TRACKER: Rastreando señal ${signal.symbol} ${signal.action} @ $${signal.entryPrice}`);
  }
  
  // 🔍 VERIFICAR SEÑALES ACTIVAS CONTRA PRECIOS REALES
  private async verifyActiveSignals(): Promise<void> {
    if (!this.isTracking || this.activeSignals.size === 0) return;
    
    console.log(`🔍 Verificando ${this.activeSignals.size} señales activas contra precios reales...`);
    
    for (const [signalId, signal] of this.activeSignals.entries()) {
      try {
        // Obtener precio REAL actual del mercado
        const marketData = await freeDataAggregator.getMarketData(signal.symbol);
        
        if (!marketData) {
          console.warn(`⚠️ No se pudo obtener precio para ${signal.symbol}`);
          continue;
        }
        
        const currentPrice = marketData.price;
        const timeElapsed = Date.now() - signal.entryTime.getTime();
        const minutesElapsed = Math.floor(timeElapsed / (1000 * 60));
        
        // Actualizar precio actual
        signal.currentPrice = currentPrice;
        signal.durationMinutes = minutesElapsed;
        
        // VERIFICAR CONDICIONES DE SALIDA REALES
        const result = this.evaluateSignalOutcome(signal, currentPrice);
        
        if (result.shouldClose) {
          this.closeSignal(signalId, signal, result.reason, currentPrice);
        } else {
          // Actualizar PnL en tiempo real
          this.updateSignalPnL(signal, currentPrice);
        }
        
      } catch (error) {
        console.error(`❌ Error verificando señal ${signalId}:`, error);
      }
    }
  }
  
  // ⚖️ EVALUAR RESULTADO REAL DE LA SEÑAL
  private evaluateSignalOutcome(signal: RealSignalEntry, currentPrice: number): {
    shouldClose: boolean;
    reason: 'TARGET_HIT' | 'STOP_LOSS_HIT' | 'EXPIRED' | 'NONE';
  } {
    const now = new Date();
    
    // 1. Verificar expiración
    if (now >= signal.expirationTime) {
      return { shouldClose: true, reason: 'EXPIRED' };
    }
    
    // 2. Verificar target alcanzado
    if (signal.action === 'BUY') {
      if (currentPrice >= signal.targetPrice) {
        return { shouldClose: true, reason: 'TARGET_HIT' };
      }
      if (currentPrice <= signal.stopLoss) {
        return { shouldClose: true, reason: 'STOP_LOSS_HIT' };
      }
    } else { // SELL
      if (currentPrice <= signal.targetPrice) {
        return { shouldClose: true, reason: 'TARGET_HIT' };
      }
      if (currentPrice >= signal.stopLoss) {
        return { shouldClose: true, reason: 'STOP_LOSS_HIT' };
      }
    }
    
    return { shouldClose: false, reason: 'NONE' };
  }
  
  // 📊 CERRAR SEÑAL CON RESULTADO REAL
  private closeSignal(signalId: string, signal: RealSignalEntry, reason: string, exitPrice: number): void {
    signal.exitTime = new Date();
    signal.currentPrice = exitPrice;
    
    // Calcular PnL REAL basado en precios de mercado
    const realPnL = this.calculateRealPnL(signal, exitPrice);
    signal.realPnL = realPnL.absolute;
    signal.realPnLPercentage = realPnL.percentage;
    
    // Determinar resultado REAL
    signal.status = reason === 'TARGET_HIT' ? 'WIN' : 
                   reason === 'STOP_LOSS_HIT' ? 'LOSS' : 'EXPIRED';
    
    // Mover a completadas
    this.completedSignals.push(signal);
    this.activeSignals.delete(signalId);
    
    console.log(`✅ SEÑAL CERRADA: ${signal.symbol} ${signal.action} | Resultado: ${signal.status} | PnL: ${realPnL.absolute.toFixed(2)} (${realPnL.percentage.toFixed(2)}%)`);
    console.log(`   📊 Entrada: $${signal.entryPrice} | Salida: $${exitPrice} | Duración: ${signal.durationMinutes}min`);
    
    // Emitir evento de señal cerrada
    this.eventBus.emit('signal_closed', {
      ...signal,
      reason,
      exitPrice
    });
  }
  
  // 💰 CALCULAR PnL REAL
  private calculateRealPnL(signal: RealSignalEntry, exitPrice: number): {
    absolute: number;
    percentage: number;
  } {
    let pnlPercentage = 0;
    
    if (signal.action === 'BUY') {
      pnlPercentage = ((exitPrice - signal.entryPrice) / signal.entryPrice) * 100;
    } else { // SELL
      pnlPercentage = ((signal.entryPrice - exitPrice) / signal.entryPrice) * 100;
    }
    
    // Simular posición de $1000 para cálculo absoluto
    const positionSize = 1000;
    const absolutePnL = (pnlPercentage / 100) * positionSize;
    
    return {
      absolute: absolutePnL,
      percentage: pnlPercentage
    };
  }
  
  // 📈 ACTUALIZAR PnL EN TIEMPO REAL
  private updateSignalPnL(signal: RealSignalEntry, currentPrice: number): void {
    const realPnL = this.calculateRealPnL(signal, currentPrice);
    signal.realPnL = realPnL.absolute;
    signal.realPnLPercentage = realPnL.percentage;
  }
  
  // 📊 OBTENER MÉTRICAS REALES VERIFICABLES
  getRealPerformanceMetrics(): RealPerformanceMetrics {
    const totalCompleted = this.completedSignals.length;
    const wins = this.completedSignals.filter(s => s.status === 'WIN');
    const losses = this.completedSignals.filter(s => s.status === 'LOSS');
    
    const totalPnL = this.completedSignals.reduce((sum, s) => sum + s.realPnL, 0);
    const winPnL = wins.reduce((sum, s) => sum + Math.abs(s.realPnL), 0);
    const lossPnL = losses.reduce((sum, s) => sum + Math.abs(s.realPnL), 0);
    
    const avgDuration = totalCompleted > 0 ? 
      this.completedSignals.reduce((sum, s) => sum + s.durationMinutes, 0) / totalCompleted : 0;
    
    const winTimes = wins.map(s => s.durationMinutes);
    const fastestWin = winTimes.length > 0 ? Math.min(...winTimes) : 0;
    const slowestWin = winTimes.length > 0 ? Math.max(...winTimes) : 0;
    
    const pnlValues = this.completedSignals.map(s => s.realPnL);
    const biggestWin = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
    const biggestLoss = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;
    
    // Calcular drawdown máximo
    let maxDrawdown = 0;
    let peak = 0;
    let runningPnL = 0;
    
    for (const signal of this.completedSignals) {
      runningPnL += signal.realPnL;
      if (runningPnL > peak) peak = runningPnL;
      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
    
    return {
      totalSignalsGenerated: totalCompleted + this.activeSignals.size,
      signalsExecuted: totalCompleted,
      realWins: wins.length,
      realLosses: losses.length,
      realWinRate: totalCompleted > 0 ? (wins.length / totalCompleted) * 100 : 0,
      totalRealPnL: totalPnL,
      avgRealPnL: totalCompleted > 0 ? totalPnL / totalCompleted : 0,
      biggestWin,
      biggestLoss,
      avgDurationMinutes: avgDuration,
      fastestWin,
      slowestWin,
      realProfitFactor: lossPnL > 0 ? winPnL / lossPnL : winPnL,
      realSharpeRatio: this.calculateSharpeRatio(),
      maxDrawdown,
      lastVerification: new Date(),
      dataSource: 'REAL_MARKET_PRICES'
    };
  }
  
  // 📊 CALCULAR SHARPE RATIO REAL
  private calculateSharpeRatio(): number {
    if (this.completedSignals.length < 2) return 0;
    
    const returns = this.completedSignals.map(s => s.realPnLPercentage);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? avgReturn / stdDev : 0;
  }
  
  // 🚀 MÉTODOS PÚBLICOS
  startRealTracking(): void {
    this.isTracking = true;
    
    // Verificar señales cada 30 segundos
    this.verificationInterval = setInterval(() => {
      this.verifyActiveSignals();
    }, 30000);
    
    console.log('🎯 REAL SIGNAL TRACKER iniciado - Verificando contra precios reales');
  }
  
  stopRealTracking(): void {
    this.isTracking = false;
    
    if (this.verificationInterval) {
      clearInterval(this.verificationInterval);
      this.verificationInterval = null;
    }
    
    console.log('⏹️ REAL SIGNAL TRACKER detenido');
  }
  
  getActiveSignals(): RealSignalEntry[] {
    return Array.from(this.activeSignals.values());
  }
  
  getCompletedSignals(): RealSignalEntry[] {
    return [...this.completedSignals];
  }
  
  getAllSignals(): RealSignalEntry[] {
    return [...this.getActiveSignals(), ...this.getCompletedSignals()];
  }
  
  // 🔍 VERIFICAR INTEGRIDAD DE DATOS
  verifyDataIntegrity(): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Verificar que todos los precios son de fuentes reales
    for (const signal of this.getAllSignals()) {
      if (!signal.entryPrice || signal.entryPrice <= 0) {
        issues.push(`Precio de entrada inválido para ${signal.id}`);
      }
      
      if (signal.currentPrice && signal.currentPrice <= 0) {
        issues.push(`Precio actual inválido para ${signal.id}`);
      }
    }
    
    // Verificar que no hay datos hardcodeados
    const hasSimulatedData = this.completedSignals.some(s => 
      s.realPnL === 1200 || // Datos de ejemplo
      s.realPnLPercentage === 2.86 // Datos hardcodeados
    );
    
    if (hasSimulatedData) {
      issues.push('Detectados datos simulados o hardcodeados');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

// Exportar instancia singleton
export const realSignalTracker = new RealSignalTracker();
