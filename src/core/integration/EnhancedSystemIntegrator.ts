// 🔗 ENHANCED SYSTEM INTEGRATOR - Integrador del sistema optimizado
// Conecta el Enhanced Signal Generator con Free Data Aggregator

import { enhancedSignalGenerator, PremiumTradingSignal } from '../signals/EnhancedSignalGenerator';
import { freeDataAggregator, MarketDataPoint, TechnicalIndicators } from '../feeds/FreeDataAggregator';
import { EventBus } from '../../circulation/channels/EventBus';

interface IntegratedMarketData {
  symbol: string;
  marketData: MarketDataPoint;
  technicalData: TechnicalIndicators;
  qualityScore: number;
  dataAge: number; // milliseconds
  sources: string[];
}

interface SystemStatus {
  isActive: boolean;
  dataQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'OFFLINE';
  signalsGenerated: number;
  dataSourcesOnline: number;
  lastUpdate: Date;
  avgResponseTime: number;
  errorRate: number;
}

class EnhancedSystemIntegrator {
  private eventBus: EventBus;
  private isActive: boolean = false;
  private monitoredSymbols: string[] = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
    'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'
  ];
  
  private updateInterval: NodeJS.Timeout | null = null;
  private performanceMetrics = {
    signalsGenerated: 0,
    dataRequests: 0,
    errors: 0,
    avgResponseTime: 0,
    startTime: Date.now()
  };
  
  constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    this.eventBus.subscribe('premium_signal_generated', (signal: PremiumTradingSignal) => {
      this.performanceMetrics.signalsGenerated++;
      console.log(`🎯 Sistema integrado procesó señal: ${signal.symbol} ${signal.action}`);
    });
  }
  
  // 🚀 INICIAR SISTEMA INTEGRADO
  async start(): Promise<void> {
    console.log('🚀 Iniciando Enhanced Trading System...');
    
    try {
      // 1. Inicializar agregador de datos
      freeDataAggregator.start();
      await this.waitFor(1000);
      
      // 2. Verificar conectividad de datos
      const connectivity = await this.testDataConnectivity();
      if (!connectivity.success) {
        console.warn('⚠️ Algunos servicios de datos no están disponibles:', connectivity.errors);
      }
      
      // 3. Inicializar generador de señales
      enhancedSignalGenerator.start();
      await this.waitFor(1000);
      
      // 4. Comenzar monitoreo continuo
      this.startContinuousMonitoring();
      
      this.isActive = true;
      
      console.log('✅ Enhanced Trading System INICIADO exitosamente');
      console.log(`📊 Monitoreando ${this.monitoredSymbols.length} símbolos`);
      
      this.eventBus.emit('system_started', {
        symbols: this.monitoredSymbols,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('❌ Error iniciando sistema:', error);
      throw error;
    }
  }
  
  // ⏹️ DETENER SISTEMA
  stop(): void {
    console.log('⏹️ Deteniendo Enhanced Trading System...');
    
    this.isActive = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    enhancedSignalGenerator.stop();
    freeDataAggregator.stop();
    
    console.log('✅ Sistema detenido correctamente');
    
    this.eventBus.emit('system_stopped', {
      duration: Date.now() - this.performanceMetrics.startTime,
      signalsGenerated: this.performanceMetrics.signalsGenerated,
      timestamp: new Date()
    });
  }
  
  // 📊 MONITOREO CONTINUO
  private startContinuousMonitoring(): void {
    console.log('📊 Iniciando monitoreo continuo de mercados...');
    
    // Actualizar cada 30 segundos
    this.updateInterval = setInterval(async () => {
      if (!this.isActive) return;
      
      try {
        await this.performMarketScan();
      } catch (error) {
        console.error('❌ Error en monitoreo continuo:', error);
        this.performanceMetrics.errors++;
      }
    }, 30000);
    
    // Primera ejecución inmediata
    setTimeout(() => this.performMarketScan(), 2000);
  }
  
  // 🔍 ESCANEO DE MERCADO
  private async performMarketScan(): Promise<void> {
    const startTime = Date.now();
    console.log('🔍 Iniciando escaneo de mercado...');
    
    try {
      // 1. Obtener datos de todos los símbolos
      const marketDataPromises = this.monitoredSymbols.map(async (symbol) => {
        const marketData = await freeDataAggregator.getMarketData(symbol);
        const technicalData = await freeDataAggregator.getTechnicalIndicators(symbol);
        
        if (marketData && technicalData) {
          return this.createIntegratedData(symbol, marketData, technicalData);
        }
        return null;
      });
      
      const integratedDataArray = await Promise.all(marketDataPromises);
      const validData = integratedDataArray.filter(data => data !== null) as IntegratedMarketData[];
      
      console.log(`📊 Datos obtenidos para ${validData.length}/${this.monitoredSymbols.length} símbolos`);
      
      // 2. Procesar cada conjunto de datos
      for (const data of validData) {
        await this.processIntegratedData(data);
      }
      
      // 3. Actualizar métricas
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(responseTime);
      
      console.log(`✅ Escaneo completado en ${responseTime}ms`);
      
    } catch (error) {
      console.error('❌ Error en escaneo de mercado:', error);
      this.performanceMetrics.errors++;
    }
  }
  
  // 🔀 CREAR DATOS INTEGRADOS
  private createIntegratedData(
    symbol: string, 
    marketData: MarketDataPoint, 
    technicalData: TechnicalIndicators
  ): IntegratedMarketData {
    
    const qualityScore = this.calculateDataQuality(marketData, technicalData);
    const dataAge = Date.now() - marketData.timestamp.getTime();
    const sources = [marketData.source];
    
    return {
      symbol,
      marketData,
      technicalData,
      qualityScore,
      dataAge,
      sources
    };
  }
  
  // 📈 PROCESAR DATOS INTEGRADOS
  private async processIntegratedData(data: IntegratedMarketData): Promise<void> {
    // Solo procesar datos de alta calidad
    if (data.qualityScore < 70) {
      console.log(`⚠️ Calidad de datos baja para ${data.symbol}: ${data.qualityScore}%`);
      return;
    }
    
    // Enviar datos al generador de señales (simulando interfaz)
    this.eventBus.emit('market_data_processed', {
      symbol: data.symbol,
      price: data.marketData.price,
      volume: data.marketData.volume,
      change24h: data.marketData.changePercent24h,
      rsi: data.technicalData.rsi,
      macd: data.technicalData.macd,
      ema20: data.technicalData.ema20,
      ema50: data.technicalData.ema50,
      support: data.technicalData.support,
      resistance: data.technicalData.resistance,
      volatility: Math.abs(data.marketData.changePercent24h) / 100,
      timestamp: new Date()
    });
    
    // Log de calidad de datos
    if (data.qualityScore >= 90) {
      console.log(`✨ Datos excelentes para ${data.symbol} (${data.qualityScore}%)`);
    }
  }
  
  // 📊 CALCULAR CALIDAD DE DATOS
  private calculateDataQuality(marketData: MarketDataPoint, technicalData: TechnicalIndicators): number {
    let score = 100;
    
    // Penalizar por edad de datos
    const dataAge = Date.now() - marketData.timestamp.getTime();
    if (dataAge > 300000) score -= 20; // -20 si >5 min
    else if (dataAge > 60000) score -= 10; // -10 si >1 min
    
    // Penalizar por datos faltantes
    if (!marketData.price || marketData.price <= 0) score -= 30;
    if (!marketData.volume || marketData.volume <= 0) score -= 15;
    if (!technicalData.rsi || technicalData.rsi <= 0) score -= 10;
    if (!technicalData.macd) score -= 5;
    
    // Bonificar por consistencia
    if (marketData.source === 'cryptocompare' || marketData.source === 'alphavantage') {
      score += 5; // APIs más confiables
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  // 🧪 PROBAR CONECTIVIDAD
  private async testDataConnectivity(): Promise<{ success: boolean; errors: string[] }> {
    console.log('🧪 Probando conectividad de fuentes de datos...');
    
    const errors: string[] = [];
    const testSymbols = ['BTCUSDT', 'AAPL'];
    
    for (const symbol of testSymbols) {
      try {
        const data = await freeDataAggregator.getMarketData(symbol);
        if (!data) {
          errors.push(`No se pudieron obtener datos para ${symbol}`);
        } else {
          console.log(`✅ Conectividad OK para ${symbol} (fuente: ${data.source})`);
        }
      } catch (error) {
        errors.push(`Error conectando para ${symbol}: ${error}`);
      }
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }
  
  // 📊 OBTENER ESTADO DEL SISTEMA
  getSystemStatus(): SystemStatus {
    const dataStatus = freeDataAggregator.getStatus();
    const uptime = Date.now() - this.performanceMetrics.startTime;
    const errorRate = this.performanceMetrics.dataRequests > 0 ? 
      (this.performanceMetrics.errors / this.performanceMetrics.dataRequests) * 100 : 0;
    
    let dataQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'OFFLINE' = 'OFFLINE';
    if (this.isActive && dataStatus.sources.some(s => s.isActive)) {
      if (errorRate < 5) dataQuality = 'EXCELLENT';
      else if (errorRate < 15) dataQuality = 'GOOD';
      else dataQuality = 'POOR';
    }
    
    return {
      isActive: this.isActive,
      dataQuality,
      signalsGenerated: this.performanceMetrics.signalsGenerated,
      dataSourcesOnline: dataStatus.sources.filter(s => s.isActive).length,
      lastUpdate: new Date(),
      avgResponseTime: this.performanceMetrics.avgResponseTime,
      errorRate: Math.round(errorRate * 100) / 100
    };
  }
  
  // 📊 OBTENER ESTADÍSTICAS DETALLADAS
  getDetailedStats(): any {
    const systemStatus = this.getSystemStatus();
    const dataStatus = freeDataAggregator.getStatus();
    const signalMetrics = enhancedSignalGenerator.getPerformanceMetrics();
    
    return {
      system: systemStatus,
      dataAggregator: dataStatus,
      signalGenerator: signalMetrics,
      performance: {
        uptime: Date.now() - this.performanceMetrics.startTime,
        totalDataRequests: this.performanceMetrics.dataRequests,
        totalErrors: this.performanceMetrics.errors,
        avgResponseTime: this.performanceMetrics.avgResponseTime
      },
      monitoredSymbols: this.monitoredSymbols
    };
  }
  
  // 🔧 MÉTODOS AUXILIARES
  private updatePerformanceMetrics(responseTime: number): void {
    this.performanceMetrics.dataRequests++;
    this.performanceMetrics.avgResponseTime = 
      (this.performanceMetrics.avgResponseTime + responseTime) / 2;
  }
  
  private waitFor(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // 📊 MÉTODOS PÚBLICOS ADICIONALES
  addSymbol(symbol: string): void {
    if (!this.monitoredSymbols.includes(symbol)) {
      this.monitoredSymbols.push(symbol);
      console.log(`➕ Símbolo ${symbol} agregado al monitoreo`);
    }
  }
  
  removeSymbol(symbol: string): void {
    const index = this.monitoredSymbols.indexOf(symbol);
    if (index > -1) {
      this.monitoredSymbols.splice(index, 1);
      console.log(`➖ Símbolo ${symbol} removido del monitoreo`);
    }
  }
  
  getMonitoredSymbols(): string[] {
    return [...this.monitoredSymbols];
  }
  
  async forceMarketScan(): Promise<void> {
    console.log('🔄 Forzando escaneo manual de mercado...');
    await this.performMarketScan();
  }
}

// Exportar instancia singleton
export const enhancedSystemIntegrator = new EnhancedSystemIntegrator();
export type { IntegratedMarketData, SystemStatus };
