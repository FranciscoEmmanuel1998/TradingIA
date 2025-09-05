// 🛡️ MÓDULO DE INMUNIDAD AL RIESGO - Sistema de Protección Brutal
import { EventBus } from '../../circulation/channels/EventBus';

export interface RiskLimit {
  id: string;
  type: 'position_size' | 'daily_loss' | 'correlation' | 'liquidity' | 'volatility' | 'drawdown';
  value: number;
  isHard: boolean; // true = block trade, false = warn only
  description: string;
}

export interface RiskViolation {
  id: string;
  limitId: string;
  severity: 'warning' | 'critical' | 'fatal';
  actualValue: number;
  limitValue: number;
  action: 'blocked' | 'reduced' | 'warned';
  timestamp: number;
  context: any;
}

export interface TradeRequest {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  strategy: string;
  hypothesisId?: string;
}

export interface RiskAssessment {
  approved: boolean;
  modifiedSize?: number;
  violations: RiskViolation[];
  riskScore: number; // 0-1, donde 1 = máximo riesgo
  recommendation: 'execute' | 'reduce' | 'reject' | 'delay';
}

export class RiskImmunityModule {
  private limits: Map<string, RiskLimit>;
  private violations: RiskViolation[];
  private eventBus: EventBus;
  private portfolioState: {
    totalEquity: number;
    positions: Map<string, { size: number; avgPrice: number; pnl: number }>;
    dailyPnL: number;
    maxDrawdown: number;
  };

  constructor() {
    this.limits = new Map();
    this.violations = [];
    this.eventBus = EventBus.getInstance();
    this.portfolioState = {
      totalEquity: 100000, // $100k inicial
      positions: new Map(),
      dailyPnL: 0,
      maxDrawdown: 0
    };
    
    this.initializeDefaultLimits();
  }

  async initialize(): Promise<void> {
    console.log('🛡️ RiskImmunityModule: Inicializando sistema inmune...');
    
    // Suscribirse a eventos críticos
    this.eventBus.subscribe('execution.trade_request', this.assessTradeRisk.bind(this));
    this.eventBus.subscribe('market.volatility_spike', this.handleVolatilitySpike.bind(this));
    this.eventBus.subscribe('portfolio.update', (data: any) => {
      this.portfolioState = { ...this.portfolioState, ...data };
    });
    
    // Monitoreo continuo cada 10 segundos
    setInterval(() => {
      this.performRiskScan();
      this.checkSystemHealth();
    }, 10000);

    console.log('✅ RiskImmunityModule: Sistema inmune activo - DEFCON 2');
  }

  private initializeDefaultLimits(): void {
    const defaultLimits: Omit<RiskLimit, 'id'>[] = [
      {
        type: 'position_size',
        value: 0.10, // Máximo 10% del equity por posición
        isHard: true,
        description: 'Límite de tamaño de posición individual'
      },
      {
        type: 'daily_loss',
        value: 0.05, // Máximo 5% pérdida diaria
        isHard: true,
        description: 'Límite de pérdida diaria'
      },
      {
        type: 'drawdown',
        value: 0.15, // Máximo 15% drawdown
        isHard: true,
        description: 'Límite de drawdown máximo'
      },
      {
        type: 'correlation',
        value: 0.7, // Máximo 70% correlación entre posiciones
        isHard: false,
        description: 'Límite de correlación entre activos'
      },
      {
        type: 'volatility',
        value: 0.05, // Máximo 5% volatilidad diaria por activo
        isHard: false,
        description: 'Límite de volatilidad por activo'
      },
      {
        type: 'liquidity',
        value: 100000, // Mínimo $100k volumen diario
        isHard: true,
        description: 'Límite mínimo de liquidez'
      }
    ];

    defaultLimits.forEach(limit => {
      const id = `limit_${limit.type}_${Date.now()}`;
      this.limits.set(id, { ...limit, id });
    });
  }

  async assessTradeRisk(tradeRequest: TradeRequest): Promise<RiskAssessment> {
    console.log(`🛡️ Evaluando riesgo para trade: ${tradeRequest.symbol} ${tradeRequest.side} ${tradeRequest.size}`);

    const assessment: RiskAssessment = {
      approved: true,
      violations: [],
      riskScore: 0,
      recommendation: 'execute'
    };

    // Evaluaciones secuenciales
    this.assessPositionSizeRisk(tradeRequest, assessment);
    this.assessDailyLossRisk(tradeRequest, assessment);
    this.assessDrawdownRisk(tradeRequest, assessment);
    this.assessCorrelationRisk(tradeRequest, assessment);
    this.assessVolatilityRisk(tradeRequest, assessment);
    this.assessLiquidityRisk(tradeRequest, assessment);

    // Calcular score de riesgo total
    assessment.riskScore = this.calculateOverallRiskScore(assessment);

    // Decisión final
    this.makeRiskDecision(assessment);

    // Registrar violaciones
    assessment.violations.forEach(violation => {
      this.violations.push(violation);
      this.eventBus.emit('risk.violation', violation);
    });

    // Logs y notificaciones
    if (!assessment.approved) {
      console.log(`🚨 TRADE BLOQUEADO: ${tradeRequest.symbol} - ${assessment.violations.length} violaciones`);
      this.eventBus.emit('risk.trade_blocked', { tradeRequest, assessment });
    } else if (assessment.modifiedSize) {
      console.log(`⚠️ TRADE REDUCIDO: ${tradeRequest.symbol} - Size: ${tradeRequest.size} → ${assessment.modifiedSize}`);
    }

    return assessment;
  }

  private assessPositionSizeRisk(trade: TradeRequest, assessment: RiskAssessment): void {
    const positionValue = trade.size * trade.price;
    const portfolioPercentage = positionValue / this.portfolioState.totalEquity;
    
    const limit = this.findLimit('position_size');
    if (limit && portfolioPercentage > limit.value) {
      const violation: RiskViolation = {
        id: `violation_${Date.now()}`,
        limitId: limit.id,
        severity: limit.isHard ? 'fatal' : 'warning',
        actualValue: portfolioPercentage,
        limitValue: limit.value,
        action: limit.isHard ? 'blocked' : 'warned',
        timestamp: Date.now(),
        context: { trade, portfolioPercentage }
      };

      assessment.violations.push(violation);

      if (limit.isHard) {
        // Reducir tamaño para cumplir límite
        const maxSize = (limit.value * this.portfolioState.totalEquity) / trade.price;
        assessment.modifiedSize = maxSize;
        assessment.recommendation = 'reduce';
      }
    }
  }

  private assessDailyLossRisk(trade: TradeRequest, assessment: RiskAssessment): void {
    const currentDailyLoss = Math.abs(Math.min(0, this.portfolioState.dailyPnL));
    const dailyLossPercentage = currentDailyLoss / this.portfolioState.totalEquity;
    
    const limit = this.findLimit('daily_loss');
    if (limit && dailyLossPercentage > limit.value) {
      const violation: RiskViolation = {
        id: `violation_${Date.now()}`,
        limitId: limit.id,
        severity: 'fatal',
        actualValue: dailyLossPercentage,
        limitValue: limit.value,
        action: 'blocked',
        timestamp: Date.now(),
        context: { dailyPnL: this.portfolioState.dailyPnL }
      };

      assessment.violations.push(violation);
      assessment.approved = false;
      assessment.recommendation = 'reject';
    }
  }

  private assessDrawdownRisk(trade: TradeRequest, assessment: RiskAssessment): void {
    const currentDrawdown = this.portfolioState.maxDrawdown;
    
    const limit = this.findLimit('drawdown');
    if (limit && currentDrawdown > limit.value) {
      const violation: RiskViolation = {
        id: `violation_${Date.now()}`,
        limitId: limit.id,
        severity: 'fatal',
        actualValue: currentDrawdown,
        limitValue: limit.value,
        action: 'blocked',
        timestamp: Date.now(),
        context: { currentDrawdown }
      };

      assessment.violations.push(violation);
      assessment.approved = false;
      assessment.recommendation = 'reject';
    }
  }

  private assessCorrelationRisk(trade: TradeRequest, assessment: RiskAssessment): void {
    // Calcular correlación con posiciones existentes
    const correlation = this.calculatePortfolioCorrelation(trade.symbol);
    
    const limit = this.findLimit('correlation');
    if (limit && correlation > limit.value) {
      const violation: RiskViolation = {
        id: `violation_${Date.now()}`,
        limitId: limit.id,
        severity: 'warning',
        actualValue: correlation,
        limitValue: limit.value,
        action: 'warned',
        timestamp: Date.now(),
        context: { correlation, symbol: trade.symbol }
      };

      assessment.violations.push(violation);
      
      if (limit.isHard) {
        assessment.recommendation = 'reduce';
        assessment.modifiedSize = trade.size * 0.5; // Reducir 50%
      }
    }
  }

  private assessVolatilityRisk(trade: TradeRequest, assessment: RiskAssessment): void {
    const volatility = this.getSymbolVolatility(trade.symbol);
    
    const limit = this.findLimit('volatility');
    if (limit && volatility > limit.value) {
      const violation: RiskViolation = {
        id: `violation_${Date.now()}`,
        limitId: limit.id,
        severity: 'warning',
        actualValue: volatility,
        limitValue: limit.value,
        action: 'warned',
        timestamp: Date.now(),
        context: { volatility, symbol: trade.symbol }
      };

      assessment.violations.push(violation);
      
      // Para alta volatilidad, reducir tamaño
      if (volatility > limit.value * 1.5) {
        assessment.modifiedSize = trade.size * 0.7;
        assessment.recommendation = 'reduce';
      }
    }
  }

  private assessLiquidityRisk(trade: TradeRequest, assessment: RiskAssessment): void {
    const liquidity = this.getSymbolLiquidity(trade.symbol);
    
    const limit = this.findLimit('liquidity');
    if (limit && liquidity < limit.value) {
      const violation: RiskViolation = {
        id: `violation_${Date.now()}`,
        limitId: limit.id,
        severity: 'critical',
        actualValue: liquidity,
        limitValue: limit.value,
        action: 'blocked',
        timestamp: Date.now(),
        context: { liquidity, symbol: trade.symbol }
      };

      assessment.violations.push(violation);
      assessment.approved = false;
      assessment.recommendation = 'reject';
    }
  }

  private calculateOverallRiskScore(assessment: RiskAssessment): number {
    let riskScore = 0;

    assessment.violations.forEach(violation => {
      const impact = violation.actualValue / violation.limitValue;
      const severityMultiplier = {
        'warning': 0.2,
        'critical': 0.6,
        'fatal': 1.0
      }[violation.severity];

      riskScore += impact * severityMultiplier;
    });

    return Math.min(1.0, riskScore);
  }

  private makeRiskDecision(assessment: RiskAssessment): void {
    const fatalViolations = assessment.violations.filter(v => v.severity === 'fatal');
    const criticalViolations = assessment.violations.filter(v => v.severity === 'critical');

    if (fatalViolations.length > 0) {
      assessment.approved = false;
      assessment.recommendation = 'reject';
    } else if (criticalViolations.length > 0) {
      assessment.approved = false;
      assessment.recommendation = 'delay';
    } else if (assessment.riskScore > 0.7) {
      assessment.recommendation = 'reduce';
      if (!assessment.modifiedSize) {
        assessment.modifiedSize = assessment.violations.length > 0 ? 0.5 : 0.8; // Reducir proporcionalmente
      }
    }
  }

  private handleVolatilitySpike(spikeData: any): void {
    console.log('🌋 Spike de volatilidad detectado - Activando protocolos de emergencia');
    
    // Reducir todos los límites temporalmente
    for (const [id, limit] of this.limits) {
      if (limit.type === 'position_size') {
        limit.value *= 0.7; // Reducir 30% temporalmente
      }
    }

    // Emitir alerta de sistema
    this.eventBus.emit('system.volatility_emergency', spikeData);

    // Restaurar límites después de 1 hora
    setTimeout(() => {
      this.restoreNormalLimits();
    }, 60 * 60 * 1000);
  }

  private performRiskScan(): void {
    // Scan proactivo de riesgos del portfolio
    const healthScore = this.calculatePortfolioHealth();
    
    if (healthScore < 0.3) {
      console.log('💀 PORTFOLIO EN PELIGRO - Health Score:', healthScore);
      this.eventBus.emit('portfolio.critical_health', { healthScore });
    } else if (healthScore < 0.6) {
      console.log('⚠️ Portfolio en zona de riesgo - Health Score:', healthScore);
      this.eventBus.emit('portfolio.warning_health', { healthScore });
    }
  }

  private checkSystemHealth(): void {
    const recentViolations = this.violations.filter(v => 
      Date.now() - v.timestamp < 60 * 60 * 1000 // Última hora
    );

    if (recentViolations.length > 10) {
      console.log('🚨 SISTEMA INMUNE SOBRECARGADO - Activando modo defensivo');
      this.activateDefensiveMode();
    }
  }

  private activateDefensiveMode(): void {
    // Hacer todos los límites más estrictos
    for (const [id, limit] of this.limits) {
      limit.value *= 0.8; // 20% más estricto
    }

    this.eventBus.emit('system.defensive_mode', { active: true });
    
    // Restaurar después de 2 horas
    setTimeout(() => {
      this.restoreNormalLimits();
      this.eventBus.emit('system.defensive_mode', { active: false });
    }, 2 * 60 * 60 * 1000);
  }

  private restoreNormalLimits(): void {
    // Reinicializar límites a valores por defecto
    this.limits.clear();
    this.initializeDefaultLimits();
    console.log('🛡️ Límites de riesgo restaurados a valores normales');
  }

  // Helper methods
  private findLimit(type: RiskLimit['type']): RiskLimit | undefined {
    return Array.from(this.limits.values()).find(limit => limit.type === type);
  }

  private calculatePortfolioCorrelation(symbol: string): number {
    // ⚠️ DATOS SIMULADOS ELIMINADOS - usar correlación real del mercado
    console.warn('🚫 calculatePortfolioCorrelation usando datos mock - implementar API real');
    return 0.5; // Valor fijo hasta implementar correlación real
  }

  private getSymbolVolatility(symbol: string): number {
    // ⚠️ DATOS SIMULADOS ELIMINADOS - usar volatilidad histórica real
    console.warn('🚫 getSymbolVolatility usando datos mock - implementar cálculo real');
    return 0.04; // Valor fijo hasta implementar volatilidad real
  }

  private getSymbolLiquidity(symbol: string): number {
    // ⚠️ DATOS SIMULADOS ELIMINADOS - usar volumen real del mercado
    console.warn('🚫 getSymbolLiquidity usando datos mock - implementar API real');
    return 150000; // Valor fijo hasta implementar liquidez real
  }

  private calculatePortfolioHealth(): number {
    const drawdownFactor = 1 - this.portfolioState.maxDrawdown;
    const pnlFactor = Math.max(0, 1 + this.portfolioState.dailyPnL / this.portfolioState.totalEquity);
    const violationFactor = Math.max(0.1, 1 - this.violations.length * 0.1);

    return drawdownFactor * pnlFactor * violationFactor;
  }

  // Public interface
  getCurrentLimits(): RiskLimit[] {
    return Array.from(this.limits.values());
  }

  getRecentViolations(hours: number = 24): RiskViolation[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.violations.filter(v => v.timestamp > cutoff);
  }

  updateLimit(limitId: string, newValue: number): boolean {
    const limit = this.limits.get(limitId);
    if (limit) {
      limit.value = newValue;
      console.log(`🛡️ Límite actualizado: ${limit.type} = ${newValue}`);
      return true;
    }
    return false;
  }

  getPortfolioRiskSummary() {
    const recentViolations = this.getRecentViolations(24);
    const healthScore = this.calculatePortfolioHealth();

    return {
      healthScore,
      dailyPnL: this.portfolioState.dailyPnL,
      maxDrawdown: this.portfolioState.maxDrawdown,
      totalEquity: this.portfolioState.totalEquity,
      activeLimits: this.limits.size,
      violationsToday: recentViolations.length,
      riskLevel: healthScore > 0.7 ? 'low' : healthScore > 0.4 ? 'medium' : 'high'
    };
  }
}
