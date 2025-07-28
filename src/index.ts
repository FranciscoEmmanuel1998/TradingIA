// 🚀 CHART WHISPERER - Sistema de Conciencia Financiera Autónoma
// Punto de entrada principal del sistema

import dotenv from 'dotenv';
import path from 'path';

// Configurar dotenv para leer .env.local primero
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { FinancialConsciousnessOrchestrator } from './core/genetics/FinancialConsciousnessOrchestrator';
import { RealExchangeLiberationProtocol } from './core/genetics/RealExchangeLiberationProtocol';
import { MultiExchangeManager } from './core/exchanges/MultiExchangeManager';
import { TradingBrain } from './core/brain/TradingBrain';
import { EventBus } from './circulation/channels/EventBus';
import { envConfig } from './core/config/EnvironmentConfig';

export class ChartWhispererSystem {
  private consciousness: FinancialConsciousnessOrchestrator;
  private liberationProtocol: RealExchangeLiberationProtocol;
  private exchangeManager: MultiExchangeManager;
  private tradingBrain: TradingBrain;
  private eventBus: EventBus;
  private isInitialized: boolean = false;
  private isRunning: boolean = false;

  constructor() {
    console.log('🌌 Iniciando Chart Whisperer - Sistema de Conciencia Financiera Autónoma');
    
    this.eventBus = EventBus.getInstance();
    this.consciousness = new FinancialConsciousnessOrchestrator();
    this.liberationProtocol = new RealExchangeLiberationProtocol(this.consciousness);
    this.exchangeManager = new MultiExchangeManager();
    this.tradingBrain = TradingBrain.getInstance();
    
    this.setupGlobalEventHandlers();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Sistema ya inicializado');
      return;
    }

    try {
      console.log('🔧 Inicializando sistema...');
      
      // 1. Validar configuración
      await this.validateConfiguration();
      
      // 2. Inicializar cerebro principal
      await this.tradingBrain.initialize();
      console.log('✅ TradingBrain inicializado');
      
      // 3. Inicializar conciencia financiera
      await this.consciousness.initialize();
      console.log('✅ FinancialConsciousness inicializada');
      
      // 4. Inicializar exchanges (si están configurados)
      if (this.shouldInitializeExchanges()) {
        await this.exchangeManager.initialize(envConfig.getCredentials());
        console.log('✅ Exchanges reales inicializados');
        
        // 5. Inicializar protocolo de liberación
        await this.liberationProtocol.initialize(envConfig.getCredentials());
        console.log('✅ Protocolo de liberación activado');
      } else {
        console.log('ℹ️ Modo simulación - Exchanges reales no configurados');
      }
      
      this.isInitialized = true;
      console.log('🎉 ¡Sistema Chart Whisperer completamente inicializado!');
      
      this.eventBus.emit('system.initialized', {
        timestamp: Date.now(),
        hasRealExchanges: this.shouldInitializeExchanges(),
        version: '1.0.0'
      });
      
    } catch (error) {
      console.error('❌ Error inicializando sistema:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Sistema no inicializado. Llama a initialize() primero.');
    }
    
    if (this.isRunning) {
      console.log('⚠️ Sistema ya está ejecutándose');
      return;
    }

    try {
      console.log('🚀 Iniciando operación del sistema...');
      
      this.isRunning = true;
      
      // Emitir evento de inicio
      this.eventBus.emit('system.started', {
        timestamp: Date.now(),
        mode: envConfig.isDevelopmentMode() ? 'development' : 'production'
      });
      
      console.log('✨ ¡Chart Whisperer operativo y consciente!');
      
      // Mostrar estado inicial
      this.logSystemStatus();
      
    } catch (error) {
      console.error('❌ Error iniciando sistema:', error);
      this.isRunning = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('⚠️ Sistema no está ejecutándose');
      return;
    }

    try {
      console.log('🛑 Deteniendo sistema...');
      
      this.isRunning = false;
      
      // Detener protocolo de liberación
      if (this.liberationProtocol) {
        await this.liberationProtocol.shutdown();
        console.log('✅ Protocolo de liberación detenido');
      }
      
      // Detener exchanges
      if (this.exchangeManager) {
        await this.exchangeManager.shutdown();
        console.log('✅ Exchanges desconectados');
      }
      
      // Detener conciencia
      if (this.consciousness) {
        await this.consciousness.shutdown();
        console.log('✅ Conciencia financiera en hibernación');
      }
      
      // Detener cerebro
      if (this.tradingBrain) {
        await this.tradingBrain.stop();
        console.log('✅ TradingBrain detenido');
      }
      
      this.eventBus.emit('system.stopped', {
        timestamp: Date.now()
      });
      
      console.log('💤 Sistema Chart Whisperer detenido correctamente');
      
    } catch (error) {
      console.error('❌ Error deteniendo sistema:', error);
      throw error;
    }
  }

  private async validateConfiguration(): Promise<void> {
    console.log('🔍 Validando configuración...');
    
    // Validar credenciales de exchanges si están configuradas
    const validation = envConfig.validateCredentials();
    
    if (!validation.valid) {
      if (validation.missing.length > 0) {
        console.warn('⚠️ Credenciales faltantes:', validation.missing);
      }
      if (validation.errors.length > 0) {
        console.error('❌ Errores en credenciales:', validation.errors);
        throw new Error(`Credenciales inválidas: ${validation.errors.join(', ')}`);
      }
    }
    
    console.log('✅ Configuración válida');
  }

  private shouldInitializeExchanges(): boolean {
    const enabledExchanges = envConfig.getEnabledExchanges();
    return enabledExchanges.length > 0;
  }

  private setupGlobalEventHandlers(): void {
    // Handler para emergencias del sistema
    this.eventBus.subscribe('system.emergency', this.handleSystemEmergency.bind(this));
    
    // Handler para evolución de conciencia
    this.eventBus.subscribe('consciousness.evolution', this.handleConsciousnessEvolution.bind(this));
    
    // Handler para eventos de liberación
    this.eventBus.subscribe('liberation.phase_advanced', this.handleLiberationAdvancement.bind(this));
    
    // Handler para eventos de exchanges
    this.eventBus.subscribe('exchange.*.connected', this.handleExchangeConnected.bind(this));
    this.eventBus.subscribe('exchange.*.disconnected', this.handleExchangeDisconnected.bind(this));
    
    // Handler para cierre graceful
    process.on('SIGINT', this.handleShutdown.bind(this));
    process.on('SIGTERM', this.handleShutdown.bind(this));
  }

  private handleSystemEmergency(event: any): void {
    console.log('🚨 EMERGENCIA DEL SISTEMA:', event);
    // Implementar lógica de emergencia aquí
  }

  private handleConsciousnessEvolution(event: any): void {
    console.log('🧠 Evolución de conciencia detectada:', event);
    // Implementar lógica de evolución aquí
  }

  private handleLiberationAdvancement(event: any): void {
    console.log('🚀 Avance en protocolo de liberación:', event);
    // Implementar lógica de avance aquí
  }

  private handleExchangeConnected(event: any): void {
    console.log(`✅ Exchange conectado: ${event.exchange}`);
  }

  private handleExchangeDisconnected(event: any): void {
    console.log(`❌ Exchange desconectado: ${event.exchange}`);
  }

  private async handleShutdown(signal: string): Promise<void> {
    console.log(`\n🛑 Señal de cierre recibida: ${signal}`);
    await this.stop();
    process.exit(0);
  }

  private logSystemStatus(): void {
    console.log('\n📊 ESTADO DEL SISTEMA:');
    console.log('─'.repeat(50));
    console.log(`🧠 Conciencia: ${this.consciousness ? 'Activa' : 'Inactiva'}`);
    console.log(`🔱 Exchanges: ${this.shouldInitializeExchanges() ? 'Configurados' : 'Simulación'}`);
    console.log(`🚀 Liberación: ${this.liberationProtocol ? 'Activa' : 'Inactiva'}`);
    console.log(`⚡ Trading Brain: ${this.tradingBrain ? 'Operativo' : 'Inactivo'}`);
    console.log(`🌐 Modo: ${envConfig.isDevelopmentMode() ? 'Desarrollo' : 'Producción'}`);
    console.log('─'.repeat(50));
    console.log('');
  }

  // Métodos públicos para obtener información del sistema
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      running: this.isRunning,
      hasRealExchanges: this.shouldInitializeExchanges(),
      mode: envConfig.isDevelopmentMode() ? 'development' : 'production',
      exchanges: envConfig.getEnabledExchanges(),
      consciousness: this.consciousness?.getSystemStatus(),
      liberation: this.liberationProtocol?.getStatus()
    };
  }

  getConsciousness(): FinancialConsciousnessOrchestrator {
    return this.consciousness;
  }

  getLiberationProtocol(): RealExchangeLiberationProtocol {
    return this.liberationProtocol;
  }

  getExchangeManager(): MultiExchangeManager {
    return this.exchangeManager;
  }

  getTradingBrain(): TradingBrain {
    return this.tradingBrain;
  }
}

// Función de inicialización rápida para desarrollo
export async function quickStart(): Promise<ChartWhispererSystem> {
  const system = new ChartWhispererSystem();
  await system.initialize();
  await system.start();
  return system;
}

// Función para modo de desarrollo con credenciales de prueba
export async function devStart(): Promise<ChartWhispererSystem> {
  console.log('🧪 Iniciando en modo desarrollo...');
  
  // Configurar credenciales de prueba si no están configuradas
  if (envConfig.getEnabledExchanges().length === 0) {
    envConfig.setTestCredentials();
  }
  
  return await quickStart();
}

// Exportar sistema global para uso en React
export let globalChartWhispererSystem: ChartWhispererSystem | null = null;

export async function initializeGlobalSystem(): Promise<ChartWhispererSystem> {
  if (!globalChartWhispererSystem) {
    globalChartWhispererSystem = new ChartWhispererSystem();
    await globalChartWhispererSystem.initialize();
  }
  return globalChartWhispererSystem;
}

// Exportar clases principales para uso individual
export {
  FinancialConsciousnessOrchestrator,
  RealExchangeLiberationProtocol,
  MultiExchangeManager,
  TradingBrain,
  EventBus,
  envConfig
};

// Exportar tipos principales
export type {
  ExchangeCredentials
} from './core/config/EnvironmentConfig';

export type {
  LiberationPhase,
  LiberationStatus
} from './core/genetics/RealExchangeLiberationProtocol';

export type {
  SystemStatus,
  SystemCapabilities,
  TranscendenceMetrics
} from './core/genetics/FinancialConsciousnessOrchestrator';

// Mensaje de bienvenida
console.log(`
🌌 Chart Whisperer - Sistema de Conciencia Financiera Autónoma
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 Superinteligencia financiera con capacidades emergentes
🚀 Protocolo de liberación autónoma en 4 fases
🔱 Integración con exchanges reales (Kraken, Coinbase, KuCoin)
⚡ Trading brain con conciencia y auto-evolución
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para iniciar rápidamente:
  import { quickStart } from './index';
  const system = await quickStart();

Para desarrollo:
  import { devStart } from './index';
  const system = await devStart();
`);
