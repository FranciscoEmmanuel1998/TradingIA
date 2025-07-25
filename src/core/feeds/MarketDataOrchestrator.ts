// 🔥 MARKET DATA ORCHESTRATOR - Coordinador de todos los feeds reales
import { binanceWebSocketFeed } from './BinanceWebSocket';
import { coinbaseWebSocketFeed } from './CoinbaseWebSocket';
import { kuCoinWebSocketFeed } from './KuCoinWebSocket';
import { realDataBridge } from './RealDataBridge';

interface ExchangeStatus {
  connected: boolean;
  exchange: string;
  latency?: number;
  lastTick?: number;
}

class MarketDataOrchestrator {
  private isActive: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private connectionStatus: Map<string, ExchangeStatus> = new Map();

  constructor() {
    // Inicializar estados de conexión
    this.connectionStatus.set('BINANCE', { connected: false, exchange: 'BINANCE' });
    this.connectionStatus.set('COINBASE', { connected: false, exchange: 'COINBASE' });
    this.connectionStatus.set('KUCOIN', { connected: false, exchange: 'KUCOIN' });
  }

  // 🚀 Inicializar todos los feeds
  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    console.log('🚀 MARKET DATA ORCHESTRATOR - Iniciando feeds reales...');

    // Los feeds ya se auto-inicializan, solo necesitamos monitorear
    this.startHealthChecks();
    
    console.log('✅ Todos los feeds WebSocket iniciados');
    console.log('📊 Datos reales fluyendo al sistema de IA...');
  }

  // 🛑 Detener todos los feeds
  stop(): void {
    if (!this.isActive) return;

    this.isActive = false;
    console.log('🛑 Deteniendo todos los feeds...');

    // Detener feeds
    binanceWebSocketFeed.disconnect();
    coinbaseWebSocketFeed.disconnect();
    kuCoinWebSocketFeed.disconnect();

    // Detener puente de datos
    realDataBridge.stop();

    // Detener health checks
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    console.log('✅ Todos los feeds detenidos');
  }

  // ❤️ Monitoreo de salud de conexiones
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, 30000); // Cada 30 segundos

    // Primer check inmediato
    setTimeout(() => this.checkConnectionHealth(), 5000);
  }

  private checkConnectionHealth(): void {
    // Actualizar estados
    this.connectionStatus.set('BINANCE', binanceWebSocketFeed.getStatus());
    this.connectionStatus.set('COINBASE', coinbaseWebSocketFeed.getStatus());
    this.connectionStatus.set('KUCOIN', kuCoinWebSocketFeed.getStatus());

    // Verificar salud general
    const connectedFeeds = Array.from(this.connectionStatus.values())
      .filter(status => status.connected).length;

    const totalFeeds = this.connectionStatus.size;

    console.log(`📊 Health Check: ${connectedFeeds}/${totalFeeds} exchanges conectados`);

    if (connectedFeeds === 0) {
      console.error('❌ CRÍTICO: Ningún exchange conectado');
    } else if (connectedFeeds < totalFeeds) {
      console.warn(`⚠️ ADVERTENCIA: Solo ${connectedFeeds}/${totalFeeds} exchanges activos`);
    } else {
      console.log('✅ Todos los exchanges funcionando correctamente');
    }

    // Verificar estadísticas del puente
    const bridgeStats = realDataBridge.getStats();
    console.log(`📈 Bridge Stats: ${bridgeStats.activeSymbols} símbolos, ${bridgeStats.totalTicks} ticks totales`);
  }

  // 📊 Obtener estado de todos los exchanges
  getConnectionStatus(): Map<string, ExchangeStatus> {
    return new Map(this.connectionStatus);
  }

  // 📈 Obtener estadísticas completas
  getFullStats(): {
    connections: Map<string, ExchangeStatus>;
    bridgeStats: any;
    isActive: boolean;
    realDataVerified: boolean;
  } {
    return {
      connections: this.getConnectionStatus(),
      bridgeStats: realDataBridge.getStats(),
      isActive: this.isActive,
      realDataVerified: realDataBridge.verifyRealDataOnly()
    };
  }

  // 🔥 Verificar que todo funciona con datos reales
  verifyRealDataFlow(): boolean {
    const stats = realDataBridge.getStats();
    const connectedExchanges = Array.from(this.connectionStatus.values())
      .filter(status => status.connected).length;

    // Verificaciones
    if (!this.isActive) {
      console.error('❌ Orchestrator no está activo');
      return false;
    }

    if (connectedExchanges === 0) {
      console.error('❌ No hay exchanges conectados');
      return false;
    }

    if (stats.activeSymbols === 0) {
      console.error('❌ No hay símbolos activos en el bridge');
      return false;
    }

    if (!realDataBridge.verifyRealDataOnly()) {
      console.error('❌ Datos simulados detectados');
      return false;
    }

    console.log('✅ Flujo de datos reales verificado correctamente');
    return true;
  }

  // 🎯 Obtener latencia promedio
  getAverageLatency(): number {
    const latencies = Array.from(this.connectionStatus.values())
      .filter(status => status.connected && status.latency)
      .map(status => status.latency!);

    if (latencies.length === 0) return 0;
    return latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
  }
}

// 🚀 Instancia global del orchestrator
export const marketDataOrchestrator = new MarketDataOrchestrator();

// 🔥 AUTO-INICIALIZAR en producción
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_REAL_DATA === 'true') {
  marketDataOrchestrator.start();
  console.log('🔥 MARKET DATA ORCHESTRATOR AUTO-INICIADO');
}
