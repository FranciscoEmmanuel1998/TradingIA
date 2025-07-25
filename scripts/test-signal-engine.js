#!/usr/bin/env node
// 🚀 REAL SIGNAL ENGINE TEST - Motor de Señales con Datos Reales
// MODO SEGURO: Genera señales reales pero NO ejecuta órdenes

import { config } from 'dotenv';
import WebSocket from 'ws';

// Cargar variables de entorno
config({ path: '.env.local' });

console.log('🚀 ENCENDIENDO MOTOR DE SEÑALES REALES...');
console.log('⚠️  MODO SEGURO: Sin ejecución de órdenes reales');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Simulación del motor de señales con datos reales
class RealSignalEngineTest {
  constructor() {
    this.priceHistory = [];
    this.signals = [];
    this.isRunning = false;
  }

  // 📊 Procesar tick de precio real
  processPriceTick(exchange, symbol, price, timestamp) {
    const tick = {
      exchange,
      symbol, 
      price: parseFloat(price),
      timestamp,
      source: 'REAL_MARKET_DATA'
    };

    this.priceHistory.push(tick);
    
    // Mantener solo los últimos 50 ticks
    if (this.priceHistory.length > 50) {
      this.priceHistory.shift();
    }

    // Generar señal si tenemos suficientes datos
    if (this.priceHistory.length >= 10) {
      this.generateSignal(tick);
    }

    console.log(`📊 [${exchange}] ${symbol}: $${price.toLocaleString()} (${new Date(timestamp).toLocaleTimeString()})`);
  }

  // ⚡ Generar señal basada en datos reales
  generateSignal(currentTick) {
    const recentPrices = this.priceHistory.slice(-10).map(t => t.price);
    const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const priceChange = ((currentTick.price - avgPrice) / avgPrice) * 100;

    let signalType = null;
    let strength = 0;

    // Lógica simple de señales
    if (priceChange > 0.1) {
      signalType = 'BUY';
      strength = Math.min(priceChange * 10, 100);
    } else if (priceChange < -0.1) {
      signalType = 'SELL'; 
      strength = Math.min(Math.abs(priceChange) * 10, 100);
    }

    if (signalType) {
      const signal = {
        id: `signal_${Date.now()}`,
        type: signalType,
        symbol: currentTick.symbol,
        exchange: currentTick.exchange,
        price: currentTick.price,
        strength: Math.round(strength),
        priceChange: priceChange.toFixed(3),
        timestamp: new Date().toISOString(),
        source: 'REAL_DATA_ENGINE',
        status: 'GENERATED_NOT_EXECUTED' // ⚠️ MODO SEGURO
      };

      this.signals.push(signal);
      this.displaySignal(signal);

      // Mantener solo las últimas 20 señales
      if (this.signals.length > 20) {
        this.signals.shift();
      }
    }
  }

  // 🎯 Mostrar señal generada
  displaySignal(signal) {
    const emoji = signal.type === 'BUY' ? '🟢' : '🔴';
    const arrow = signal.type === 'BUY' ? '⬆️' : '⬇️';
    
    console.log(`\n${emoji} SEÑAL ${signal.type} GENERADA ${arrow}`);
    console.log(`   Symbol: ${signal.symbol}`);
    console.log(`   Exchange: ${signal.exchange}`);
    console.log(`   Price: $${signal.price.toLocaleString()}`);
    console.log(`   Strength: ${signal.strength}%`);
    console.log(`   Change: ${signal.priceChange}%`);
    console.log(`   🛡️ Status: MODO SEGURO - NO EJECUTADA`);
    console.log(`   Time: ${new Date(signal.timestamp).toLocaleTimeString()}`);
  }

  // 📈 Obtener estadísticas
  getStats() {
    const buySignals = this.signals.filter(s => s.type === 'BUY').length;
    const sellSignals = this.signals.filter(s => s.type === 'SELL').length;
    const avgStrength = this.signals.length > 0 
      ? this.signals.reduce((sum, s) => sum + s.strength, 0) / this.signals.length 
      : 0;

    return {
      totalSignals: this.signals.length,
      buySignals,
      sellSignals,
      avgStrength: Math.round(avgStrength),
      ticksProcessed: this.priceHistory.length,
      lastPrice: this.priceHistory.length > 0 ? this.priceHistory[this.priceHistory.length - 1].price : 0
    };
  }

  // 🔥 Iniciar motor
  start() {
    this.isRunning = true;
    console.log('🔥 Motor de Señales ENCENDIDO - Esperando datos reales...\n');
  }

  // 🛑 Parar motor
  stop() {
    this.isRunning = false;
    console.log('\n🛑 Motor de Señales APAGADO');
  }
}

// 🌐 Conectar a feeds reales para obtener datos
async function connectToRealFeeds(signalEngine) {
  console.log('🌐 Conectando a feeds de datos reales...\n');

  // Binance WebSocket
  try {
    const ws1 = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    
    ws1.onmessage = (event) => {
      const data = JSON.parse(event.data);
      signalEngine.processPriceTick('BINANCE', 'BTCUSDT', data.c, Date.now());
    };

    ws1.onerror = (error) => console.log('❌ Error Binance WebSocket');

  } catch (error) {
    console.log('❌ Error conectando Binance:', error.message);
  }

  // Coinbase WebSocket
  try {
    const ws2 = new WebSocket('wss://ws-feed.exchange.coinbase.com');
    
    ws2.onopen = () => {
      ws2.send(JSON.stringify({
        type: 'subscribe',
        product_ids: ['BTC-USD'],
        channels: ['ticker']
      }));
    };

    ws2.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ticker') {
        signalEngine.processPriceTick('COINBASE', 'BTC-USD', data.price, Date.now());
      }
    };

    ws2.onerror = (error) => console.log('❌ Error Coinbase WebSocket');

  } catch (error) {
    console.log('❌ Error conectando Coinbase:', error.message);
  }

  // KuCoin REST (cada 5 segundos)
  setInterval(async () => {
    try {
      const response = await fetch('https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT');
      const data = await response.json();
      
      if (data.code === '200000' && data.data) {
        signalEngine.processPriceTick('KUCOIN', 'BTC-USDT', data.data.price, Date.now());
      }
    } catch (error) {
      console.log('❌ Error KuCoin REST');
    }
  }, 5000);
}

// 🚀 Ejecutar test del motor de señales
async function runSignalEngineTest() {
  const signalEngine = new RealSignalEngineTest();
  
  // Encender motor
  signalEngine.start();
  
  // Conectar a feeds reales
  await connectToRealFeeds(signalEngine);
  
  // Mostrar estadísticas cada 30 segundos
  setInterval(() => {
    const stats = signalEngine.getStats();
    console.log('\n📊 ESTADÍSTICAS DEL MOTOR:');
    console.log(`   Señales generadas: ${stats.totalSignals}`);
    console.log(`   BUY signals: ${stats.buySignals}`);
    console.log(`   SELL signals: ${stats.sellSignals}`);
    console.log(`   Fuerza promedio: ${stats.avgStrength}%`);
    console.log(`   Ticks procesados: ${stats.ticksProcessed}`);
    console.log(`   Último precio: $${stats.lastPrice.toLocaleString()}`);
    console.log(`   🛡️ Modo: SEGURO (sin ejecución real)`);
  }, 30000);

  // Ejecutar por 2 minutos para demostración
  setTimeout(() => {
    signalEngine.stop();
    const finalStats = signalEngine.getStats();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏁 PRUEBA COMPLETADA - MOTOR DE SEÑALES');
    console.log(`✅ Señales generadas: ${finalStats.totalSignals}`);
    console.log(`✅ Datos reales procesados: ${finalStats.ticksProcessed} ticks`);
    console.log('🛡️ MODO SEGURO: Ninguna orden fue ejecutada');
    console.log('🎯 EL MOTOR ESTÁ LISTO PARA RISK MANAGER');
    
    process.exit(0);
  }, 120000); // 2 minutos
}

// Verificar que estamos en modo anti-simulación
if (process.env.ENABLE_SIMULATION !== 'false') {
  console.log('❌ ERROR: ENABLE_SIMULATION debe ser "false" para datos reales');
  process.exit(1);
}

console.log('🛡️ Verificación: ENABLE_SIMULATION=false ✅');
console.log('🎯 Motor configurado para datos reales únicamente\n');

runSignalEngineTest().catch(error => {
  console.error('💥 Error fatal:', error.message);
  process.exit(1);
});
