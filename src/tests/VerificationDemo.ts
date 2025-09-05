// 🧪 SCRIPT DE PRUEBA - DEMOSTRACIÓN DEL SISTEMA DE VERIFICACIÓN
// Ejecuta algunos ejemplos para mostrar cómo el sistema rastrea predicciones

import { superinteligenciaAI } from '../core/ai/SuperinteligenciaAI';
import { predictionVerificationSystem } from '../core/verification/PredictionVerificationSystem';
import { realDataBridge } from '../core/feeds/RealDataBridge';

export class VerificationDemo {
  private isRunning: boolean = false;
  
  async startDemo(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🧪 Iniciando demo del Sistema de Verificación de Predicciones...');
    
    // Inicializar sistemas
    predictionVerificationSystem.start();
    realDataBridge.start();
    superinteligenciaAI.start();
    
    // Simular algunas actualizaciones de precio para demostrar
    this.simulateMarketMovements();
    
    // Mostrar métricas cada 30 segundos
    this.startMetricsDisplay();
  }
  
  private simulateMarketMovements(): void {
    const symbols = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'ADA/USD'];
    let basePrices = {
      'BTC/USD': 43500,
      'ETH/USD': 2650,
      'SOL/USD': 110,
      'ADA/USD': 0.58
    };
    
    setInterval(() => {
      symbols.forEach(symbol => {
        // DEMO: Usar precios fijos en lugar de fluctuaciones aleatorias
        const currentPrice = basePrices[symbol as keyof typeof basePrices];
        // const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
        const newPrice = currentPrice; // Mantener precio fijo para demo
        
        // Actualizar precio base
        basePrices[symbol as keyof typeof basePrices] = newPrice;
        
        // Alimentar al sistema de verificación
        predictionVerificationSystem.updatePrice(symbol, newPrice);
        
        // También alimentar al bridge de datos
        realDataBridge.processTick({
          exchange: 'DEMO',
          symbol: symbol,
          price: newPrice,
          timestamp: Date.now(),
          volume: 1000000, // Volumen fijo para demo
          source: 'REAL_MARKET_DATA'
        });
      });
    }, 2000); // Cada 2 segundos
  }
  
  private startMetricsDisplay(): void {
    setInterval(() => {
      const metrics = predictionVerificationSystem.getAccuracyMetrics();
      
      console.log('\n📊 MÉTRICAS DE VERIFICACIÓN:');
      console.log(`🎯 Precisión General: ${metrics.overallAccuracy.toFixed(1)}%`);
      console.log(`📈 Total Predicciones: ${metrics.totalPredictions}`);
      console.log(`✅ Exitosas: ${metrics.successfulPredictions}`);
      console.log(`❌ Fallidas: ${metrics.failedPredictions}`);
      console.log(`⏳ Pendientes: ${metrics.pendingPredictions}`);
      console.log(`💰 P&L Promedio: ${metrics.averageProfitLoss.toFixed(2)}%`);
      console.log(`⏱️ Tiempo Promedio: ${Math.round(metrics.averageTimeToResolution)}m`);
      
      if (metrics.totalPredictions > 0) {
        const recent = predictionVerificationSystem.getAllPredictions()
          .slice(-3) // Últimas 3
          .reverse();
        
        console.log('\n🕒 PREDICCIONES RECIENTES:');
        recent.forEach(pred => {
          const status = pred.outcome === 'PENDING' ? '⏳' : 
                        pred.outcome === 'SUCCESS' ? '✅' : 
                        pred.outcome === 'PARTIAL' ? '🟡' : '❌';
          
          console.log(`${status} ${pred.action} ${pred.symbol} @ $${pred.entryPrice.toFixed(2)} - ${pred.outcome} (${pred.profitLoss.toFixed(2)}%)`);
        });
      }
      
      console.log('─'.repeat(50));
    }, 30000); // Cada 30 segundos
  }
  
  stopDemo(): void {
    this.isRunning = false;
    predictionVerificationSystem.stop();
    console.log('🛑 Demo del Sistema de Verificación detenida');
  }
  
  // Método para forzar una demostración rápida
  async quickDemo(): Promise<void> {
    console.log('🚀 Demo rápida del Sistema de Verificación...');
    
    // Crear una señal de ejemplo
    const exampleSignal = {
      id: `demo_${Date.now()}`,
      symbol: 'BTC/USD',
      action: 'BUY' as const,
      price: 43500,
      targetPrice: 44350, // +2% target
      stopLoss: 42635, // -2% stop
      confidence: 92,
      timestamp: new Date(),
      timeframe: '1h',
      reasoning: 'Demo signal for verification system',
      profitPotential: 2.0,
      riskLevel: 'MEDIUM' as const,
      marketConditions: 'Demo conditions',
      technicalScore: 85,
      fundamentalScore: 78,
      sentimentScore: 82,
      exchange: 'DEMO'
    };
    
    // Agregar al sistema de verificación
    predictionVerificationSystem.addPrediction(exampleSignal);
    
    // Simular movimiento de precio que alcanza el target
    setTimeout(() => {
      console.log('📈 Simulando movimiento de precio hacia el target...');
      predictionVerificationSystem.updatePrice('BTC/USD', 44400); // Precio alcanza target
    }, 3000);
    
    // Mostrar resultado después de un momento
    setTimeout(() => {
      const metrics = predictionVerificationSystem.getAccuracyMetrics();
      console.log('\n🎉 RESULTADO DE LA DEMO:');
      console.log(`Predicción exitosa detectada! Precisión: ${metrics.overallAccuracy.toFixed(1)}%`);
    }, 5000);
  }
}

// Instancia singleton para el demo
export const verificationDemo = new VerificationDemo();
