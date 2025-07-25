// ⚡ REAL EXECUTION ENGINE - Motor de Ejecución REAL (NO SIMULADO)
// Sistema que ejecuta órdenes REALES en exchanges verificados

import { EventBus } from '../../circulation/channels/EventBus';
import { KrakenConnector } from '../exchanges/KrakenConnector';
import { CoinbaseAdvancedConnector } from '../exchanges/CoinbaseAdvancedConnector';
import { KuCoinConnector } from '../exchanges/KuCoinConnector';
import { realBalanceVerifier, RealBalance } from '../verification/RealBalanceVerifier';
import { systemGuard } from '../security/SystemGuard';
import { notificationSystem } from './alerts/NotificationSystem';

export interface RealOrderRequest {
  exchange: 'kraken' | 'coinbase' | 'kucoin';
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: number;
  price?: number; // Solo para órdenes limit
  stopLoss?: number;
  takeProfit?: number;
}

export interface RealOrderResult {
  success: boolean;
  orderId?: string;
  exchange: string;
  symbol: string;
  side: string;
  quantity: number;
  price?: number;
  timestamp: Date;
  error?: string;
  realBalance?: RealBalance[];
}

export interface RealExecutionSummary {
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  totalVolume: number;
  exchanges: string[];
  lastExecution: Date | null;
}

export class RealExecutionEngine {
  private static instance: RealExecutionEngine;
  private eventBus: EventBus;
  private executionHistory: RealOrderResult[] = [];
  private isEnabled: boolean = false;

  // Referencias a conectores (se inicializan bajo demanda)
  private krakenConnector: KrakenConnector | null = null;
  private coinbaseConnector: CoinbaseAdvancedConnector | null = null;
  private kuCoinConnector: KuCoinConnector | null = null;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    
    // Solo habilitar si NO hay simulaciones
    if (process.env.ENABLE_SIMULATION === 'false') {
      this.isEnabled = true;
      console.log('⚡ RealExecutionEngine: HABILITADO - Modo de ejecución real');
    } else {
      console.warn('⚡ RealExecutionEngine: DESHABILITADO - Simulaciones detectadas');
    }
  }

  static getInstance(): RealExecutionEngine {
    if (!RealExecutionEngine.instance) {
      RealExecutionEngine.instance = new RealExecutionEngine();
    }
    return RealExecutionEngine.instance;
  }

  // 🔧 Inicializar con conectores reales
  initializeWithConnectors(connectors: {
    kraken?: KrakenConnector;
    coinbase?: CoinbaseAdvancedConnector;
    kucoin?: KuCoinConnector;
  }): void {
    
    this.krakenConnector = connectors.kraken || null;
    this.coinbaseConnector = connectors.coinbase || null;
    this.kuCoinConnector = connectors.kucoin || null;

    console.log('🔧 RealExecutionEngine: Conectores inicializados');
    this.eventBus.emit('execution.engine.initialized', {
      kraken: !!this.krakenConnector,
      coinbase: !!this.coinbaseConnector,
      kucoin: !!this.kuCoinConnector
    });
  }

  // 🚨 Verificar que NO hay simulaciones antes de ejecutar
  private verifyNoSimulation(): void {
    if (process.env.ENABLE_SIMULATION !== 'false') {
      throw new Error('🚨 EXECUTION BLOCKED: Simulaciones detectadas en el entorno');
    }

    if (!this.isEnabled) {
      throw new Error('🚨 EXECUTION BLOCKED: Motor de ejecución real deshabilitado');
    }

    // Verificar System Guard
    const guardStatus = systemGuard.getStatus();
    if (!guardStatus.enabled) {
      throw new Error('🚨 EXECUTION BLOCKED: System Guard no está activo');
    }
  }

  // ⚡ Ejecutar orden REAL
  async executeRealOrder(orderRequest: RealOrderRequest): Promise<RealOrderResult> {
    console.log('⚡ Ejecutando orden REAL:', orderRequest);

    try {
      // 1. Verificar que NO hay simulaciones
      this.verifyNoSimulation();

      // 2. Verificar balances reales antes de ejecutar
      const balanceCheck = await realBalanceVerifier.verifyAllRealBalances();
      if (!balanceCheck.success) {
        throw new Error('No se pudieron verificar saldos reales en exchanges');
      }

      // 3. Ejecutar orden según exchange
      let result: RealOrderResult;

      switch (orderRequest.exchange) {
        case 'kraken':
          result = await this.executeKrakenOrder(orderRequest);
          break;
        case 'coinbase':
          result = await this.executeCoinbaseOrder(orderRequest);
          break;
        case 'kucoin':
          result = await this.executeKuCoinOrder(orderRequest);
          break;
        default:
          throw new Error(`Exchange no soportado: ${orderRequest.exchange}`);
      }

      // 4. Registrar resultado
      result.realBalance = balanceCheck.balances;
      this.executionHistory.push(result);

      // 5. Emitir evento de ejecución
      this.eventBus.emit('execution.order.completed', result);

      console.log('✅ Orden REAL ejecutada:', result);
      return result;

    } catch (error) {
      const errorResult: RealOrderResult = {
        success: false,
        exchange: orderRequest.exchange,
        symbol: orderRequest.symbol,
        side: orderRequest.side,
        quantity: orderRequest.quantity,
        price: orderRequest.price,
        timestamp: new Date(),
        error: error.message
      };

      this.executionHistory.push(errorResult);
      this.eventBus.emit('execution.order.failed', errorResult);

      console.error('❌ Error ejecutando orden REAL:', error.message);
      return errorResult;
    }
  }

  // 🔱 Ejecutar en Kraken
  private async executeKrakenOrder(order: RealOrderRequest): Promise<RealOrderResult> {
    if (!this.krakenConnector) {
      throw new Error('Kraken connector no inicializado');
    }

    const status = this.krakenConnector.getConnectionStatus();
    if (!status.connected) {
      throw new Error('Kraken no está conectado');
    }

    try {
      console.log('🔱 Ejecutando orden real en Kraken...');

      const response = await this.krakenConnector.placeOrder(
        order.symbol,
        order.side,
        order.quantity,
        order.price
      );

      return {
        success: true,
        orderId: response.txid[0],
        exchange: 'kraken',
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: order.price,
        timestamp: new Date()
      };

    } catch (error) {
      throw new Error(`Error en Kraken: ${error.message}`);
    }
  }

  // 🔵 Ejecutar en Coinbase
  private async executeCoinbaseOrder(order: RealOrderRequest): Promise<RealOrderResult> {
    if (!this.coinbaseConnector) {
      throw new Error('Coinbase connector no inicializado');
    }

    const status = this.coinbaseConnector.getConnectionStatus();
    if (!status.connected) {
      throw new Error('Coinbase no está conectado');
    }

    try {
      console.log('🔵 Ejecutando orden real en Coinbase...');

      const response = await this.coinbaseConnector.placeOrder(
        order.symbol,
        order.side,
        order.quantity,
        order.price
      );

      return {
        success: true,
        orderId: response.order_id,
        exchange: 'coinbase',
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: order.price,
        timestamp: new Date()
      };

    } catch (error) {
      throw new Error(`Error en Coinbase: ${error.message}`);
    }
  }

  // 🟡 Ejecutar en KuCoin
  private async executeKuCoinOrder(order: RealOrderRequest): Promise<RealOrderResult> {
    if (!this.kuCoinConnector) {
      throw new Error('KuCoin connector no inicializado');
    }

    const status = this.kuCoinConnector.getConnectionStatus();
    if (!status.connected) {
      throw new Error('KuCoin no está conectado');
    }

    try {
      console.log('🟡 Ejecutando orden real en KuCoin...');

      const response = await this.kuCoinConnector.placeOrder(
        order.symbol,
        order.side,
        order.quantity.toString(),
        order.price ? order.price.toString() : undefined,
        order.type
      );

      return {
        success: true,
        orderId: response.orderId,
        exchange: 'kucoin',
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: order.price,
        timestamp: new Date()
      };

    } catch (error) {
      throw new Error(`Error en KuCoin: ${error.message}`);
    }
  }

  // 📊 Obtener resumen de ejecuciones
  getExecutionSummary(): RealExecutionSummary {
    const successful = this.executionHistory.filter(order => order.success);
    const failed = this.executionHistory.filter(order => !order.success);
    const totalVolume = successful.reduce((sum, order) => sum + order.quantity, 0);
    const exchanges = [...new Set(this.executionHistory.map(order => order.exchange))];

    return {
      totalOrders: this.executionHistory.length,
      successfulOrders: successful.length,
      failedOrders: failed.length,
      totalVolume,
      exchanges,
      lastExecution: this.executionHistory.length > 0 
        ? this.executionHistory[this.executionHistory.length - 1].timestamp 
        : null
    };
  }

  // 📋 Obtener historial de ejecuciones
  getExecutionHistory(limit?: number): RealOrderResult[] {
    const history = [...this.executionHistory].reverse(); // Más recientes primero
    return limit ? history.slice(0, limit) : history;
  }

  // 🔒 Verificar que el motor está habilitado
  isExecutionEnabled(): boolean {
    return this.isEnabled && process.env.ENABLE_SIMULATION === 'false';
  }

  // 🧹 Limpiar historial (solo para testing)
  clearHistory(): void {
    console.warn('⚠️ Limpiando historial de ejecución real');
    this.executionHistory = [];
  }

  // 🚨 Desactivar ejecución de emergencia
  emergencyStop(): void {
    console.error('🚨 EMERGENCY STOP: Desactivando motor de ejecución real');
    this.isEnabled = false;
    this.eventBus.emit('execution.emergency.stop', { timestamp: new Date() });
  }
}

// Instancia global
export const realExecutionEngine = RealExecutionEngine.getInstance();

// Auto-configurar si está en modo real
if (process.env.ENABLE_SIMULATION === 'false') {
  console.log('⚡ RealExecutionEngine: Configurado para modo de ejecución real');
}
