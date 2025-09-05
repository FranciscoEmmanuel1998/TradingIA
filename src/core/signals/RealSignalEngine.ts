// ⚡ SIGNAL ENGINE - Solo señales basadas en datos REALES
// EXTERMINIO COMPLETO de simulaciones

import { EventBus } from '../../circulation/channels/EventBus';
import { realMarketFeed } from '../feeds/RealMarketFeed';

interface RealSignal {
  symbol: string;
  action: 'BUY' | 'SELL';
  price: number;
  confidence: number;
  reasoning: string;
  timestamp: number;
  rsi: number;
  ema20: number;
  ema50: number;
  isValid: boolean;
}

export class RealSignalEngine {
  private eventBus: EventBus;
  private isActive: boolean = false;
  private generatedSignals: number = 0;
  private simulationKillSwitch: boolean = false;

  constructor() {
    this.eventBus = EventBus.getInstance();
    
    // ⚠️ KILL SWITCH: Si hay simulación activa, detener TODO
    if (process.env.ENABLE_SIMULATION === 'false') {
      this.simulationKillSwitch = true;
      console.log('🔥 KILL SWITCH ACTIVADO: Solo datos reales permitidos');
    }
  }

  // 🚀 Inicializar motor de señales REAL
  start(): void {
    console.log('⚡ REAL SIGNAL ENGINE: Iniciando - CERO simulaciones');
    
    // Verificar que no hay simulaciones
    this.verifyNoSimulation();
    
    this.isActive = true;
    
    // ⚠️ SOLO procesar eventos de precio REAL
    this.eventBus.subscribe('market.price_update', this.processRealPriceUpdate.bind(this));
    
    console.log('✅ REAL SIGNAL ENGINE: Activo - Solo procesará ticks auténticos');
  }

  stop(): void {
    this.isActive = false;
    // EventBus no tiene método off, solo emit y subscribe
    console.log('⏹️ REAL SIGNAL ENGINE: Detenido');
  }

  // 📊 Procesar actualización de precio REAL
  private processRealPriceUpdate(data: any): void {
    // ⚠️ VERIFICACIÓN CRÍTICA: Solo procesar si isValid=true
    if (!data.isValid) {
      console.warn(`⚠️ REJECTED: Tick inválido para ${data.symbol}`);
      return;
    }

    if (!this.isActive) return;

    try {
      const signal = this.generateRealSignal(data.symbol, data.price, data.timestamp);
      
      if (signal && signal.isValid) {
        this.generatedSignals++;
        
        console.log(`⚡ REAL SIGNAL: ${signal.action} ${signal.symbol} @ $${signal.price} (RSI: ${signal.rsi.toFixed(1)}, Confidence: ${signal.confidence}%)`);
        console.log(`   Reasoning: ${signal.reasoning}`);
        
        this.eventBus.emit('signal.generated', signal);
      }
      
    } catch (error) {
      console.error('❌ Error procesando precio real:', error);
    }
  }

  // 🎯 Generar señal basada SOLO en datos REALES
  private generateRealSignal(symbol: string, currentPrice: number, timestamp: number): RealSignal | null {
    // Obtener datos técnicos REALES (no simulados)
    const rsi = realMarketFeed.calculateRSI(symbol);
    const ema20 = realMarketFeed.calculateEMA(symbol, 20);
    const ema50 = realMarketFeed.calculateEMA(symbol, 50);
    
    // ⚠️ Si no hay suficientes datos REALES, NO generar señal
    if (rsi === null || ema20 === null || ema50 === null) {
      console.log(`⏸️ INSUFFICIENT REAL DATA: ${symbol} - Need more ticks`);
      return null;
    }

    // Lógica de señales basada en análisis técnico REAL
    let action: 'BUY' | 'SELL';
    let confidence: number;
    let reasoning: string;

    // Determinar acción basada en indicadores REALES
    if (this.shouldBuy(rsi, ema20, ema50, currentPrice)) {
      action = 'BUY';
      confidence = this.calculateBuyConfidence(rsi, ema20, ema50);
      reasoning = `RSI oversold (${rsi.toFixed(1)}) + EMA20 > EMA50 (${ema20.toFixed(2)} > ${ema50.toFixed(2)})`;
    } else if (this.shouldSell(rsi, ema20, ema50, currentPrice)) {
      action = 'SELL';
      confidence = this.calculateSellConfidence(rsi, ema20, ema50);
      reasoning = `RSI overbought (${rsi.toFixed(1)}) + EMA20 < EMA50 (${ema20.toFixed(2)} < ${ema50.toFixed(2)})`;
    } else {
      // No hay señal clara con datos actuales
      return null;
    }

    // Solo generar señales con confianza alta
    if (confidence < 70) {
      return null;
    }

    return {
      symbol,
      action,
      price: currentPrice,
      confidence,
      reasoning,
      timestamp,
      rsi,
      ema20,
      ema50,
      isValid: true
    };
  }

  // 📈 Lógica de compra basada en indicadores REALES
  private shouldBuy(rsi: number, ema20: number, ema50: number, price: number): boolean {
    return (
      rsi < 30 &&                    // RSI oversold
      ema20 > ema50 &&               // Tendencia alcista
      price > ema20 * 0.995          // Precio cerca de EMA20
    );
  }

  // 📉 Lógica de venta basada en indicadores REALES
  private shouldSell(rsi: number, ema20: number, ema50: number, price: number): boolean {
    return (
      rsi > 70 &&                    // RSI overbought
      ema20 < ema50 &&               // Tendencia bajista
      price < ema20 * 1.005          // Precio cerca de EMA20
    );
  }

  // 🎯 Calcular confianza de compra
  private calculateBuyConfidence(rsi: number, ema20: number, ema50: number): number {
    let confidence = 70; // Base
    
    // Bonus por RSI muy oversold
    if (rsi < 25) confidence += 15;
    if (rsi < 20) confidence += 10;
    
    // Bonus por separación de EMAs
    const emaSeparation = ((ema20 - ema50) / ema50) * 100;
    if (emaSeparation > 1) confidence += 10;
    if (emaSeparation > 2) confidence += 5;
    
    return Math.min(95, confidence);
  }

  // 🎯 Calcular confianza de venta
  private calculateSellConfidence(rsi: number, ema20: number, ema50: number): number {
    let confidence = 70; // Base
    
    // Bonus por RSI muy overbought
    if (rsi > 75) confidence += 15;
    if (rsi > 80) confidence += 10;
    
    // Bonus por separación de EMAs
    const emaSeparation = ((ema50 - ema20) / ema20) * 100;
    if (emaSeparation > 1) confidence += 10;
    if (emaSeparation > 2) confidence += 5;
    
    return Math.min(95, confidence);
  }

  // ⚠️ Verificar que NO hay simulaciones activas
  private verifyNoSimulation(): void {
    if (this.simulationKillSwitch) {
      try {
        realMarketFeed.verifyNoSimulation();
        console.log('✅ VERIFICATION PASSED: No simulation detected');
      } catch (error) {
        console.error('🚨 SIMULATION DETECTED - TERMINATING SYSTEM');
        process.exit(42); // Código de error específico para simulación
      }
    }
  }

  // 📊 Obtener estadísticas del motor
  getStats(): { generatedSignals: number, isActive: boolean } {
    return {
      generatedSignals: this.generatedSignals,
      isActive: this.isActive
    };
  }

  // 🔥 ELIMINAR CUALQUIER MÉTODO DE SIMULACIÓN
  // ❌ NO HAY generateRandomDecision()
  // ❌ NO HAY mockSignalGeneration()
  // ❌ NO HAY fakeLoop()
  // ❌ NO HAY 0.5 /* TODO: Connect to real data */
  // ⚡ SOLO DATOS REALES DE EXCHANGES
}

// Instancia global del motor real
export const realSignalEngine = new RealSignalEngine();
