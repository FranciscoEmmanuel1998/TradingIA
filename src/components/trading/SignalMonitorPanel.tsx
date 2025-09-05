// 📊 PANEL DE MONITOREO DE SEÑALES - Interfaz premium para seguimiento de señales
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Target,
  Shield,
  Activity,
  Zap
} from 'lucide-react';
import { enhancedSignalGenerator, PremiumTradingSignal, SignalPerformanceMetrics } from '@/core/signals/EnhancedSignalGenerator';
import { EventBus } from '@/circulation/channels/EventBus';

interface SignalMonitorProps {
  isActive?: boolean;
}

export function SignalMonitorPanel({ isActive = false }: SignalMonitorProps) {
  const [activeSignals, setActiveSignals] = useState<PremiumTradingSignal[]>([]);
  const [metrics, setMetrics] = useState<SignalPerformanceMetrics | null>(null);
  const [isGeneratorActive, setIsGeneratorActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  useEffect(() => {
    const eventBus = EventBus.getInstance();
    
    const handleNewSignal = (signal: PremiumTradingSignal) => {
      setActiveSignals(prev => [...prev, signal]);
      setLastUpdate(new Date());
    };
    
    eventBus.subscribe('premium_signal_generated', handleNewSignal);
    
    // Actualizar métricas cada 30 segundos
    const metricsInterval = setInterval(() => {
      const currentMetrics = enhancedSignalGenerator.getPerformanceMetrics();
      setMetrics(currentMetrics);
      
      const currentSignals = enhancedSignalGenerator.getActiveSignals();
      setActiveSignals(currentSignals);
    }, 30000);
    
    // Carga inicial
    setActiveSignals(enhancedSignalGenerator.getActiveSignals());
    setMetrics(enhancedSignalGenerator.getPerformanceMetrics());
    
    return () => {
      eventBus.unsubscribe('premium_signal_generated', handleNewSignal);
      clearInterval(metricsInterval);
    };
  }, []);
  
  const handleStartGenerator = () => {
    enhancedSignalGenerator.start();
    setIsGeneratorActive(true);
  };
  
  const handleStopGenerator = () => {
    enhancedSignalGenerator.stop();
    setIsGeneratorActive(false);
  };
  
  const getSignalIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'SELL': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };
  
  const getSignalColor = (action: string, strength: string) => {
    const baseColor = action === 'BUY' ? 'green' : action === 'SELL' ? 'red' : 'yellow';
    const intensity = strength === 'VERY_STRONG' ? '600' : 
                     strength === 'STRONG' ? '500' : 
                     strength === 'MODERATE' ? '400' : '300';
    return `bg-${baseColor}-${intensity}`;
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'destructive';
      case 'HIGH': return 'default';
      case 'MEDIUM': return 'secondary';
      default: return 'outline';
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 4 
    })}`;
  };
  
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header y controles */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎯 Monitor de Señales Premium</h1>
          <p className="text-gray-600">Sistema de generación de señales de alta precisión</p>
        </div>
        <div className="flex gap-3">
          {!isGeneratorActive ? (
            <Button onClick={handleStartGenerator} className="bg-green-600 hover:bg-green-700">
              <Zap className="w-4 h-4 mr-2" />
              Iniciar Generador
            </Button>
          ) : (
            <Button onClick={handleStopGenerator} variant="destructive">
              <Shield className="w-4 h-4 mr-2" />
              Detener Generador
            </Button>
          )}
        </div>
      </div>
      
      {/* Estado del sistema */}
      <Alert className={isGeneratorActive ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <Activity className={`w-4 h-4 ${isGeneratorActive ? 'text-green-600' : 'text-yellow-600'}`} />
        <AlertDescription className={isGeneratorActive ? 'text-green-800' : 'text-yellow-800'}>
          <strong>Estado del Generador:</strong> {isGeneratorActive ? 'ACTIVO - Analizando mercados en tiempo real' : 'INACTIVO - Presiona "Iniciar Generador" para comenzar'}
          <br />
          <span className="text-sm">Última actualización: {formatTime(lastUpdate)}</span>
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="signals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="signals">Señales Activas ({activeSignals.length})</TabsTrigger>
          <TabsTrigger value="metrics">Métricas de Rendimiento</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
        
        {/* Señales Activas */}
        <TabsContent value="signals" className="space-y-4">
          {activeSignals.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay señales activas</h3>
                <p className="text-gray-500">
                  {isGeneratorActive ? 
                    'El sistema está analizando... Las señales aparecerán cuando se cumplan los criterios de calidad.' :
                    'Inicia el generador para comenzar a recibir señales de trading.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeSignals.map((signal) => (
                <Card key={signal.id} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getSignalIcon(signal.action)}
                        <CardTitle className="text-lg">{signal.symbol}</CardTitle>
                        <Badge variant={signal.action === 'BUY' ? 'default' : 'destructive'}>
                          {signal.action}
                        </Badge>
                        <Badge variant={getPriorityColor(signal.priority)}>
                          {signal.priority}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {signal.confidence}%
                        </div>
                        <div className="text-sm text-gray-500">{signal.strength}</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Precios */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Entry</div>
                        <div className="font-semibold text-blue-600">{formatPrice(signal.entryPrice)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Target</div>
                        <div className="font-semibold text-green-600">{formatPrice(signal.targetPrice)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Stop Loss</div>
                        <div className="font-semibold text-red-600">{formatPrice(signal.stopLoss)}</div>
                      </div>
                    </div>
                    
                    {/* Métricas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-sm">R/R: {signal.riskRewardRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{signal.timeframe}</span>
                      </div>
                    </div>
                    
                    {/* Confirmaciones */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Confirmaciones:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(signal.confirmations).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-1">
                            {value ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                            )}
                            <span className={value ? 'text-green-700' : 'text-red-700'}>
                              {key.replace('Confirmation', '')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Reasoning */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Análisis:</div>
                      <div className="space-y-1">
                        {signal.reasoning.map((reason, index) => (
                          <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Tiempo */}
                    <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                      <span>Creada: {formatTime(signal.timestamp)}</span>
                      <span>Expira: {formatTime(signal.expirationTime)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Métricas de Rendimiento */}
        <TabsContent value="metrics" className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.winRate.toFixed(1)}%
                  </div>
                  <Progress value={metrics.winRate} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics.winningSignals} / {metrics.executedSignals} ejecutadas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Risk/Reward Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.avgRiskReward.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ratio promedio por señal
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Confianza Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.avgConfidence.toFixed(1)}%
                  </div>
                  <Progress value={metrics.avgConfidence} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    Nivel de confianza medio
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {metrics.profitFactor.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ganancias vs Pérdidas
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Fuerza de Señal</CardTitle>
                <CardDescription>
                  Win rate segmentado por nivel de confianza
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Señales MUY FUERTES</span>
                    <span className="text-sm font-bold text-green-600">
                      {metrics.strongSignalWinRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics.strongSignalWinRate} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Señales MODERADAS</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {metrics.moderateSignalWinRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics.moderateSignalWinRate} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Señales DÉBILES</span>
                    <span className="text-sm font-bold text-red-600">
                      {metrics.weakSignalWinRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics.weakSignalWinRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Historial */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Señales</CardTitle>
              <CardDescription>
                Próximamente: Historial completo con tracking de resultados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                📊 El historial detallado se implementará en la siguiente fase
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
