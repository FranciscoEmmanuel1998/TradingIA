/**
 * 🧪 Test del Sistema Completo de Predicciones
 * 
 * Prueba la integración completa del si      try {
        // Generar nueva señal
        const signal = predictionTestDataGenerator.generateTestSignal();
        const predictionId = advancedPredictionVerificationSystem.registerPrediction(signal);
        console.log(`📊 Nueva predicción: ${signal.symbol} ${signal.action} @${signal.price} (${signal.confidence}% confianza)`);
        
        // Simular cambio de precio después de un momento
        setTimeout(() => {
          const priceChange = (Math.random() - 0.5) * 0.08; // ±4% change
          const newPrice = signal.price * (1 + priceChange);
          advancedPredictionVerificationSystem.updatePrice(signal.symbol, newPrice);
          console.log(`💹 Precio actualizado ${signal.symbol}: ${newPrice.toFixed(2)}`);
        }, 2000);
        
        signalCount++;
      } catch (error) {ión automática
 * con el generador de datos de prueba y las métricas analíticas.
 */

import { advancedPredictionVerificationSystem } from '../verification/AdvancedPredictionVerificationSystem';
import { predictionTestDataGenerator } from './PredictionTestDataGenerator';
import type { AISignal } from '../ai/SuperinteligenciaAI';

export class TestPredictionSystem {
  
  /**
   * 🚀 Ejecutar prueba completa del sistema
   */
  async runFullSystemTest(): Promise<void> {
    console.log('🚀 Iniciando Test Completo del Sistema de Predicciones');
    
    try {
      // 1. Generar algunas señales de prueba manualmente
      console.log('\n📊 Generando señales de prueba...');
      const testSignals: AISignal[] = [];
      
      for (let i = 0; i < 5; i++) {
        const signal = predictionTestDataGenerator.generateTestSignal();
        testSignals.push(signal);
      }
      
      console.log(`✅ Generadas ${testSignals.length} señales de prueba`);

      // 2. Registrar predicciones en el sistema de verificación
      console.log('\n📝 Registrando predicciones...');
      for (const signal of testSignals) {
        const predictionId = advancedPredictionVerificationSystem.registerPrediction(signal);
        console.log(`✅ Registrada predicción: ${signal.symbol} ${signal.action} @${signal.price} (ID: ${predictionId})`);
      }

      // 3. Simular actualizaciones de precios
      console.log('\n💹 Simulando actualizaciones de precios...');
      for (const signal of testSignals) {
        // Simular movimiento de precio
        const priceChange = (Math.random() - 0.5) * 0.1; // ±5% change
        const newPrice = signal.price * (1 + priceChange);
        advancedPredictionVerificationSystem.updatePrice(signal.symbol, newPrice);
        console.log(`📈 Actualizado precio de ${signal.symbol}: ${signal.price} → ${newPrice.toFixed(2)}`);
      }

      // 4. Esperar un momento para que el sistema procese
      console.log('\n⏳ Esperando procesamiento del sistema...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 5. Obtener métricas completas
      console.log('\n📈 Obteniendo métricas del sistema...');
      const metrics = advancedPredictionVerificationSystem.getComprehensiveMetrics();
      
      // 6. Mostrar reporte amigable
      console.log('\n📋 Reporte Completo del Sistema:');
      console.log('================================');
      
      const report = advancedPredictionVerificationSystem.getUserFriendlyReport();
      console.log(report.summary);
      
      console.log('\n🏆 Estadísticas Técnicas:');
      console.log(`  Total Predicciones: ${metrics.totalPredictions}`);
      console.log(`  Exitosas: ${metrics.successfulPredictions}`);
      console.log(`  Fallidas: ${metrics.failedPredictions}`);
      console.log(`  Pendientes: ${metrics.pendingPredictions}`);
      console.log(`  Precisión General: ${metrics.overallAccuracy}%`);

      console.log('\n✅ Test del sistema completado exitosamente!');

    } catch (error) {
      console.error('❌ Error durante el test del sistema:', error);
    }
  }

  /**
   * 🎮 Demo simple del sistema
   */
  async runSimpleDemo(): Promise<void> {
    console.log('🎮 Demo Simple del Sistema de Predicciones');
    console.log('==========================================');

    let signalCount = 0;
    const maxSignals = 10;

    const demoInterval = setInterval(async () => {
      if (signalCount >= maxSignals) {
        console.log('\n� Demo completado!');
        clearInterval(demoInterval);
        
        // Mostrar reporte final
        const finalReport = advancedPredictionVerificationSystem.getUserFriendlyReport();
        console.log('\n� Reporte Final:');
        console.log(finalReport.summary);
        return;
      }

      try {
        // Generar nueva señal
        const signal = await predictionTestDataGenerator.generateTestSignal();
        if (signal) {
          const predictionId = advancedPredictionVerificationSystem.registerPrediction(signal);
          console.log(`📊 Nueva predicción: ${signal.symbol} ${signal.action} @${signal.price} (${signal.confidence}% confianza)`);
          
          // Simular cambio de precio después de un momento
          setTimeout(() => {
            const priceChange = (Math.random() - 0.5) * 0.08; // ±4% change
            const newPrice = signal.price * (1 + priceChange);
            advancedPredictionVerificationSystem.updatePrice(signal.symbol, newPrice);
            console.log(`� Precio actualizado ${signal.symbol}: ${newPrice.toFixed(2)}`);
          }, 2000);
          
          signalCount++;
        }
      } catch (error) {
        console.error('❌ Error generando señal:', error);
      }
    }, 5000); // Cada 5 segundos

    console.log('🚀 Demo iniciado - generando predicciones cada 5 segundos...');
  }

  /**
   * 📊 Obtener estado actual del sistema
   */
  getSystemStatus(): any {
    const metrics = advancedPredictionVerificationSystem.getComprehensiveMetrics();
    const generatorStats = predictionTestDataGenerator.getStats();
    
    return {
      verification: metrics,
      generator: generatorStats,
      timestamp: new Date()
    };
  }

  /**
   * 🎯 Generar señal de prueba individual
   */
  generateTestSignal(): AISignal {
    return predictionTestDataGenerator.generateTestSignal();
  }

  /**
   * 📝 Registrar predicción
   */
  registerPrediction(signal: AISignal): string {
    return advancedPredictionVerificationSystem.registerPrediction(signal);
  }

  /**
   * 💹 Actualizar precio
   */
  updatePrice(symbol: string, price: number): void {
    advancedPredictionVerificationSystem.updatePrice(symbol, price);
  }

  /**
   * 📊 Obtener métricas
   */
  getMetrics() {
    return advancedPredictionVerificationSystem.getComprehensiveMetrics();
  }

  /**
   * 📋 Obtener reporte amigable
   */
  getReport() {
    return advancedPredictionVerificationSystem.getUserFriendlyReport();
  }
}

// Exportar instancia singleton para uso en la aplicación
export const testPredictionSystem = new TestPredictionSystem();
