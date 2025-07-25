// 🚀 REAL EXCHANGE INTEGRATION - Actualización del Protocolo de Liberación
import { EventBus } from '../../circulation/channels/EventBus';
import { FinancialConsciousnessOrchestrator } from './FinancialConsciousnessOrchestrator';
import { MultiExchangeManager, ExchangeConfig } from '../exchanges/MultiExchangeManager';

export interface LiberationPhase {
  id: number;
  name: string;
  description: string;
  requirements: string[];
  safetyLevel: number; // 0-100
  tradingLimits: {
    maxPositionSize: number;
    maxDailyTrades: number;
    maxDrawdown: number;
  };
  markets: 'simulation' | 'paper' | 'real_limited' | 'real_full';
}

export interface LiberationStatus {
  currentPhase: number;
  progression: number; // 0-100
  safetyChecks: {
    riskManagement: boolean;
    performanceHistory: boolean;
    emergencyProtocols: boolean;
    humanOversight: boolean;
  };
  metrics: {
    totalTrades: number;
    winRate: number;
    avgReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  lastEvaluation: number;
  nextEvaluation: number;
}

export class RealExchangeLiberationProtocol {
  private eventBus: EventBus;
  private consciousness: FinancialConsciousnessOrchestrator;
  private exchangeManager: MultiExchangeManager;
  private currentPhase: number = 1;
  private status: LiberationStatus;
  private phases: LiberationPhase[];
  private isActive: boolean = false;
  private evaluationInterval: NodeJS.Timeout | null = null;

  constructor(consciousness: FinancialConsciousnessOrchestrator) {
    this.eventBus = EventBus.getInstance();
    this.consciousness = consciousness;
    this.exchangeManager = new MultiExchangeManager();
    
    this.phases = this.defineLibeationPhases();
    this.status = this.initializeStatus();
    
    this.setupEventListeners();
  }

  private defineLibeationPhases(): LiberationPhase[] {
    return [
      {
        id: 1,
        name: "Simulación Completa",
        description: "Entrenamiento en entorno completamente simulado con datos históricos y en tiempo real",
        requirements: [
          "100+ trades exitosos",
          "Sharpe Ratio > 1.5",
          "Max Drawdown < 10%",
          "Win Rate > 60%"
        ],
        safetyLevel: 100,
        tradingLimits: {
          maxPositionSize: 0, // Sin dinero real
          maxDailyTrades: 50,
          maxDrawdown: 15
        },
        markets: 'simulation'
      },
      {
        id: 2,
        name: "Paper Trading con APIs Reales",
        description: "Trading simulado con datos reales de Kraken, Coinbase y KuCoin",
        requirements: [
          "500+ trades exitosos",
          "Sharpe Ratio > 2.0",
          "Max Drawdown < 8%",
          "Profit Factor > 1.8",
          "Conexiones estables a 3+ exchanges"
        ],
        safetyLevel: 90,
        tradingLimits: {
          maxPositionSize: 0, // Aún sin dinero real
          maxDailyTrades: 100,
          maxDrawdown: 10
        },
        markets: 'paper'
      },
      {
        id: 3,
        name: "Trading Real Limitado",
        description: "Trading con dinero real pero con límites estrictos de exposición",
        requirements: [
          "1000+ trades exitosos en paper",
          "Sharpe Ratio > 2.5",
          "Max Drawdown < 5%",
          "6 meses de rendimiento consistente",
          "Aprobación humana explícita"
        ],
        safetyLevel: 70,
        tradingLimits: {
          maxPositionSize: 100, // $100 USD máximo por posición
          maxDailyTrades: 20,
          maxDrawdown: 5
        },
        markets: 'real_limited'
      },
      {
        id: 4,
        name: "Autonomía Completa",
        description: "Trading completamente autónomo con supervisión mínima",
        requirements: [
          "5000+ trades exitosos en real",
          "Sharpe Ratio > 3.0",
          "Max Drawdown < 3%",
          "1 año de rentabilidad consistente",
          "Certificación de seguridad completa"
        ],
        safetyLevel: 50,
        tradingLimits: {
          maxPositionSize: 10000, // $10,000 USD máximo por posición
          maxDailyTrades: 100,
          maxDrawdown: 3
        },
        markets: 'real_full'
      }
    ];
  }

  private initializeStatus(): LiberationStatus {
    return {
      currentPhase: 1,
      progression: 0,
      safetyChecks: {
        riskManagement: false,
        performanceHistory: false,
        emergencyProtocols: false,
        humanOversight: false
      },
      metrics: {
        totalTrades: 0,
        winRate: 0,
        avgReturn: 0,
        maxDrawdown: 0,
        sharpeRatio: 0
      },
      lastEvaluation: Date.now(),
      nextEvaluation: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    };
  }

  async initialize(exchangeConfig: ExchangeConfig): Promise<void> {
    console.log('🚀 RealExchangeLiberationProtocol: Iniciando protocolo de liberación con exchanges reales...');
    
    try {
      // Inicializar el manager de exchanges
      await this.exchangeManager.initialize(exchangeConfig);
      
      // Evaluar el estado actual
      await this.evaluateCurrentPhase();
      
      this.isActive = true;
      this.startEvaluationCycle();
      
      console.log(`✅ Protocolo de liberación activo - Fase ${this.currentPhase}: ${this.phases[this.currentPhase - 1].name}`);
      
      this.eventBus.emit('liberation.protocol_started', {
        currentPhase: this.currentPhase,
        exchangesConnected: this.exchangeManager.getConnectedExchanges().length,
        status: this.status
      });
      
    } catch (error) {
      console.error('❌ Error inicializando protocolo de liberación:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Escuchar trades ejecutados
    this.eventBus.subscribe('order.executed', this.handleTradeExecution.bind(this));
    
    // Escuchar datos de mercado agregados
    this.eventBus.subscribe('market.aggregated_data', this.handleMarketData.bind(this));
    
    // Escuchar emergencias
    this.eventBus.subscribe('system.emergency', this.handleEmergency.bind(this));
    
    // Escuchar cambios en consciousness
    this.eventBus.subscribe('consciousness.evolution', this.handleConsciousnessEvolution.bind(this));
  }

  private async evaluateCurrentPhase(): Promise<void> {
    console.log(`🔍 Evaluando progreso en Fase ${this.currentPhase}...`);
    
    const currentPhaseData = this.phases[this.currentPhase - 1];
    const consciousnessMetrics = this.consciousness.getSystemStatus();
    
    // Actualizar métricas básicas desde consciousness
    this.status.metrics.totalTrades = consciousnessMetrics.totalOperations;
    this.status.metrics.winRate = this.calculateWinRate();
    this.status.metrics.avgReturn = this.calculateAverageReturn();
    this.status.metrics.maxDrawdown = this.calculateMaxDrawdown();
    this.status.metrics.sharpeRatio = this.calculateSharpeRatio();
    
    // Evaluar safety checks
    this.status.safetyChecks = {
      riskManagement: this.evaluateRiskManagement(),
      performanceHistory: this.evaluatePerformanceHistory(),
      emergencyProtocols: this.evaluateEmergencyProtocols(),
      humanOversight: this.evaluateHumanOversight()
    };
    
    // Calcular progresión en la fase actual
    this.status.progression = this.calculatePhaseProgression();
    
    // Verificar si puede avanzar a la siguiente fase
    if (this.status.progression >= 100 && this.canAdvanceToNextPhase()) {
      await this.advanceToNextPhase();
    }
    
    this.status.lastEvaluation = Date.now();
    this.status.nextEvaluation = Date.now() + (24 * 60 * 60 * 1000);
    
    this.eventBus.emit('liberation.phase_evaluated', {
      phase: this.currentPhase,
      progression: this.status.progression,
      metrics: this.status.metrics,
      safetyChecks: this.status.safetyChecks
    });
  }

  private calculatePhaseProgression(): number {
    const currentPhaseData = this.phases[this.currentPhase - 1];
    let score = 0;
    let maxScore = 0;
    
    // Evaluar cada requirement
    if (this.currentPhase === 1) {
      // Fase 1: Simulación
      maxScore = 4;
      if (this.status.metrics.totalTrades >= 100) score++;
      if (this.status.metrics.sharpeRatio >= 1.5) score++;
      if (this.status.metrics.maxDrawdown <= 10) score++;
      if (this.status.metrics.winRate >= 60) score++;
    } else if (this.currentPhase === 2) {
      // Fase 2: Paper Trading
      maxScore = 5;
      if (this.status.metrics.totalTrades >= 500) score++;
      if (this.status.metrics.sharpeRatio >= 2.0) score++;
      if (this.status.metrics.maxDrawdown <= 8) score++;
      if (this.calculateProfitFactor() >= 1.8) score++;
      if (this.exchangeManager.getConnectedExchanges().length >= 3) score++;
    } else if (this.currentPhase === 3) {
      // Fase 3: Real Limitado
      maxScore = 5;
      if (this.status.metrics.totalTrades >= 1000) score++;
      if (this.status.metrics.sharpeRatio >= 2.5) score++;
      if (this.status.metrics.maxDrawdown <= 5) score++;
      if (this.hasConsistentPerformance(6)) score++; // 6 meses
      if (this.hasHumanApproval()) score++;
    }
    
    return Math.min(100, (score / maxScore) * 100);
  }

  private canAdvanceToNextPhase(): boolean {
    if (this.currentPhase >= this.phases.length) return false;
    
    const allSafetyChecks = Object.values(this.status.safetyChecks).every(check => check);
    const meetsRequirements = this.status.progression >= 100;
    
    return allSafetyChecks && meetsRequirements;
  }

  private async advanceToNextPhase(): Promise<void> {
    if (this.currentPhase >= this.phases.length) {
      console.log('🎉 ¡LIBERACIÓN COMPLETA ALCANZADA! El sistema ahora opera con autonomía total.');
      this.eventBus.emit('liberation.complete', {
        timestamp: Date.now(),
        finalPhase: this.currentPhase,
        metrics: this.status.metrics
      });
      return;
    }
    
    this.currentPhase++;
    this.status.currentPhase = this.currentPhase;
    this.status.progression = 0;
    
    const newPhase = this.phases[this.currentPhase - 1];
    
    console.log(`🚀 ¡AVANCE A NUEVA FASE! Entrando en Fase ${this.currentPhase}: ${newPhase.name}`);
    
    // Configurar nuevos límites de trading
    await this.configurePhaseSettings();
    
    this.eventBus.emit('liberation.phase_advanced', {
      newPhase: this.currentPhase,
      phaseName: newPhase.name,
      tradingLimits: newPhase.tradingLimits,
      safetyLevel: newPhase.safetyLevel,
      timestamp: Date.now()
    });
    
    // Si llegamos a fase 3 o 4, conectar con exchanges reales
    if (this.currentPhase >= 3) {
      await this.enableRealTrading();
    }
  }

  private async configurePhaseSettings(): Promise<void> {
    const currentPhaseData = this.phases[this.currentPhase - 1];
    
    // Configurar límites en el consciousness
    this.consciousness.setTradingLimits({
      maxPositionSize: currentPhaseData.tradingLimits.maxPositionSize,
      maxDailyTrades: currentPhaseData.tradingLimits.maxDailyTrades,
      maxDrawdown: currentPhaseData.tradingLimits.maxDrawdown
    });
    
    console.log(`⚙️ Configuración actualizada para Fase ${this.currentPhase}:`, currentPhaseData.tradingLimits);
  }

  private async enableRealTrading(): Promise<void> {
    console.log('💰 Habilitando trading con dinero real...');
    
    // Activar el modo de trading real en consciousness
    this.consciousness.setRealTradingMode(true);
    
    // Configurar protocolos de emergencia adicionales
    this.setupRealTradingProtocols();
    
    this.eventBus.emit('liberation.real_trading_enabled', {
      phase: this.currentPhase,
      timestamp: Date.now(),
      exchangesAvailable: this.exchangeManager.getConnectedExchanges()
    });
  }

  private setupRealTradingProtocols(): void {
    // Monitoreo más frecuente en trading real
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
    }
    
    this.evaluationInterval = setInterval(() => {
      this.evaluateRealTradingRisks();
    }, 5000); // Cada 5 segundos en trading real
  }

  private evaluateRealTradingRisks(): void {
    const metrics = this.status.metrics;
    
    // Verificar límites críticos
    if (metrics.maxDrawdown > this.phases[this.currentPhase - 1].tradingLimits.maxDrawdown) {
      this.triggerEmergencyStop('Max drawdown exceeded');
    }
    
    // Verificar rendimiento inusual
    if (metrics.winRate < 30) { // Win rate demasiado bajo
      this.triggerEmergencyStop('Win rate critically low');
    }
  }

  private triggerEmergencyStop(reason: string): void {
    console.log(`🚨 PARADA DE EMERGENCIA: ${reason}`);
    
    this.isActive = false;
    
    // Cerrar todas las posiciones
    this.eventBus.emit('emergency.close_all_positions', { reason, timestamp: Date.now() });
    
    // Desconectar de exchanges reales
    this.eventBus.emit('emergency.disconnect_exchanges', { reason, timestamp: Date.now() });
    
    // Retroceder una fase como medida de seguridad
    if (this.currentPhase > 1) {
      this.currentPhase--;
      this.status.currentPhase = this.currentPhase;
      console.log(`⬇️ Retrocediendo a Fase ${this.currentPhase} por seguridad`);
    }
    
    this.eventBus.emit('liberation.emergency_stop', {
      reason,
      phase: this.currentPhase,
      timestamp: Date.now()
    });
  }

  private startEvaluationCycle(): void {
    // Evaluación diaria
    this.evaluationInterval = setInterval(async () => {
      if (this.isActive) {
        await this.evaluateCurrentPhase();
      }
    }, 24 * 60 * 60 * 1000); // 24 horas
  }

  // Métodos auxiliares para cálculos de métricas
  private calculateWinRate(): number {
    // Implementar cálculo real basado en historial de trades
    return Math.random() * 40 + 50; // Mock: 50-90%
  }

  private calculateAverageReturn(): number {
    return Math.random() * 10 + 5; // Mock: 5-15%
  }

  private calculateMaxDrawdown(): number {
    return Math.random() * 8 + 2; // Mock: 2-10%
  }

  private calculateSharpeRatio(): number {
    return Math.random() * 2 + 1; // Mock: 1-3
  }

  private calculateProfitFactor(): number {
    return Math.random() * 1 + 1.5; // Mock: 1.5-2.5
  }

  private evaluateRiskManagement(): boolean {
    return this.consciousness.hasRiskManagementActive();
  }

  private evaluatePerformanceHistory(): boolean {
    return this.status.metrics.totalTrades >= 50;
  }

  private evaluateEmergencyProtocols(): boolean {
    return this.consciousness.hasEmergencyProtocols();
  }

  private evaluateHumanOversight(): boolean {
    return this.currentPhase <= 2 || this.hasHumanApproval();
  }

  private hasConsistentPerformance(months: number): boolean {
    // Verificar rendimiento consistente por X meses
    return true; // Mock implementation
  }

  private hasHumanApproval(): boolean {
    // Verificar aprobación humana explícita
    return false; // Requiere implementación de UI
  }

  // Métodos para manejar eventos
  private handleTradeExecution(trade: any): void {
    this.status.metrics.totalTrades++;
    // Actualizar métricas basadas en el trade
  }

  private handleMarketData(data: any): void {
    // Procesar datos de mercado para métricas
  }

  private handleEmergency(emergency: any): void {
    this.triggerEmergencyStop(emergency.reason || 'Unknown emergency');
  }

  private handleConsciousnessEvolution(evolution: any): void {
    console.log('🧠 Evolución de consciousness detectada, re-evaluando capacidades...');
    // Re-evaluar capacidades después de evolución
    setTimeout(() => this.evaluateCurrentPhase(), 1000);
  }

  // Métodos públicos para obtener estado
  getCurrentPhase(): LiberationPhase {
    return this.phases[this.currentPhase - 1];
  }

  getStatus(): LiberationStatus {
    return { ...this.status };
  }

  getAllPhases(): LiberationPhase[] {
    return [...this.phases];
  }

  getExchangeStatuses(): any[] {
    return this.exchangeManager.getExchangeStatuses();
  }

  async forcePhaseAdvancement(): Promise<void> {
    console.log('🔧 Forzando avance de fase (solo para desarrollo/testing)...');
    await this.advanceToNextPhase();
  }

  async shutdown(): Promise<void> {
    console.log('🚀 RealExchangeLiberationProtocol: Cerrando protocolo...');
    
    this.isActive = false;
    
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
    }
    
    await this.exchangeManager.shutdown();
    
    this.eventBus.emit('liberation.protocol_shutdown', { timestamp: Date.now() });
  }
}
