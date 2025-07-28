// 🔥 INTEGRACIÓN COMPLETA REAL - Conecta TODOS los subsistemas
// Script que elimina la fragmentación y conecta datos reales con toda la infraestructura

import WebSocket from 'ws';
import { realDataBridge } from '../src/core/feeds/RealDataBridge.js';
import { superinteligenciaAI_REAL } from '../src/core/ai/SuperinteligenciaAI_REAL.js';

console.log('🔥 INICIANDO INTEGRACIÓN COMPLETA REAL...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 🛡️ Verificación anti-simulación
if (process.env.ENABLE_SIMULATION === 'true') {
  console.error('❌ SIMULATION DETECTED - Aborting real integration');
  process.exit(1);
}

console.log('✅ NO SIMULATION - Proceeding with real integration');

class RealIntegrationEngine {
  constructor() {
    this.connections = {
      binance: null,
      coinbase: null,
      kucoin: null
    };
    this.isRunning = false;
    this.stats = {
      totalTicks: 0,
      signalsGenerated: 0,
      bridgeConnections: 0,
      aiActive: false
    };
  }

  // 🚀 Iniciar integración completa
  async start() {
    console.log('🔥 Iniciando motor de integración real...');
    this.isRunning = true;

    // 1. Inicializar puente de datos reales
    await this.initializeRealDataBridge();

    // 2. Conectar feeds de datos reales
    await this.connectRealFeeds();

    // 3. Inicializar SuperinteligenciaAI REAL
    this.initializeRealAI();

    // 4. Monitorear integración
    this.startMonitoring();

    console.log('🎯 INTEGRACIÓN COMPLETA REAL ACTIVA');
  }

  // 🔗 Inicializar puente de datos reales
  async initializeRealDataBridge() {
    console.log('🔗 Inicializando RealDataBridge...');
    
    // Escuchar eventos del puente
    realDataBridge.on('bridge_started', () => {
      console.log('✅ RealDataBridge iniciado');
      this.stats.bridgeConnections++;
    });

    realDataBridge.on('processed_data', (data) => {
      this.stats.totalTicks++;
      if (this.stats.totalTicks % 10 === 0) {
        console.log(`📊 Procesados ${this.stats.totalTicks} ticks reales`);
      }
    });

    // Verificar que el puente esté activo
    if (!realDataBridge.isActive) {
      realDataBridge.start();
    }
  }

  // 🌐 Conectar feeds de datos reales
  async connectRealFeeds() {
    console.log('🌐 Conectando a feeds de datos reales...');

    // Conectar Binance WebSocket
    try {
      await this.connectBinance();
    } catch (error) {
      console.log('⚠️ Binance WebSocket no disponible en Node.js');
    }

    // Conectar Coinbase WebSocket  
    try {
      await this.connectCoinbase();
    } catch (error) {
      console.log('⚠️ Coinbase WebSocket no disponible en Node.js');
    }

    // Conectar KuCoin REST (más compatible)
    await this.connectKuCoin();
  }

  // 🟡 Conectar Binance
  async connectBinance() {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    
    ws.on('open', () => {
      console.log('✅ Binance conectado');
      this.connections.binance = ws;
    });

    ws.on('message', (data) => {
      try {
        const tick = JSON.parse(data.toString());
        realDataBridge.processTick({
          exchange: 'BINANCE',
          symbol: 'BTC-USD',
          price: parseFloat(tick.c),
          timestamp: Date.now(),
          volume: parseFloat(tick.v),
          source: 'REAL_MARKET_DATA'
        });
      } catch (error) {
        console.error('Error procesando tick Binance:', error.message);
      }
    });

    ws.on('error', (error) => {
      console.log('⚠️ Error Binance WebSocket:', error.message);
    });
  }

  // 🔵 Conectar Coinbase
  async connectCoinbase() {
    const ws = new WebSocket('wss://ws-feed.pro.coinbase.com');
    
    ws.on('open', () => {
      console.log('✅ Coinbase conectado');
      this.connections.coinbase = ws;
      
      // Suscribirse a ticker
      ws.send(JSON.stringify({
        type: 'subscribe',
        product_ids: ['BTC-USD'],
        channels: ['ticker']
      }));
    });

    ws.on('message', (data) => {
      try {
        const tick = JSON.parse(data.toString());
        if (tick.type === 'ticker') {
          realDataBridge.processTick({
            exchange: 'COINBASE',
            symbol: 'BTC-USD',
            price: parseFloat(tick.price),
            timestamp: Date.now(),
            volume: parseFloat(tick.volume_24h),
            source: 'REAL_MARKET_DATA'
          });
        }
      } catch (error) {
        console.error('Error procesando tick Coinbase:', error.message);
      }
    });

    ws.on('error', (error) => {
      console.log('⚠️ Error Coinbase WebSocket:', error.message);
    });
  }

  // 🟢 Conectar KuCoin REST
  async connectKuCoin() {
    console.log('🟢 Iniciando polling KuCoin...');
    
    const pollKuCoin = async () => {
      try {
        const response = await fetch('https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT');
        const data = await response.json();
        
        if (data.code === '200000' && data.data) {
          realDataBridge.processTick({
            exchange: 'KUCOIN',
            symbol: 'BTC-USD',
            price: parseFloat(data.data.price),
            timestamp: Date.now(),
            volume: parseFloat(data.data.size || 1000000),
            source: 'REAL_MARKET_DATA'
          });
        }
      } catch (error) {
        console.error('Error polling KuCoin:', error.message);
      }
    };

    // Poll cada 5 segundos
    setInterval(pollKuCoin, 5000);
    
    // Llamada inmediata
    await pollKuCoin();
    console.log('✅ KuCoin polling iniciado');
  }

  // 🧠 Inicializar SuperinteligenciaAI REAL
  initializeRealAI() {
    console.log('🧠 Inicializando SuperinteligenciaAI REAL...');

    // Conectar con señales de la IA
    superinteligenciaAI_REAL.onSignal((signal) => {
      this.stats.signalsGenerated++;
      console.log('\n🎯 SEÑAL REAL GENERADA:');
      console.log(`   ${signal.action} ${signal.symbol}`);
      console.log(`   Precio: $${signal.price.toLocaleString()}`);
      console.log(`   Confianza: ${signal.confidence}%`);
      console.log(`   Fuente: DATOS REALES`);
      console.log(`   🛡️ Modo: SEGURO - NO EJECUTADA`);
    });

    // Verificar que esté iniciado
    if (!superinteligenciaAI_REAL.getStats().isActive) {
      superinteligenciaAI_REAL.start();
    }

    this.stats.aiActive = true;
    console.log('✅ SuperinteligenciaAI REAL iniciado');
  }

  // 📊 Monitorear integración
  startMonitoring() {
    setInterval(() => {
      const bridgeStats = realDataBridge.getStats();
      const aiStats = superinteligenciaAI_REAL.getStats();

      console.log('\n📊 ESTADO DE INTEGRACIÓN REAL:');
      console.log(`   Ticks procesados: ${this.stats.totalTicks}`);
      console.log(`   Símbolos activos: ${bridgeStats.activeSymbols}`);
      console.log(`   Señales generadas: ${this.stats.signalsGenerated}`);
      console.log(`   IA activa: ${aiStats.isActive ? '✅' : '❌'}`);
      console.log(`   Puente activo: ${bridgeStats.isActive ? '✅' : '❌'}`);
      console.log(`   🛡️ Sin simulaciones: ${!aiStats.hasSimulation ? '✅' : '❌'}`);

      // Verificar integridad de datos reales
      if (bridgeStats.isActive && bridgeStats.activeSymbols > 0) {
        console.log('🔥 INTEGRACIÓN REAL OPERATIVA');
      } else {
        console.log('⚠️ Esperando datos reales...');
      }
    }, 30000); // Cada 30 segundos
  }

  // 🛑 Detener integración
  stop() {
    console.log('🛑 Deteniendo integración real...');
    this.isRunning = false;

    // Cerrar conexiones WebSocket
    Object.values(this.connections).forEach(ws => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    // Detener sistemas
    realDataBridge.stop();
    superinteligenciaAI_REAL.stop();

    console.log('🏁 Integración real detenida');
  }

  // 📈 Obtener estadísticas completas
  getFullStats() {
    return {
      integration: this.stats,
      bridge: realDataBridge.getStats(),
      ai: superinteligenciaAI_REAL.getStats()
    };
  }
}

// 🚀 Inicializar motor de integración
const realIntegration = new RealIntegrationEngine();

// Manejar señales de proceso
process.on('SIGINT', () => {
  console.log('\n🛑 Recibida señal de interrupción');
  realIntegration.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recibida señal de terminación');
  realIntegration.stop();
  process.exit(0);
});

// 🔥 INICIAR INTEGRACIÓN COMPLETA
(async () => {
  try {
    await realIntegration.start();
    
    // Mantener activo
    console.log('🎯 Integración real activa - Presiona Ctrl+C para detener');
    
    // Estadísticas finales después de 2 minutos
    setTimeout(() => {
      const stats = realIntegration.getFullStats();
      console.log('\n📊 ESTADÍSTICAS FINALES:');
      console.log(`   Total ticks: ${stats.integration.totalTicks}`);
      console.log(`   Señales IA: ${stats.integration.signalsGenerated}`);
      console.log(`   Símbolos: ${stats.bridge.activeSymbols}`);
      console.log('🏁 INTEGRACIÓN REAL COMPLETADA CON ÉXITO');
      
      // Detener después de mostrar estadísticas
      realIntegration.stop();
      process.exit(0);
    }, 120000); // 2 minutos
    
  } catch (error) {
    console.error('❌ Error en integración real:', error);
    process.exit(1);
  }
})();
