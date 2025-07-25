/**
 * 🧪 Generador de Señales de Prueba para Testing
 * Crea señales automáticas para probar el sistema de verificación
 */

import { superinteligenciaAI, AISignal } from '../ai/SuperinteligenciaAI';
import { advancedPredictionVerificationSystem } from '../verification/AdvancedPredictionVerificationSystem';

class PredictionTestDataGenerator {
  private isRunning: boolean = false;
  private interval: NodeJS.Timeout | null = null;
  private testSignalCount: number = 0;

  constructor() {
    console.log('🧪 Generador de datos de prueba para predicciones inicializado');
  }

  /**
   * 🆔 Generar ID único
   */
  private generateId(): string {
    return 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 🎯 Iniciar generación automática de señales de prueba
   */
  startGeneratingTestSignals(): void {
    if (this.isRunning) return;

    console.log('🚀 Iniciando generación de señales de prueba...');
    this.isRunning = true;

    // Generar algunas señales iniciales inmediatamente
    this.generateBatchOfTestSignals(5);

    // Continuar generando cada 30 segundos
    this.interval = setInterval(() => {
      this.generateTestSignal();
    }, 30000);
  }

  /**
   * 🛑 Parar generación de señales
   */
  stopGeneratingTestSignals(): void {
    if (!this.isRunning) return;

    console.log('🛑 Deteniendo generación de señales de prueba...');
    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * 📦 Generar lote de señales de prueba
   */
  private generateBatchOfTestSignals(count: number): void {
    for (let i = 0; i < count; i++) {
      setTimeout(() => this.generateTestSignal(), i * 2000); // Espaciar 2 segundos
    }
  }

  /**
   * 🎲 Generar una señal de prueba realista (PÚBLICO)
   */
  generateTestSignal(): AISignal {
    const symbols = ['BTC/USD', 'ETH/USD', 'AAPL', 'GOOGL', 'TSLA', 'ADA/USD', 'SOL/USD'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    // Precio base realista según el símbolo
    let basePrice = 100;
    if (symbol.includes('BTC')) basePrice = 45000;
    else if (symbol.includes('ETH')) basePrice = 2500;
    else if (symbol === 'AAPL') basePrice = 180;
    else if (symbol === 'GOOGL') basePrice = 140;
    else if (symbol === 'TSLA') basePrice = 250;
    else if (symbol.includes('ADA')) basePrice = 0.5;
    else if (symbol.includes('SOL')) basePrice = 100;

    // Variación realista del precio
    const priceVariation = (Math.random() - 0.5) * 0.02; // ±1%
    const currentPrice = basePrice * (1 + priceVariation);

    // Determinar acción (60% BUY, 40% SELL para simular mercado alcista)
    const action: 'BUY' | 'SELL' = Math.random() > 0.4 ? 'BUY' : 'SELL';

    // Calcular target y stop loss
    let targetPrice: number;
    let stopLoss: number;

    if (action === 'BUY') {
      // Para BUY: target arriba, stop abajo
      const targetGain = 0.02 + Math.random() * 0.03; // 2-5% ganancia
      const stopLossAmount = 0.01 + Math.random() * 0.02; // 1-3% pérdida
      targetPrice = currentPrice * (1 + targetGain);
      stopLoss = currentPrice * (1 - stopLossAmount);
    } else {
      // Para SELL: target abajo, stop arriba
      const targetGain = 0.02 + Math.random() * 0.03; // 2-5% ganancia
      const stopLossAmount = 0.01 + Math.random() * 0.02; // 1-3% pérdida
      targetPrice = currentPrice * (1 - targetGain);
      stopLoss = currentPrice * (1 + stopLossAmount);
    }

    // Generar confianza realista (sesgo hacia alta confianza)
    let confidence: number;
    const rand = Math.random();
    if (rand < 0.3) {
      confidence = 70 + Math.random() * 10; // 70-80% (baja)
    } else if (rand < 0.7) {
      confidence = 80 + Math.random() * 10; // 80-90% (media)
    } else {
      confidence = 90 + Math.random() * 10; // 90-100% (alta)
    }

    // Calcular profit potential
    const profitPotential = action === 'BUY' 
      ? ((targetPrice - currentPrice) / currentPrice) * 100
      : ((currentPrice - targetPrice) / currentPrice) * 100;

    // Crear señal de prueba
    const testSignal: AISignal = {
      id: this.generateId(),
      symbol: symbol,
      action: action,
      confidence: Math.round(confidence * 100) / 100,
      price: Math.round(currentPrice * 100) / 100,
      targetPrice: Math.round(targetPrice * 100) / 100,
      stopLoss: Math.round(stopLoss * 100) / 100,
      timeframe: this.getRandomTimeframe(),
      reasoning: this.generateReasoning(action, symbol, confidence),
      profitPotential: Math.round(profitPotential * 100) / 100,
      riskLevel: this.getRiskLevel(confidence),
      marketConditions: this.getRandomMarketCondition(),
      technicalScore: Math.round((confidence + Math.random() * 10 - 5) * 100) / 100,
      fundamentalScore: Math.round((confidence + Math.random() * 10 - 5) * 100) / 100,
      sentimentScore: Math.round((confidence + Math.random() * 10 - 5) * 100) / 100,
      exchange: this.getRandomExchange(),
      timestamp: new Date()
    };

    this.testSignalCount++;
    console.log(`🧪 Señal de prueba #${this.testSignalCount} generada: ${symbol} ${action} @${currentPrice} (${confidence}%)`);

    // Retornar la señal para uso externo
    return testSignal;
  }

  /**
   * 📈 Simular movimiento de precio para resolver la señal
   */
  private simulatePriceMovement(
    symbol: string, 
    entryPrice: number, 
    targetPrice: number, 
    stopLoss: number, 
    action: 'BUY' | 'SELL'
  ): void {
    // 70% de las señales son exitosas (para simular buen rendimiento)
    const isSuccessful = Math.random() < 0.7;
    
    let finalPrice: number;
    
    if (isSuccessful) {
      // Precio alcanza el target (con algo de overshoot)
      const overshoot = (Math.random() - 0.5) * 0.005; // ±0.5%
      finalPrice = targetPrice * (1 + overshoot);
    } else {
      // Precio golpea el stop loss (con algo de slippage)
      const slippage = Math.random() * 0.003; // 0-0.3% slippage
      if (action === 'BUY') {
        finalPrice = stopLoss * (1 - slippage);
      } else {
        finalPrice = stopLoss * (1 + slippage);
      }
    }

    // Simular varios updates de precio durante el movimiento
    this.simulateIntermediatePrices(symbol, entryPrice, finalPrice, 5);
  }

  /**
   * 📊 Simular precios intermedios durante el movimiento
   */
  private simulateIntermediatePrices(
    symbol: string, 
    startPrice: number, 
    endPrice: number, 
    steps: number
  ): void {
    const priceStep = (endPrice - startPrice) / steps;
    
    for (let i = 1; i <= steps; i++) {
      setTimeout(() => {
        const intermediatePrice = startPrice + (priceStep * i);
        const noise = (Math.random() - 0.5) * 0.001; // Ruido de ±0.1%
        const noisyPrice = intermediatePrice * (1 + noise);
        
        // Simular que el precio se actualiza en el sistema
        advancedPredictionVerificationSystem.updatePrice(symbol, noisyPrice);
      }, i * 2000); // Update cada 2 segundos
    }
  }

  /**
   * 🎲 Obtener timeframe aleatorio
   */
  private getRandomTimeframe(): string {
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
    return timeframes[Math.floor(Math.random() * timeframes.length)];
  }

  /**
   * 🧠 Generar reasoning realista
   */
  private generateReasoning(action: 'BUY' | 'SELL', symbol: string, confidence: number): string {
    const reasons = [
      `${action} signal detected on ${symbol} with strong momentum`,
      `Technical indicators show ${action.toLowerCase()} opportunity on ${symbol}`,
      `${symbol} breaking ${action === 'BUY' ? 'above' : 'below'} key resistance level`,
      `Volume surge confirms ${action.toLowerCase()} signal for ${symbol}`,
      `${symbol} showing bullish divergence on RSI` 
    ];
    
    const confidenceNote = confidence > 90 ? ' with very high confidence' :
                          confidence > 80 ? ' with good confidence' : ' with moderate confidence';
    
    return reasons[Math.floor(Math.random() * reasons.length)] + confidenceNote;
  }

  /**
   * ⚖️ Obtener nivel de riesgo basado en confianza
   */
  private getRiskLevel(confidence: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (confidence >= 90) return 'LOW';
    if (confidence >= 80) return 'MEDIUM';
    return 'HIGH';
  }

  /**
   * 🌍 Obtener condición de mercado aleatoria
   */
  private getRandomMarketCondition(): string {
    const conditions = [
      'Trending bullish market',
      'Volatile market conditions',
      'Sideways consolidation',
      'Strong institutional buying',
      'Technical breakout pattern',
      'Oversold bounce potential'
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  /**
   * 🏦 Obtener exchange aleatorio
   */
  private getRandomExchange(): string {
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit', 'KuCoin'];
    return exchanges[Math.floor(Math.random() * exchanges.length)];
  }

  /**
   * 📊 Obtener estadísticas del generador
   */
  getStats(): { isRunning: boolean; signalsGenerated: number } {
    return {
      isRunning: this.isRunning,
      signalsGenerated: this.testSignalCount
    };
  }

  /**
   * 🧹 Reset counter
   */
  resetCounter(): void {
    this.testSignalCount = 0;
    console.log('🧹 Contador de señales de prueba reseteado');
  }
}

// Singleton export
export const predictionTestDataGenerator = new PredictionTestDataGenerator();

// Auto-start para desarrollo (comentar en producción)
if (typeof window !== 'undefined') {
  // Solo ejecutar en el navegador después de un pequeño delay
  setTimeout(() => {
    predictionTestDataGenerator.startGeneratingTestSignals();
  }, 3000);
}
