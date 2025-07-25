// 🌐 REAL EXCHANGE DASHBOARD - Monitor de Conexiones Reales
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Wifi, 
  WifiOff, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Zap,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ExchangeStatus {
  exchange: string;
  connected: boolean;
  reconnectAttempts: number;
  lastUpdate: number;
  error?: string;
}

interface MarketData {
  exchange: string;
  symbol: string;
  price: number;
  volume?: number;
  change_24h?: number;
  timestamp: number;
}

interface LiberationStatus {
  currentPhase: number;
  progression: number;
  phaseName: string;
  safetyLevel: number;
  tradingLimits: {
    maxPositionSize: number;
    maxDailyTrades: number;
    maxDrawdown: number;
  };
  metrics: {
    totalTrades: number;
    winRate: number;
    avgReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  nextEvaluation: number;
}

export function RealExchangeDashboard() {
  const [exchangeStatuses, setExchangeStatuses] = useState<ExchangeStatus[]>([]);
  const [marketData, setMarketData] = useState<{ [symbol: string]: MarketData[] }>({});
  const [liberationStatus, setLiberationStatus] = useState<LiberationStatus>({
    currentPhase: 1,
    progression: 45,
    phaseName: "Simulación Completa",
    safetyLevel: 100,
    tradingLimits: {
      maxPositionSize: 0,
      maxDailyTrades: 50,
      maxDrawdown: 15
    },
    metrics: {
      totalTrades: 127,
      winRate: 68.5,
      avgReturn: 8.3,
      maxDrawdown: 5.2,
      sharpeRatio: 1.7
    },
    nextEvaluation: Date.now() + (18 * 60 * 60 * 1000) // 18 horas
  });
  const [aggregatedData, setAggregatedData] = useState<any>({});

  useEffect(() => {
    // Simular datos de exchanges
    const mockExchanges: ExchangeStatus[] = [
      {
        exchange: 'kraken',
        connected: true,
        reconnectAttempts: 0,
        lastUpdate: Date.now() - 5000
      },
      {
        exchange: 'coinbase',
        connected: true,
        reconnectAttempts: 0,
        lastUpdate: Date.now() - 3000
      },
      {
        exchange: 'kucoin',
        connected: false,
        reconnectAttempts: 2,
        lastUpdate: Date.now() - 30000,
        error: 'Connection timeout'
      }
    ];

    // Simular datos de mercado
    const mockMarketData = {
      'BTC/USD': [
        {
          exchange: 'kraken',
          symbol: 'BTC/USD',
          price: 43250.50,
          volume: 125.67,
          change_24h: 2.34,
          timestamp: Date.now() - 1000
        },
        {
          exchange: 'coinbase',
          symbol: 'BTC/USD',
          price: 43245.00,
          volume: 89.34,
          change_24h: 2.30,
          timestamp: Date.now() - 2000
        }
      ],
      'ETH/USD': [
        {
          exchange: 'kraken',
          symbol: 'ETH/USD',
          price: 2567.80,
          volume: 456.12,
          change_24h: -1.45,
          timestamp: Date.now() - 1500
        },
        {
          exchange: 'coinbase',
          symbol: 'ETH/USD',
          price: 2565.50,
          volume: 234.89,
          change_24h: -1.50,
          timestamp: Date.now() - 1800
        }
      ]
    };

    setExchangeStatuses(mockExchanges);
    setMarketData(mockMarketData);

    // Calcular datos agregados
    const aggregated: any = {};
    Object.entries(mockMarketData).forEach(([symbol, data]) => {
      const prices = data.map(d => d.price);
      const volumes = data.map(d => d.volume || 0);
      
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const totalVolume = volumes.reduce((a, b) => a + b, 0);
      const spread = Math.max(...prices) - Math.min(...prices);
      
      aggregated[symbol] = {
        symbol,
        averagePrice: avgPrice,
        totalVolume,
        spread,
        spreadPercent: (spread / avgPrice) * 100,
        exchangeCount: data.length,
        lastUpdate: Math.max(...data.map(d => d.timestamp))
      };
    });
    
    setAggregatedData(aggregated);

    // Simular actualización de progreso de liberación
    const interval = setInterval(() => {
      setLiberationStatus(prev => ({
        ...prev,
        progression: Math.min(100, prev.progression + Math.random() * 2),
        metrics: {
          ...prev.metrics,
          totalTrades: prev.metrics.totalTrades + Math.floor(Math.random() * 3),
          winRate: Math.max(60, Math.min(85, prev.metrics.winRate + (Math.random() - 0.5) * 2)),
          avgReturn: Math.max(5, Math.min(15, prev.metrics.avgReturn + (Math.random() - 0.5) * 1)),
          sharpeRatio: Math.max(1, Math.min(3, prev.metrics.sharpeRatio + (Math.random() - 0.5) * 0.1))
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getExchangeIcon = (exchange: string) => {
    switch (exchange) {
      case 'kraken': return '🔱';
      case 'coinbase': return '🪙';
      case 'kucoin': return '🟡';
      default: return '📊';
    }
  };

  const getPhaseColor = (phase: number) => {
    switch (phase) {
      case 1: return 'bg-blue-600';
      case 2: return 'bg-yellow-600';
      case 3: return 'bg-orange-600';
      case 4: return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const formatTimeUntil = (timestamp: number) => {
    const hours = Math.floor((timestamp - Date.now()) / (1000 * 60 * 60));
    const minutes = Math.floor(((timestamp - Date.now()) % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          🌐 Exchange Real Integration Dashboard
        </h1>
        <p className="text-gray-400">
          Monitor de conexiones reales y protocolo de liberación autónoma
        </p>
      </div>

      <Tabs defaultValue="exchanges" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/40">
          <TabsTrigger value="exchanges" className="text-white">
            <Globe className="h-4 w-4 mr-2" />
            Exchanges
          </TabsTrigger>
          <TabsTrigger value="liberation" className="text-white">
            <Zap className="h-4 w-4 mr-2" />
            Liberación
          </TabsTrigger>
          <TabsTrigger value="market" className="text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            Mercado
          </TabsTrigger>
          <TabsTrigger value="safety" className="text-white">
            <Shield className="h-4 w-4 mr-2" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Tab: Exchanges */}
        <TabsContent value="exchanges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exchangeStatuses.map((status) => (
              <Card key={status.exchange} className="bg-black/40 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getExchangeIcon(status.exchange)}</span>
                      <div>
                        <CardTitle className="text-white capitalize text-lg">
                          {status.exchange}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Last update: {Math.floor((Date.now() - status.lastUpdate) / 1000)}s ago
                        </CardDescription>
                      </div>
                    </div>
                    {status.connected ? (
                      <Wifi className="h-5 w-5 text-green-400" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Status:</span>
                      <Badge className={status.connected ? 'bg-green-600' : 'bg-red-600'}>
                        {status.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    
                    {!status.connected && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Reconnect Attempts:</span>
                          <span className="text-orange-400">{status.reconnectAttempts}</span>
                        </div>
                        
                        {status.error && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Error:</span>
                            <span className="text-red-400 text-xs">{status.error}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                      variant={status.connected ? "outline" : "default"}
                    >
                      {status.connected ? 'Disconnect' : 'Reconnect'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Connection Summary */}
          <Card className="bg-black/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-400" />
                Connection Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {exchangeStatuses.filter(s => s.connected).length}
                  </div>
                  <div className="text-sm text-gray-400">Connected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {exchangeStatuses.filter(s => !s.connected).length}
                  </div>
                  <div className="text-sm text-gray-400">Disconnected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {exchangeStatuses.reduce((sum, s) => sum + s.reconnectAttempts, 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total Retries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {((exchangeStatuses.filter(s => s.connected).length / exchangeStatuses.length) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Liberation Protocol */}
        <TabsContent value="liberation" className="space-y-4">
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="h-6 w-6 mr-2 text-yellow-400" />
                Protocolo de Liberación Autónoma
              </CardTitle>
              <CardDescription className="text-purple-200">
                Fase {liberationStatus.currentPhase}: {liberationStatus.phaseName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-300">Progreso de Fase</span>
                  <span className="text-sm text-purple-300">{liberationStatus.progression.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={liberationStatus.progression} 
                  className="h-3 bg-slate-700"
                />
              </div>

              {/* Phase Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-black/40 border-purple-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-purple-300 text-lg">Límites Actuales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Posición Máxima:</span>
                      <span className="text-white">
                        {liberationStatus.tradingLimits.maxPositionSize === 0 
                          ? 'Simulado' 
                          : `$${liberationStatus.tradingLimits.maxPositionSize}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trades Diarios:</span>
                      <span className="text-white">{liberationStatus.tradingLimits.maxDailyTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Drawdown Máximo:</span>
                      <span className="text-white">{liberationStatus.tradingLimits.maxDrawdown}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nivel de Seguridad:</span>
                      <Badge className={getPhaseColor(liberationStatus.currentPhase)}>
                        {liberationStatus.safetyLevel}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-green-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-300 text-lg">Métricas de Rendimiento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Trades:</span>
                      <span className="text-white">{liberationStatus.metrics.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate:</span>
                      <span className={liberationStatus.metrics.winRate >= 60 ? 'text-green-400' : 'text-red-400'}>
                        {liberationStatus.metrics.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Retorno Promedio:</span>
                      <span className="text-green-400">+{liberationStatus.metrics.avgReturn.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sharpe Ratio:</span>
                      <span className={liberationStatus.metrics.sharpeRatio >= 1.5 ? 'text-green-400' : 'text-yellow-400'}>
                        {liberationStatus.metrics.sharpeRatio.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Next Evaluation */}
              <div className="flex items-center justify-between p-4 bg-black/40 rounded border border-blue-500/30">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span className="text-white">Próxima Evaluación:</span>
                </div>
                <span className="text-blue-400 font-mono">
                  {formatTimeUntil(liberationStatus.nextEvaluation)}
                </span>
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                🚀 Forzar Evaluación (Dev Mode)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Market Data */}
        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(aggregatedData).map(([symbol, data]: [string, any]) => (
              <Card key={symbol} className="bg-black/40 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>{symbol}</span>
                    <Badge className="bg-blue-600">
                      {data.exchangeCount} exchanges
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        ${data.averagePrice.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">Precio Promedio</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Volumen Total:</div>
                        <div className="text-white font-mono">{data.totalVolume.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Spread:</div>
                        <div className="text-orange-400 font-mono">
                          ${data.spread.toFixed(2)} ({data.spreadPercent.toFixed(3)}%)
                        </div>
                      </div>
                    </div>

                    {/* Exchange Prices */}
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400 font-medium">Precios por Exchange:</div>
                      {marketData[symbol]?.map((item) => (
                        <div key={item.exchange} className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getExchangeIcon(item.exchange)}</span>
                            <span className="text-white capitalize">{item.exchange}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-mono">${item.price.toFixed(2)}</div>
                            {item.change_24h && (
                              <div className={`text-xs ${item.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {item.change_24h >= 0 ? '+' : ''}{item.change_24h.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Safety */}
        <TabsContent value="safety" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Safety Checks */}
            <Card className="bg-black/40 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-300 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Verificaciones de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Gestión de Riesgo', status: true },
                  { name: 'Historial de Rendimiento', status: true },
                  { name: 'Protocolos de Emergencia', status: true },
                  { name: 'Supervisión Humana', status: liberationStatus.currentPhase <= 2 }
                ].map((check) => (
                  <div key={check.name} className="flex items-center justify-between">
                    <span className="text-gray-300">{check.name}</span>
                    {check.status ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risk Metrics */}
            <Card className="bg-black/40 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-300 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Métricas de Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Drawdown Actual:</span>
                  <span className={liberationStatus.metrics.maxDrawdown <= 5 ? 'text-green-400' : 'text-red-400'}>
                    {liberationStatus.metrics.maxDrawdown.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Exposición Máxima:</span>
                  <span className="text-white">
                    {liberationStatus.tradingLimits.maxPositionSize === 0 ? 'N/A' : `$${liberationStatus.tradingLimits.maxPositionSize}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trades Hoy:</span>
                  <span className="text-blue-400">
                    12 / {liberationStatus.tradingLimits.maxDailyTrades}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado del Sistema:</span>
                  <Badge className="bg-green-600">Operativo</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Controls */}
          <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-300 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2" />
                Controles de Emergencia
              </CardTitle>
              <CardDescription className="text-red-200">
                Úsalos solo en caso de emergencia o para testing
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                🚨 Parada de Emergencia
              </Button>
              <Button variant="outline" className="border-yellow-500 text-yellow-300 hover:bg-yellow-500/10">
                ⏸️ Pausar Trading
              </Button>
              <Button variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-500/10">
                🔄 Reset Sistema
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
