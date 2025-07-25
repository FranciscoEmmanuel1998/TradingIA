// 📊 PANEL DE VERIFICACIÓN DE PRECISIÓN
// Muestra métricas reales de precisión de predicciones

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  DollarSign, 
  BarChart3,
  CheckCircle,
  XCircle,
  Clock4,
  AlertTriangle
} from 'lucide-react';

import { 
  predictionVerificationSystem, 
  AccuracyMetrics, 
  PredictionOutcome 
} from '@/core/verification/PredictionVerificationSystem';

export function AccuracyVerificationPanel() {
  const [metrics, setMetrics] = useState<AccuracyMetrics | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<PredictionOutcome[]>([]);
  
  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = predictionVerificationSystem.getAccuracyMetrics();
      const recent = predictionVerificationSystem.getAllPredictions()
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
      
      setMetrics(currentMetrics);
      setRecentPredictions(recent);
    };
    
    // Actualizar inmediatamente
    updateMetrics();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(updateMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sistema de Verificación
          </CardTitle>
          <CardDescription>Cargando métricas de precisión...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-500';
    if (accuracy >= 80) return 'text-yellow-500';
    if (accuracy >= 70) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESS': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PARTIAL': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'PENDING': return <Clock4 className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };
  
  const formatProfitLoss = (value: number) => {
    const color = value >= 0 ? 'text-green-500' : 'text-red-500';
    const sign = value >= 0 ? '+' : '';
    return <span className={color}>{sign}{value.toFixed(2)}%</span>;
  };
  
  return (
    <div className="space-y-6">
      {/* Header con métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precisión General</p>
                <p className={`text-2xl font-bold ${getAccuracyColor(metrics.overallAccuracy)}`}>
                  {metrics.overallAccuracy.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={metrics.overallAccuracy} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Predicciones</p>
                <p className="text-2xl font-bold">{metrics.totalPredictions}</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.pendingPredictions} pendientes
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">P&L Promedio</p>
                <p className="text-2xl font-bold">
                  {formatProfitLoss(metrics.averageProfitLoss)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Mejor: {formatProfitLoss(metrics.bestTrade)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold">
                  {Math.round(metrics.averageTimeToResolution)}m
                </p>
                <p className="text-xs text-muted-foreground">
                  Más rápido: {Math.round(metrics.quickestResolution)}m
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="by-action">Por Acción</TabsTrigger>
          <TabsTrigger value="by-confidence">Por Confianza</TabsTrigger>
          <TabsTrigger value="recent">Recientes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Predicciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Exitosas</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {metrics.successfulPredictions}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Fallidas</span>
                    </div>
                    <Badge variant="outline" className="text-red-600">
                      {metrics.failedPredictions}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock4 className="h-4 w-4 text-blue-500" />
                      <span>Pendientes</span>
                    </div>
                    <Badge variant="outline" className="text-blue-600">
                      {metrics.pendingPredictions}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Métricas Financieras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>P&L Total</span>
                    <span className="font-mono">
                      {formatProfitLoss(metrics.totalProfitLoss)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Mejor Trade</span>
                    <span className="font-mono">
                      {formatProfitLoss(metrics.bestTrade)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Peor Trade</span>
                    <span className="font-mono">
                      {formatProfitLoss(metrics.worstTrade)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="by-action" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Predicciones BUY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Precisión</span>
                    <span className={`font-bold ${getAccuracyColor(metrics.buyAccuracy)}`}>
                      {metrics.buyAccuracy.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics.buyAccuracy} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Predicciones SELL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Precisión</span>
                    <span className={`font-bold ${getAccuracyColor(metrics.sellAccuracy)}`}>
                      {metrics.sellAccuracy.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics.sellAccuracy} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="by-confidence" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Alta Confianza</CardTitle>
                <CardDescription>&gt;90%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Precisión</span>
                    <span className={`font-bold ${getAccuracyColor(metrics.highConfidenceAccuracy)}`}>
                      {metrics.highConfidenceAccuracy.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics.highConfidenceAccuracy} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Media Confianza</CardTitle>
                <CardDescription>80-90%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Precisión</span>
                    <span className={`font-bold ${getAccuracyColor(metrics.mediumConfidenceAccuracy)}`}>
                      {metrics.mediumConfidenceAccuracy.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics.mediumConfidenceAccuracy} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Baja Confianza</CardTitle>
                <CardDescription>&lt;80%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Precisión</span>
                    <span className={`font-bold ${getAccuracyColor(metrics.lowConfidenceAccuracy)}`}>
                      {metrics.lowConfidenceAccuracy.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics.lowConfidenceAccuracy} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predicciones Recientes</CardTitle>
              <CardDescription>Últimas 10 predicciones registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPredictions.map((prediction) => (
                  <div 
                    key={prediction.signalId} 
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {getOutcomeIcon(prediction.outcome)}
                      <div>
                        <div className="font-medium">
                          {prediction.action} {prediction.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${prediction.entryPrice.toFixed(2)} • {prediction.confidence}% confianza
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono">
                        {formatProfitLoss(prediction.profitLoss)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {prediction.timeToOutcome ? `${Math.round(prediction.timeToOutcome)}m` : 'Pendiente'}
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentPredictions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No hay predicciones registradas aún
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
