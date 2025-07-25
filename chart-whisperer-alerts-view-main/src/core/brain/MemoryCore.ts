// 🧠 MEMORIA CENTRAL - Almacenamiento y Aprendizaje
import { EventBus } from '../../circulation/channels/EventBus';

export interface PerformanceMetric {
  timestamp: number;
  score: number;
  context: string;
  details: Record<string, any>;
}

export interface SystemError {
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  module: string;
  error: string;
  context: any;
}

export class MemoryCore {
  private eventBus: EventBus;
  private performanceHistory: PerformanceMetric[];
  private errorLog: SystemError[];
  private knowledgeBase: Map<string, any>;
  private isActive: boolean = false;

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.performanceHistory = [];
    this.errorLog = [];
    this.knowledgeBase = new Map();
  }

  async initialize(): Promise<void> {
    console.log('🧠 MemoryCore: Inicializando sistema de memoria...');
    
    // Suscribirse a eventos de aprendizaje
    this.eventBus.subscribe('learning.pattern_discovered', this.storePattern.bind(this));
    this.eventBus.subscribe('performance.metric', this.updatePerformanceHistory.bind(this));
    
    this.isActive = true;
    console.log('✅ MemoryCore: Sistema de memoria activo');
  }

  updatePerformanceHistory(metric: PerformanceMetric): void {
    this.performanceHistory.push(metric);
    
    // Mantener solo las últimas 10,000 métricas
    if (this.performanceHistory.length > 10000) {
      this.performanceHistory = this.performanceHistory.slice(-10000);
    }

    console.log(`📊 MemoryCore: Métrica de performance registrada - Score: ${metric.score}`);
  }

  logError(error: SystemError): void {
    this.errorLog.push(error);
    
    // Mantener solo los últimos 1,000 errores
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-1000);
    }

    console.log(`💀 MemoryCore: Error registrado - ${error.severity}: ${error.error}`);
  }

  storePattern(pattern: any): void {
    const key = `pattern_${pattern.type}_${Date.now()}`;
    this.knowledgeBase.set(key, {
      ...pattern,
      timestamp: Date.now(),
      accessCount: 0
    });

    console.log(`🧬 MemoryCore: Patrón almacenado - ${pattern.type}`);
  }

  getPerformanceMetrics() {
    if (this.performanceHistory.length === 0) {
      return {
        avgScore: 0.5,
        trend: 'neutral',
        recentPerformance: 0.5,
        totalMetrics: 0
      };
    }

    const recent = this.performanceHistory.slice(-100);
    const avgScore = recent.reduce((sum, m) => sum + m.score, 0) / recent.length;
    
    // Calcular tendencia
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, m) => sum + m.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.score, 0) / secondHalf.length;
    
    let trend = 'neutral';
    if (secondAvg > firstAvg + 0.05) trend = 'improving';
    else if (secondAvg < firstAvg - 0.05) trend = 'declining';

    return {
      avgScore,
      trend,
      recentPerformance: recent[recent.length - 1]?.score || 0.5,
      totalMetrics: this.performanceHistory.length
    };
  }

  getErrorAnalysis() {
    const recentErrors = this.errorLog.slice(-100);
    const criticalErrors = recentErrors.filter(e => e.severity === 'critical').length;
    const errorsByModule = recentErrors.reduce((acc, error) => {
      acc[error.module] = (acc[error.module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: this.errorLog.length,
      recentErrors: recentErrors.length,
      criticalErrors,
      errorsByModule,
      mostProblematicModule: Object.entries(errorsByModule)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
    };
  }

  searchKnowledge(query: string): any[] {
    const results: any[] = [];
    
    for (const [key, value] of this.knowledgeBase.entries()) {
      if (key.includes(query) || JSON.stringify(value).includes(query)) {
        // Incrementar contador de acceso
        value.accessCount++;
        results.push(value);
      }
    }

    return results.sort((a, b) => b.accessCount - a.accessCount);
  }

  consolidateMemory(): void {
    // Limpieza de patrones poco utilizados
    const threshold = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 días
    let cleaned = 0;

    for (const [key, value] of this.knowledgeBase.entries()) {
      if (value.timestamp < threshold && value.accessCount < 5) {
        this.knowledgeBase.delete(key);
        cleaned++;
      }
    }

    console.log(`🧹 MemoryCore: Consolidación completada - ${cleaned} patrones obsoletos eliminados`);
  }

  getMemoryStats() {
    return {
      performanceMetrics: this.performanceHistory.length,
      errorLog: this.errorLog.length,
      knowledgePatterns: this.knowledgeBase.size,
      memoryUsage: JSON.stringify({
        performance: this.performanceHistory,
        errors: this.errorLog,
        knowledge: Array.from(this.knowledgeBase.entries())
      }).length
    };
  }
}
