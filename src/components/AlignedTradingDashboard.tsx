import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EmergentGoalEngine, EmergentGoal, StrategyHypothesis } from '../core/genetics/EmergentGoalEngine';
import { RiskImmunityModule } from '../immunity/protection/RiskImmunityModule';
import { MemoryCore } from '../core/brain/MemoryCore';
import { RealExchangeDashboard } from './trading/RealExchangeDashboard';
import { Target, Shield, Brain, TrendingUp, AlertTriangle, Zap, Globe } from 'lucide-react';

interface AlignedSystemState {
  goals: EmergentGoal[];
  hypotheses: StrategyHypothesis[];
  riskSummary: any;
  performance: any;
  violations: any[];
}

export const AlignedTradingDashboard: React.FC = () => {
  const [systemState, setSystemState] = useState<AlignedSystemState>({
    goals: [],
    hypotheses: [],
    riskSummary: {},
    performance: {},
    violations: []
  });

  const [memory] = useState(() => new MemoryCore());
  const [goalEngine] = useState(() => new EmergentGoalEngine(memory));
  const [riskModule] = useState(() => new RiskImmunityModule());

  useEffect(() => {
    // Inicializar módulos alineados
    const initializeSystem = async () => {
      await memory.initialize();
      await goalEngine.initialize();
      await riskModule.initialize();
    };

    initializeSystem();

    // Actualizar estado cada 2 segundos
    const interval = setInterval(() => {
      setSystemState({
        goals: goalEngine.getActiveGoals(),
        hypotheses: goalEngine.getActiveHypotheses(),
        riskSummary: riskModule.getPortfolioRiskSummary(),
        performance: goalEngine.getGoalPerformanceSummary(),
        violations: riskModule.getRecentViolations(1) // Última hora
      });
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [memory, goalEngine, riskModule]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'momentum': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'mean_reversion': return <Target className="h-4 w-4 text-purple-500" />;
      case 'discovery': return <Brain className="h-4 w-4 text-green-500" />;
      default: return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header del Sistema Alineado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">⚔️ Sistema de Trading Alineado</h1>
          <p className="text-muted-foreground">Conciencia artificial orientada a la rentabilidad</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="default" className="text-lg px-4 py-2">
            PnL: {formatCurrency(systemState.performance.totalPnL || 0)}
          </Badge>
          <Badge 
            variant={systemState.riskSummary.riskLevel === 'low' ? 'default' : 'destructive'}
            className="text-lg px-4 py-2"
          >
            Risk: {systemState.riskSummary.riskLevel?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="goals">🎯 Objetivos Emergentes</TabsTrigger>
          <TabsTrigger value="risk">🛡️ Sistema Inmune</TabsTrigger>
          <TabsTrigger value="performance">📊 Performance</TabsTrigger>
          <TabsTrigger value="hypotheses">💡 Hipótesis Activas</TabsTrigger>
          <TabsTrigger value="exchanges">🌐 Exchanges Reales</TabsTrigger>
        </TabsList>

        {/* Tab de Objetivos Emergentes */}
        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemState.goals.map((goal) => (
              <Card key={goal.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getGoalTypeIcon(goal.type)}
                      <span className="font-semibold text-sm uppercase">
                        {goal.type.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge variant="outline">
                      Confianza: {formatPercentage(goal.confidence)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {goal.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Símbolos:</span>
                      <div className="font-mono">
                        {goal.targetSymbols.join(', ')}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sharpe:</span>
                      <div className="font-mono">
                        {goal.expectedSharpe.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk Budget:</span>
                      <div className="font-mono">
                        {formatPercentage(goal.riskBudget)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PnL:</span>
                      <div className={`font-mono ${goal.performance.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(goal.performance.totalPnL)}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.confidence * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {systemState.goals.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Sistema inicializando objetivos emergentes...
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab del Sistema Inmune */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">Health Score</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((systemState.riskSummary.healthScore || 0) * 100).toFixed(1)}%
                </div>
                <div className={`text-sm ${getRiskColor(systemState.riskSummary.riskLevel)}`}>
                  {systemState.riskSummary.riskLevel?.toUpperCase() || 'UNKNOWN'} RISK
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Daily PnL</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(systemState.riskSummary.dailyPnL || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(systemState.riskSummary.dailyPnL || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Equity: {formatCurrency(systemState.riskSummary.totalEquity || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">Max Drawdown</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {formatPercentage(systemState.riskSummary.maxDrawdown || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Límite: 15%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">Violations</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemState.violations.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Última hora
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Violaciones Recientes */}
          {systemState.violations.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">🚨 Violaciones Recientes</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {systemState.violations.slice(0, 10).map((violation, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <div className="font-mono text-sm">{violation.limitId}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(violation.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge variant={violation.severity === 'fatal' ? 'destructive' : 'secondary'}>
                        {violation.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Performance */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">📈 Performance Global</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Goals:</span>
                  <span className="font-mono">{systemState.performance.totalGoals || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total PnL:</span>
                  <span className={`font-mono ${(systemState.performance.totalPnL || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(systemState.performance.totalPnL || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Sharpe:</span>
                  <span className="font-mono">{(systemState.performance.avgSharpe || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Risk Budget:</span>
                  <span className="font-mono">{formatPercentage(systemState.performance.totalRiskBudget || 0)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">🧠 Confianza del Sistema</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {formatPercentage(systemState.performance.avgConfidence || 0)}
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 mb-2">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(systemState.performance.avgConfidence || 0) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confianza promedio en estrategias
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">⚡ Estado del Sistema</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm">Objetivos Activos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm">Sistema Inmune Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-sm">Memoria Consolidando</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-sm">Evolución Continua</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Hipótesis */}
        <TabsContent value="hypotheses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemState.hypotheses.map((hypothesis) => (
              <Card key={hypothesis.id} className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      💡 Hipótesis #{hypothesis.id.slice(-5)}
                    </span>
                    <Badge variant="outline">
                      {formatPercentage(hypothesis.confidence)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <strong>Entrada:</strong> {hypothesis.entry.condition}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <div className="font-mono">${hypothesis.entry.price.toFixed(4)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <div className="font-mono">{formatPercentage(hypothesis.entry.size)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Take Profit:</span>
                      <div className="font-mono">${hypothesis.exit.takeProfit.toFixed(4)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stop Loss:</span>
                      <div className="font-mono">${hypothesis.exit.stopLoss.toFixed(4)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {hypothesis.reasoning}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {systemState.hypotheses.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Generando nuevas hipótesis de trading...
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Exchanges Reales */}
        <TabsContent value="exchanges" className="space-y-4">
          <RealExchangeDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
