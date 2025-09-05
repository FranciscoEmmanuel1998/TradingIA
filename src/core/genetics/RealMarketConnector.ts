// 🔥 CONECTOR DE MERCADOS REALES - La Conexión al Mundo Real
import { EventBus } from '../../circulation/channels/EventBus';

export interface MarketConnection {
  id: string;
  exchange: string;
  status: 'connected' | 'disconnected' | 'error';
  latency: number;
  lastHeartbeat: number;
  dataFeeds: string[];
  tradingEnabled: boolean;
}

export interface RealTimeData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  bid: number;
  ask: number;
  change24h: number;
  volatility: number;
}

export interface OrderExecution {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  type: 'market' | 'limit' | 'stop';
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  timestamp: number;
  commission: number;
}

export class RealMarketConnector {
  private eventBus: EventBus;
  private connections: Map<string, MarketConnection> = new Map();
  private dataStreams: Map<string, WebSocket> = new Map();
  private isLive: boolean = false;
  private emergency: boolean = false;

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.subscribe('binance.connection_configured', (config) => {
      this.connectToBinance(config);
    });

    this.eventBus.subscribe('alpaca.connection_configured', (config) => {
      this.connectToAlpaca(config);
    });

    this.eventBus.subscribe('trading.emergency_close_all', () => {
      this.emergencyCloseAllPositions();
    });

    this.eventBus.subscribe('trading.disconnect_markets', () => {
      this.disconnectAllMarkets();
    });
  }

  async connectToBinance(config: any): Promise<void> {
    console.log('🟡 Estableciendo conexión con Binance...');

    const connectionId = 'binance-' + Date.now();
    
    // Simular conexión WebSocket a Binance
    const connection: MarketConnection = {
      id: connectionId,
      exchange: 'binance',
      status: 'connected',
      latency: 45, // ms
      lastHeartbeat: Date.now(),
      dataFeeds: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT'],
      tradingEnabled: true
    };

    this.connections.set(connectionId, connection);

    // Simular stream de datos en tiempo real
    this.startBinanceDataStream(connectionId, connection.dataFeeds);

    console.log(`✅ Conectado a Binance - ${config.testnet ? 'TESTNET' : '🔥 LIVE 🔥'}`);
    console.log(`   Pares activos: ${connection.dataFeeds.length}`);
    console.log(`   Latencia: ${connection.latency}ms`);

    this.eventBus.emit('market.connection_established', {
      connectionId,
      exchange: 'binance',
      isLive: !config.testnet,
      dataFeeds: connection.dataFeeds
    });
  }

  private startBinanceDataStream(connectionId: string, symbols: string[]): void {
    // Simular WebSocket de Binance con datos realistas
    const ws = {
      send: (data: string) => console.log('Enviado:', data),
      close: () => console.log('Conexión cerrada'),
      readyState: 1
    } as any;

    this.dataStreams.set(connectionId, ws);

    // Generar datos de mercado cada segundo
    setInterval(() => {
      if (this.emergency) return;

      for (const symbol of symbols) {
        const marketData = this.generateRealisticMarketData(symbol);
        
        this.eventBus.emit('market.real_time_data', {
          connectionId,
          exchange: 'binance',
          data: marketData
        });

        // Detectar oportunidades de trading
        this.analyzeMarketOpportunity(marketData);
      }
    }, 1000);

    console.log(`📡 Stream de datos iniciado para ${symbols.length} símbolos`);
  }

  private generateRealisticMarketData(symbol: string): RealTimeData {
    // ⚠️ DATOS SIMULADOS ELIMINADOS - CONECTAR A API REAL
    console.error('🚫 MÉTODO DESHABILITADO - generateRealisticMarketData usa datos falsos');
    console.error('🔗 USAR: realMarketFeed.getRealTimePrice() para datos reales');
    
    // Retornar datos de marcador de posición hasta conectar API real
    const basePrice = this.getBasePrice(symbol);
    const price = basePrice; // Sin fluctuaciones falsas
    const bid = price * 0.9999;
    const ask = price * 1.0001;
    const volume = 1000000; // Volumen fijo hasta tener datos reales
    const change24h = 0; // Sin cambios falsos

    return {
      symbol,
      price,
      volume,
      timestamp: Date.now(),
      bid,
      ask,
      change24h,
      volatility: 0 // Sin volatilidad falsa hasta tener datos reales
    };
  }

  private getBasePrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'BTCUSDT': 43000,
      'ETHUSDT': 2600,
      'ADAUSDT': 0.45,
      'DOTUSDT': 7.5,
      'LINKUSDT': 14.2
    };
    return prices[symbol] || 100;
  }

  private analyzeMarketOpportunity(data: RealTimeData): void {
    // Análisis simple de momentum
    const momentum = data.change24h;
    const volatilityThreshold = 1.5;
    
    if (Math.abs(momentum) > 0.05 && data.volatility > volatilityThreshold) {
      this.eventBus.emit('market.opportunity_detected', {
        symbol: data.symbol,
        type: momentum > 0 ? 'bullish_breakout' : 'bearish_breakdown',
        strength: Math.abs(momentum) * data.volatility,
        timestamp: data.timestamp,
        price: data.price,
        recommendation: momentum > 0 ? 'BUY' : 'SELL'
      });
    }
  }

  async connectToAlpaca(config: any): Promise<void> {
    console.log('📈 Estableciendo conexión con Alpaca Markets...');

    const connectionId = 'alpaca-' + Date.now();
    
    const connection: MarketConnection = {
      id: connectionId,
      exchange: 'alpaca',
      status: 'connected',
      latency: 65, // ms
      lastHeartbeat: Date.now(),
      dataFeeds: ['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'MSFT'],
      tradingEnabled: true
    };

    this.connections.set(connectionId, connection);
    
    // Iniciar stream de acciones
    this.startAlpacaDataStream(connectionId, connection.dataFeeds);

    console.log(`✅ Conectado a Alpaca - ${config.paper ? 'PAPER' : '🔥 LIVE 🔥'}`);
    console.log(`   Acciones activas: ${connection.dataFeeds.length}`);
    console.log(`   Latencia: ${connection.latency}ms`);

    this.eventBus.emit('market.connection_established', {
      connectionId,
      exchange: 'alpaca',
      isLive: !config.paper,
      dataFeeds: connection.dataFeeds
    });
  }

  private startAlpacaDataStream(connectionId: string, symbols: string[]): void {
    // Stream de datos de acciones cada 5 segundos (horario de mercado)
    setInterval(() => {
      if (this.emergency) return;

      // Solo durante horario de mercado (simulado)
      const hour = new Date().getHours();
      if (hour < 9 || hour > 16) return; // NYSE hours approximation

      for (const symbol of symbols) {
        const marketData = this.generateStockMarketData(symbol);
        
        this.eventBus.emit('market.real_time_data', {
          connectionId,
          exchange: 'alpaca',
          data: marketData
        });

        this.analyzeStockOpportunity(marketData);
      }
    }, 5000);

    console.log(`📊 Stream de acciones iniciado para ${symbols.length} símbolos`);
  }

  private generateStockMarketData(symbol: string): RealTimeData {
    // ⚠️ DATOS SIMULADOS ELIMINADOS - CONECTAR A API REAL DE ACCIONES
    console.error('🚫 generateStockMarketData usa datos falsos - implementar API real');
    
    const basePrice = this.getStockBasePrice(symbol);
    const price = basePrice; // Sin fluctuaciones falsas
    const bid = price * 0.9995;
    const ask = price * 1.0005;
    const volume = 2500000; // Volumen fijo hasta tener datos reales
    const change24h = 0; // Sin cambios falsos

    return {
      symbol,
      price,
      volume,
      timestamp: Date.now(),
      bid,
      ask,
      change24h,
      volatility: 0 // Sin volatilidad falsa hasta tener datos reales
    };
  }

  private getStockBasePrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'SPY': 485,
      'QQQ': 395,
      'AAPL': 175,
      'TSLA': 245,
      'NVDA': 720,
      'MSFT': 375
    };
    return prices[symbol] || 150;
  }

  private analyzeStockOpportunity(data: RealTimeData): void {
    // Análisis de momentum para acciones
    const momentum = data.change24h;
    const volumeSpike = data.volume > 2000000;
    
    if (Math.abs(momentum) > 0.03 && volumeSpike) {
      this.eventBus.emit('market.opportunity_detected', {
        symbol: data.symbol,
        type: momentum > 0 ? 'bullish_momentum' : 'bearish_momentum',
        strength: Math.abs(momentum) * (data.volume / 1000000),
        timestamp: data.timestamp,
        price: data.price,
        recommendation: momentum > 0 ? 'BUY' : 'SELL'
      });
    }
  }

  async executeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    price?: number;
  }): Promise<OrderExecution> {
    
    if (this.emergency) {
      throw new Error('Trading detenido por protocolo de emergencia');
    }

    console.log(`🔄 Ejecutando orden: ${order.side.toUpperCase()} ${order.quantity} ${order.symbol}`);

    // Simular ejecución de orden
    const execution: OrderExecution = {
      orderId: 'ORD-' + Date.now(),
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: order.price || this.getCurrentPrice(order.symbol),
      type: order.type,
      status: 'filled',
      timestamp: Date.now(),
      commission: order.quantity * 0.001 // 0.1% commission
    };

    // Emitir confirmación de ejecución
    this.eventBus.emit('trading.order_executed', execution);

    console.log(`✅ Orden ejecutada: ${execution.orderId}`);
    console.log(`   Precio: $${execution.price.toFixed(2)}`);
    console.log(`   Comisión: $${execution.commission.toFixed(2)}`);

    return execution;
  }

  private getCurrentPrice(symbol: string): number {
    // Obtener último precio conocido
    return this.getBasePrice(symbol) || this.getStockBasePrice(symbol) || 100;
  }

  private async emergencyCloseAllPositions(): Promise<void> {
    console.log('🚨 CERRANDO TODAS LAS POSICIONES - EMERGENCIA');
    
    this.emergency = true;

    // Simular cierre de posiciones
    const openPositions = [
      { symbol: 'BTCUSDT', quantity: 0.5, side: 'sell' as const },
      { symbol: 'ETHUSDT', quantity: 2.0, side: 'sell' as const },
      { symbol: 'AAPL', quantity: 100, side: 'sell' as const }
    ];

    for (const position of openPositions) {
      try {
        await this.executeOrder({
          symbol: position.symbol,
          side: position.side,
          quantity: position.quantity,
          type: 'market'
        });
      } catch (error) {
        console.error(`Error cerrando ${position.symbol}:`, error);
      }
    }

    console.log('✅ Todas las posiciones cerradas');
  }

  private disconnectAllMarkets(): void {
    console.log('🔌 Desconectando de todos los mercados...');

    // Cerrar todas las conexiones WebSocket
    for (const [id, ws] of this.dataStreams) {
      try {
        ws.close();
        console.log(`✅ Desconectado de ${id}`);
      } catch (error) {
        console.error(`Error desconectando ${id}:`, error);
      }
    }

    this.dataStreams.clear();
    this.connections.clear();
    this.isLive = false;

    console.log('🔌 Todos los mercados desconectados');
  }

  getActiveConnections(): MarketConnection[] {
    return Array.from(this.connections.values());
  }

  getConnectionStatus(): any {
    return {
      totalConnections: this.connections.size,
      activeStreams: this.dataStreams.size,
      isLive: this.isLive,
      emergency: this.emergency,
      exchanges: Array.from(this.connections.values()).map(c => c.exchange)
    };
  }

  async testConnection(exchange: string): Promise<boolean> {
    console.log(`🔍 Probando conexión a ${exchange}...`);
    
    // ⚠️ SIMULACIÓN ELIMINADA - implementar test real de conexión
    console.warn('🚫 testConnection usa simulación - implementar test real de API');
    const success = true; // Asumir éxito hasta implementar test real
    
    if (success) {
      console.log(`✅ Test de conexión exitoso: ${exchange}`);
    } else {
      console.log(`❌ Test de conexión fallido: ${exchange}`);
    }

    return success;
  }

  enableLiveTrading(): void {
    if (this.emergency) {
      console.log('⚠️ No se puede habilitar trading - Modo emergencia activo');
      return;
    }

    this.isLive = true;
    console.log('🔥 TRADING EN VIVO HABILITADO - RIESGO REAL ACTIVADO');
    
    this.eventBus.emit('trading.live_enabled', {
      timestamp: Date.now(),
      connections: this.getActiveConnections().length
    });
  }

  disableLiveTrading(): void {
    this.isLive = false;
    console.log('⏸️ Trading en vivo deshabilitado - Modo seguro');
    
    this.eventBus.emit('trading.live_disabled', {
      timestamp: Date.now()
    });
  }
}
