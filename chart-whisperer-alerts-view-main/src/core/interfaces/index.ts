// 🌐 INTERFACES DEL SISTEMA VIVO

export interface IModule {
  getName(): string;
  getHealth(): number;
  isActive(): boolean;
  initialize(): Promise<void>;
  stop(): Promise<void>;
}

export interface ILivingSystem {
  heartbeat(): void;
  selfDiagnose(): SystemHealth;
  evolve(): void;
}

export interface SystemHealth {
  overall: number;
  modules: Record<string, number>;
  issues: string[];
  lastCheck: number;
}

export interface Decision {
  id: string;
  type: 'trading' | 'risk' | 'system';
  action: string;
  confidence: number;
  shouldExecute: boolean;
  timestamp: number;
  reasoning: string;
}

export interface MarketSignal {
  symbol: string;
  type: 'buy' | 'sell' | 'hold';
  strength: number;
  timeframe: string;
  indicators: Record<string, number>;
  timestamp: number;
}

export interface SystemAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: any;
  timestamp: number;
}

export class SystemState {
  private state: {
    isAlive: boolean;
    survivalMode: boolean;
    lastHeartbeat: number;
    performance: number;
    alerts: SystemAlert[];
    selfAnalysis: any;
  };

  constructor() {
    this.state = {
      isAlive: true,
      survivalMode: false,
      lastHeartbeat: Date.now(),
      performance: 1.0,
      alerts: [],
      selfAnalysis: null
    };
  }

  heartbeat(): void {
    this.state.lastHeartbeat = Date.now();
  }

  setSurvivalMode(active: boolean): void {
    this.state.survivalMode = active;
  }

  setAlert(type: string, data: any): void {
    const alert: SystemAlert = {
      id: `alert_${Date.now()}`,
      type,
      severity: data.severity || 'medium',
      message: data.message || `Alert: ${type}`,
      data,
      timestamp: Date.now()
    };
    
    this.state.alerts.push(alert);
    
    // Mantener solo las últimas 100 alertas
    if (this.state.alerts.length > 100) {
      this.state.alerts = this.state.alerts.slice(-100);
    }
  }

  updateSelfAnalysis(analysis: any): void {
    this.state.selfAnalysis = analysis;
  }

  getCurrentState() {
    return { ...this.state };
  }

  getHealth(): number {
    const timeSinceHeartbeat = Date.now() - this.state.lastHeartbeat;
    const heartbeatHealth = timeSinceHeartbeat < 10000 ? 1 : 0.5; // 10 segundos
    
    return this.state.performance * heartbeatHealth;
  }
}
