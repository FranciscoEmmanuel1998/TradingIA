// 🧠 CEREBRO DEL SISTEMA - Orquestador Principal
import { IModule, ILivingSystem, SystemState } from '../interfaces';
import { EventBus } from '../../circulation/channels/EventBus';
import { DecisionEngine } from './DecisionEngine';
import { MemoryCore } from './MemoryCore';

export class TradingBrain implements IModule {
  private static instance: TradingBrain;
  private systemState: SystemState;
  private decisionEngine: DecisionEngine;
  private memoryCore: MemoryCore;
  private eventBus: EventBus;
  private isAlive: boolean = false;
  private initialized: boolean = false;

  private constructor() {
    this.systemState = new SystemState();
    this.decisionEngine = new DecisionEngine();
    this.memoryCore = new MemoryCore();
    this.eventBus = EventBus.getInstance();
  }

  static getInstance(): TradingBrain {
    if (!TradingBrain.instance) {
      TradingBrain.instance = new TradingBrain();
    }
    return TradingBrain.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🧠 TradingBrain: Ya está inicializado, omitiendo...');
      return;
    }

    console.log('🧠 TradingBrain: Iniciando conciencia del sistema...');
    
    // Suscribirse a eventos críticos
    this.eventBus.subscribe('market.anomaly', this.handleMarketAnomaly.bind(this));
    this.eventBus.subscribe('system.error', this.handleSystemError.bind(this));
    this.eventBus.subscribe('performance.update', this.handlePerformanceUpdate.bind(this));
    
    // Inicializar módulos dependientes
    await this.decisionEngine.initialize();
    await this.memoryCore.initialize();
    
    this.isAlive = true;
    this.initialized = true;
    this.startConsciousnessLoop();
    
    console.log('✅ TradingBrain: Sistema consciente y operativo');
  }

  private startConsciousnessLoop(): void {
    // Ciclo de conciencia cada 5 segundos
    setInterval(() => {
      this.performSelfAnalysis();
      this.systemState.heartbeat(); // Actualizar estado del sistema
      this.makeStrategicDecisions();
    }, 5000);
  }

  private performSelfAnalysis(): void {
    const analysis = {
      timestamp: Date.now(),
      modulesHealth: this.checkModulesHealth(),
      performanceMetrics: this.memoryCore.getPerformanceMetrics(),
      systemLoad: this.getSystemLoad(),
      confidenceLevel: this.calculateConfidenceLevel()
    };

    this.systemState.updateSelfAnalysis(analysis);
    
    // Si hay problemas críticos, tomar acción
    if (analysis.confidenceLevel < 0.3) {
      this.eventBus.emit('system.degradation', analysis);
    }
  }

  private makeStrategicDecisions(): void {
    const currentState = this.systemState.getCurrentState();
    const decision = this.decisionEngine.processStrategicDecision(currentState);
    
    if (decision.shouldExecute) {
      this.eventBus.emit('brain.decision', decision);
    }
  }

  private handleMarketAnomaly(data: any): void {
    console.log('🚨 TradingBrain: Anomalía detectada, activando protocolos de emergencia');
    this.systemState.setAlert('market_anomaly', data);
    
    // Reducir exposición automáticamente
    this.eventBus.emit('execution.reduce_exposure', { severity: data.severity });
  }

  private handleSystemError(error: any): void {
    console.log('💀 TradingBrain: Error crítico del sistema', error);
    this.memoryCore.logError(error);
    
    // Si es crítico, activar modo de supervivencia
    if (error.severity === 'critical') {
      this.activateSurvivalMode();
    }
  }

  private activateSurvivalMode(): void {
    console.log('🛡️ TradingBrain: MODO SUPERVIVENCIA ACTIVADO');
    this.systemState.setSurvivalMode(true);
    this.eventBus.emit('system.survival_mode', { active: true });
  }

  private handlePerformanceUpdate(performance: any): void {
    this.memoryCore.updatePerformanceHistory(performance);
    
    // Si el rendimiento es excepcional, evolucionar estrategias
    if (performance.score > 0.8) {
      this.eventBus.emit('genetics.evolve_strategies', performance);
    }
  }

  private checkModulesHealth(): Record<string, number> {
    // Simulated health check - en implementación real consultaría cada módulo
    return {
      respiration: 0.95,
      perception: 0.88,
      execution: 0.92,
      immunity: 0.97,
      genetics: 0.85
    };
  }

  private getSystemLoad(): number {
    // Simulated system load calculation
    return Math.random() * 0.4 + 0.1; // 10-50% load
  }

  private calculateConfidenceLevel(): number {
    const health = this.checkModulesHealth();
    const avgHealth = Object.values(health).reduce((a, b) => a + b, 0) / Object.values(health).length;
    const systemLoad = this.getSystemLoad();
    
    return avgHealth * (1 - systemLoad);
  }

  // Interface IModule
  getName(): string {
    return 'TradingBrain';
  }

  getHealth(): number {
    return this.calculateConfidenceLevel();
  }

  isActive(): boolean {
    return this.isAlive;
  }

  async stop(): Promise<void> {
    this.isAlive = false;
    console.log('💤 TradingBrain: Sistema entrando en hibernación...');
  }
}
