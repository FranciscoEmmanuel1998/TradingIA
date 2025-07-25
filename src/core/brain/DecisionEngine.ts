// 🎯 MOTOR DE DECISIONES - Inteligencia Estratégica
import { Decision, SystemState } from '../interfaces';
import { EventBus } from '../../circulation/channels/EventBus';

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
      confidence: signal.strength || 0.5,
      shouldExecute: false,
      timestamp: Date.now(),
      reasoning: 'Análisis de señal de mercado'
    };

    // Lógica de decisión de trading
    if (signal.type === 'buy' && signal.strength > 0.7) {
      decision.action = 'buy';
      decision.shouldExecute = true;
      decision.reasoning = `Señal de compra fuerte (${signal.strength})`;
    } else if (signal.type === 'sell' && signal.strength > 0.7) {
      decision.action = 'sell';
      decision.shouldExecute = true;
      decision.reasoning = `Señal de venta fuerte (${signal.strength})`;
    }

    return decision;
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
