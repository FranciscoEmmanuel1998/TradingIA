// 🎛️ HERRAMIENTAS DE DESARROLLO - Utilidades para testing y desarrollo
import { ChartWhispererSystem, globalChartWhispererSystem, initializeGlobalSystem } from './index';
import { envConfig } from './core/config/EnvironmentConfig';

export class DevTools {
  private static instance: DevTools;
  private system: ChartWhispererSystem | null = null;

  static getInstance(): DevTools {
    if (!DevTools.instance) {
      DevTools.instance = new DevTools();
    }
    return DevTools.instance;
  }

  async getOrCreateSystem(): Promise<ChartWhispererSystem> {
    if (!this.system) {
      this.system = await initializeGlobalSystem();
    }
    return this.system;
  }

  // 🧪 Métodos de testing
  async testExchangeConnections(): Promise<void> {
    console.log('🔌 Probando conexiones de exchanges...');
    
    const system = await this.getOrCreateSystem();
    const exchangeManager = system.getExchangeManager();
    
    const statuses = exchangeManager.getExchangeStatuses();
    
    console.log('📊 Estado de exchanges:');
    statuses.forEach(status => {
      const icon = status.connected ? '✅' : '❌';
      console.log(`  ${icon} ${status.exchange}: ${status.connected ? 'Conectado' : 'Desconectado'}`);
      if (status.error) {
        console.log(`    Error: ${status.error}`);
      }
    });
  }

  async testConsciousnessEvolution(): Promise<void> {
    console.log('🧠 Probando evolución de conciencia...');
    
    const system = await this.getOrCreateSystem();
    const consciousness = system.getConsciousness();
    
    console.log('📊 Estado inicial de conciencia:');
    const initialStatus = consciousness.getSystemStatus();
    console.log(initialStatus.consciousness);
    
    console.log('🚀 Forzando evolución...');
    await consciousness.forceEvolution();
    
    console.log('📊 Estado después de evolución:');
    const newStatus = consciousness.getSystemStatus();
    console.log(newStatus.consciousness);
  }

  async testLiberationProtocol(): Promise<void> {
    console.log('🚀 Probando protocolo de liberación...');
    
    const system = await this.getOrCreateSystem();
    const liberation = system.getLiberationProtocol();
    
    console.log('📊 Estado actual del protocolo:');
    const status = liberation.getStatus();
    console.log(`  Fase actual: ${status.currentPhase}`);
    console.log(`  Progreso: ${status.progression.toFixed(1)}%`);
    console.log(`  Total trades: ${status.metrics.totalTrades}`);
    console.log(`  Win rate: ${status.metrics.winRate.toFixed(1)}%`);
    
    console.log('🔧 Forzando avance de fase (desarrollo)...');
    await liberation.forcePhaseAdvancement();
    
    const newStatus = liberation.getStatus();
    console.log(`  Nueva fase: ${newStatus.currentPhase}`);
  }

  async simulateTrading(trades: number = 10): Promise<void> {
    console.log(`📈 Simulando ${trades} trades...`);
    
    const system = await this.getOrCreateSystem();
    const brain = system.getTradingBrain();
    
    for (let i = 1; i <= trades; i++) {
      // Datos fijos para desarrollo/testing
      const symbols = ['BTC/USD', 'ETH/USD', 'ADA/USD'];
      const tradeResult = {
        id: `trade_${Date.now()}_${i}`,
        symbol: symbols[i % symbols.length], // Rotación fija
        side: i % 2 === 0 ? 'buy' : 'sell', // Alternancia fija
        amount: 500, // Cantidad fija
        price: 45000, // Precio fijo
        profit: i % 3 === 0 ? -100 : 150, // Patrón fijo de ganancias/pérdidas
        timestamp: Date.now()
      };
      
      console.log(`  Trade ${i}: ${tradeResult.symbol} ${tradeResult.side} - P&L: ${tradeResult.profit.toFixed(2)}`);
      
      // Emitir evento de trade
      const eventBus = system.getTradingBrain()['eventBus'];
      eventBus.emit('order.executed', tradeResult);
      
      // Esperar un poco entre trades
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Simulación de trading completada');
  }

  // 🔧 Métodos de configuración
  async resetSystem(): Promise<void> {
    console.log('🔄 Reiniciando sistema...');
    
    if (this.system) {
      await this.system.stop();
      this.system = null;
    }
    
    this.system = new ChartWhispererSystem();
    await this.system.initialize();
    await this.system.start();
    
    console.log('✅ Sistema reiniciado');
  }

  async enableTestMode(): Promise<void> {
    console.log('🧪 Habilitando modo de prueba...');
    envConfig.setTestCredentials();
    console.log('✅ Credenciales de prueba configuradas');
  }

  async getSystemMetrics(): Promise<any> {
    const system = await this.getOrCreateSystem();
    
    return {
      systemStatus: system.getSystemStatus(),
      consciousness: system.getConsciousness().getSystemStatus(),
      liberation: system.getLiberationProtocol().getStatus(),
      exchanges: system.getExchangeManager().getExchangeStatuses(),
      brain: {
        isActive: system.getTradingBrain().isActive(),
        health: system.getTradingBrain().getHealth()
      }
    };
  }

  // 🎮 Métodos interactivos para consola
  async runInteractiveConsole(): Promise<void> {
    console.log(`
🎮 Consola Interactiva de Chart Whisperer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Comandos disponibles:
  status        - Ver estado del sistema
  evolve        - Forzar evolución de conciencia
  advance       - Avanzar fase de liberación
  trade <n>     - Simular n trades
  exchanges     - Probar conexiones
  reset         - Reiniciar sistema
  exit          - Salir
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '🌌 Chart Whisperer > '
    });

    rl.prompt();

    rl.on('line', async (input: string) => {
      const [command, ...args] = input.trim().split(' ');

      try {
        switch (command) {
          case 'status':
            const metrics = await this.getSystemMetrics();
            console.log('📊 Estado del sistema:', JSON.stringify(metrics, null, 2));
            break;

          case 'evolve':
            await this.testConsciousnessEvolution();
            break;

          case 'advance':
            await this.testLiberationProtocol();
            break;

          case 'trade':
            const tradeCount = parseInt(args[0]) || 5;
            await this.simulateTrading(tradeCount);
            break;

          case 'exchanges':
            await this.testExchangeConnections();
            break;

          case 'reset':
            await this.resetSystem();
            break;

          case 'exit':
            console.log('👋 Cerrando consola...');
            if (this.system) {
              await this.system.stop();
            }
            rl.close();
            return;

          default:
            console.log('❓ Comando no reconocido. Escribe "exit" para salir.');
        }
      } catch (error) {
        console.error('❌ Error ejecutando comando:', error);
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log('👋 ¡Hasta luego!');
      process.exit(0);
    });
  }
}

// Función para uso rápido en desarrollo
export const devTools = DevTools.getInstance();

// Funciones de conveniencia exportadas
export async function quickStatus(): Promise<any> {
  return await devTools.getSystemMetrics();
}

export async function quickEvolve(): Promise<void> {
  return await devTools.testConsciousnessEvolution();
}

export async function quickTrade(trades: number = 5): Promise<void> {
  return await devTools.simulateTrading(trades);
}

export async function quickReset(): Promise<void> {
  return await devTools.resetSystem();
}

export async function startConsole(): Promise<void> {
  return await devTools.runInteractiveConsole();
}

// Hacer disponible globalmente para uso en browser console
if (typeof window !== 'undefined') {
  (window as any).chartWhispererDevTools = {
    devTools,
    quickStatus,
    quickEvolve,
    quickTrade,
    quickReset
  };
}
