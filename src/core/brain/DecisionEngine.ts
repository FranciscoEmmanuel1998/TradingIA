// 🎯 MOTOR DE DECISIONES - Inteligencia Estratégica
import { Decision, SystemState } from '../interfaces';
import { EventBus } from '../../circulation/channels/EventBus';
import { realMarketFeed } from '../feeds/RealMarketFeed';

export class DecisionEngine {
  private eventBus: EventBus;
  private decisionHistory: Decision[];
  private isActive: boolean = false;

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.decisionHistory = [];
  }

  async initialize(): Promise<void> {
    console.log('🎯 DecisionEngine: Inicializando motor de decisiones...');
    
    // Suscribirse a señales de mercado
    this.eventBus.subscribe('perception.signal', this.handleMarketSignal.bind(this));
    this.eventBus.subscribe('immunity.risk_alert', this.handleRiskAlert.bind(this));
    
    this.isActive = true;
    console.log('✅ DecisionEngine: Motor de decisiones activo');
  }

  processStrategicDecision(systemState: any): Decision {
    const decision: Decision = {
      id: `decision_${Date.now()}`,
      type: 'system',
      action: 'monitor',
      confidence: this.calculateSystemConfidence(systemState),
      shouldExecute: false,
      timestamp: Date.now(),
      reasoning: 'Análisis de estado del sistema'
    };

    // Lógica de decisión basada en estado del sistema
    if (systemState.survivalMode) {
      decision.action = 'conserve_resources';
      decision.type = 'system';
      decision.shouldExecute = true;
      decision.reasoning = 'Sistema en modo supervivencia';
    } else if (decision.confidence > 0.8) {
      decision.action = 'aggressive_strategy';
      decision.type = 'trading';
      decision.shouldExecute = true;
      decision.reasoning = 'Alta confianza del sistema';
    } else if (decision.confidence < 0.3) {
      decision.action = 'defensive_strategy';
      decision.type = 'risk';
      decision.shouldExecute = true;
      decision.reasoning = 'Baja confianza del sistema';
    }

    this.recordDecision(decision);
    return decision;
  }

  private handleMarketSignal(signal: any): void {
    console.log('📊 DecisionEngine: Procesando señal de mercado', signal);
    
    const decision = this.analyzeMarketSignal(signal);
    if (decision.shouldExecute) {
      this.eventBus.emit('decision.market_action', decision);
    }
  }

  private handleRiskAlert(alert: any): void {
    console.log('🚨 DecisionEngine: Procesando alerta de riesgo', alert);
    
    const decision: Decision = {
      id: `risk_decision_${Date.now()}`,
      type: 'risk',
      action: 'reduce_exposure',
      confidence: 0.9,
      shouldExecute: true,
      timestamp: Date.now(),
      reasoning: `Respuesta a alerta de riesgo: ${alert.type}`
    };

    this.recordDecision(decision);
    this.eventBus.emit('decision.risk_response', decision);
  }

  private analyzeMarketSignal(signal: any): Decision {
    const decision: Decision = {
      id: `market_decision_${Date.now()}`,
      type: 'trading',
      action: 'hold',
      confidence: 0.5,
      shouldExecute: false,
      timestamp: Date.now(),
      reasoning: 'Análisis técnico de mercado'
    };

    const symbol = signal.symbol || 'BTC/USD';
    const rsi = this.calculateRSI(symbol);
    const ema20 = this.calculateEMA(symbol, 20);
    const ema50 = this.calculateEMA(symbol, 50);
    const macd = this.calculateMACD(symbol);

    if (rsi !== null && ema20 !== null && ema50 !== null && macd !== null) {
      if (ema20 > ema50 && rsi < 30 && macd > 0) {
        decision.action = 'buy';
        decision.shouldExecute = true;
        decision.confidence = this.calculateBuyConfidence(rsi, ema20, ema50, macd);
        decision.reasoning = `EMA20 ${ema20.toFixed(2)} > EMA50 ${ema50.toFixed(2)}, RSI ${rsi.toFixed(1)} < 30, MACD ${macd.toFixed(2)} > 0`;
      } else if (ema20 < ema50 && rsi > 70 && macd < 0) {
        decision.action = 'sell';
        decision.shouldExecute = true;
        decision.confidence = this.calculateSellConfidence(rsi, ema20, ema50, macd);
        decision.reasoning = `EMA20 ${ema20.toFixed(2)} < EMA50 ${ema50.toFixed(2)}, RSI ${rsi.toFixed(1)} > 70, MACD ${macd.toFixed(2)} < 0`;
      }
    }

    return decision;
  }

  private calculateEMA(symbol: string, period: number): number | null {
    return realMarketFeed.calculateEMA(symbol, period);
  }

  private calculateRSI(symbol: string, period: number = 14): number | null {
    return realMarketFeed.calculateRSI(symbol, period);
  }

  private calculateMACD(symbol: string): number | null {
    const ema12 = realMarketFeed.calculateEMA(symbol, 12);
    const ema26 = realMarketFeed.calculateEMA(symbol, 26);
    if (ema12 === null || ema26 === null) return null;
    return ema12 - ema26;
  }

  private calculateBuyConfidence(rsi: number, ema20: number, ema50: number, macd: number): number {
    let confidence = 0.7;
    confidence += (30 - rsi) / 100;
    confidence += Math.min(0.1, (ema20 - ema50) / ema50);
    confidence += macd > 0 ? 0.05 : 0;
    return Math.max(0, Math.min(1, confidence));
  }

  private calculateSellConfidence(rsi: number, ema20: number, ema50: number, macd: number): number {
    let confidence = 0.7;
    confidence += (rsi - 70) / 100;
    confidence += Math.min(0.1, (ema50 - ema20) / ema20);
    confidence += macd < 0 ? 0.05 : 0;
    return Math.max(0, Math.min(1, confidence));
  }

  private calculateSystemConfidence(systemState: any): number {
    // Calcular confianza basada en múltiples factores
    let confidence = 1.0;

    // Factor de salud del sistema
    if (systemState.selfAnalysis && systemState.selfAnalysis.modulesHealth) {
      const healthValues = Object.values(systemState.selfAnalysis.modulesHealth) as number[];
      if (healthValues.length > 0) {
        const avgHealth = healthValues.reduce((a, b) => a + b, 0) / healthValues.length;
        confidence *= avgHealth;
      }
    }

    // Factor de alertas activas
    const criticalAlerts = systemState.alerts.filter((a: any) => a.severity === 'critical').length;
    confidence *= Math.max(0.1, 1 - (criticalAlerts * 0.2));

    // Factor de modo supervivencia
    if (systemState.survivalMode) {
      confidence *= 0.3;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private recordDecision(decision: Decision): void {
    this.decisionHistory.push(decision);
    
    // Mantener solo las últimas 500 decisiones
    if (this.decisionHistory.length > 500) {
      this.decisionHistory = this.decisionHistory.slice(-500);
    }

    console.log(`💡 DecisionEngine: Decisión registrada - ${decision.action} (confianza: ${decision.confidence.toFixed(2)})`);
  }

  getDecisionHistory(limit: number = 50): Decision[] {
    return this.decisionHistory.slice(-limit);
  }

  getPerformanceMetrics() {
    const recentDecisions = this.getDecisionHistory(100);
    const avgConfidence = recentDecisions.reduce((sum, d) => sum + d.confidence, 0) / recentDecisions.length;
    
    return {
      totalDecisions: this.decisionHistory.length,
      avgConfidence,
      recentDecisions: recentDecisions.length
    };
  }
}
