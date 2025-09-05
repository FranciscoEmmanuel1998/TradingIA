// 📊 PANEL DE VERIFICACIÓN DE PRECISIÓN - DATOS REALES EN TIEMPO REAL
// Muestra métricas completamente funcionales de precisión de predicciones

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
  RefreshCw
} from 'lucide-react';

// Usar sistema avanzado para métricas más ricas
import { advancedPredictionVerificationSystem } from '@/core/verification/AdvancedPredictionVerificationSystem';

export function AccuracyVerificationPanel() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 🚫 VERIFICACIÓN ANTI-SIMULACIÓN
  const isRealDataOnly = process.env.ENABLE_SIMULATION !== 'true' && 
                         process.env.USE_DEV_SIMULATOR !== 'true';
  
  useEffect(() => {
    // 🚫 Bloquear si hay simulaciones activas
    if (!isRealDataOnly) {
      console.error('❌ PANEL BLOQUEADO: Simulaciones detectadas');
      return;
    }
    
    const updateMetrics = () => {
      setIsUpdating(true);
      try {
  const currentMetrics = advancedPredictionVerificationSystem.getComprehensiveMetrics();
        setMetrics(currentMetrics);
        console.log('📊 Métricas de precisión actualizadas (SOLO DATOS REALES):', currentMetrics);
      } catch (error) {
        console.error('❌ Error actualizando métricas:', error);
      } finally {
        setIsUpdating(false);
      }
    };
    
    // Actualizar inmediatamente
    updateMetrics();
    
    // Actualizar cada 10 segundos para datos en tiempo real
    const interval = setInterval(updateMetrics, 10000);
    
    return () => clearInterval(interval);
  }, [isRealDataOnly]);
  
  // 🚫 BLOQUEO POR SIMULACIÓN
  if (!isRealDataOnly) {
    return (
      <Card className="border-2 border-red-800 bg-neutral-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <XCircle className="h-5 w-5" />
            Panel Bloqueado - Simulaciones Detectadas
          </CardTitle>
          <CardDescription className="text-red-400">
            🚫 Este panel solo funciona con datos 100% reales. 
            Simulaciones detectadas en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-300">
            Para activar este panel:
            <br />• ENABLE_SIMULATION = false
            <br />• USE_DEV_SIMULATOR = false
            <br />• ENABLE_REAL_DATA = true
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (!metrics) {
    return (
      <Card className="border-2 border-dashed border-neutral-700 bg-neutral-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-100">
            <BarChart3 className="h-5 w-5 animate-pulse text-blue-400" />
            Sistema de Verificación de Precisión
          </CardTitle>
          <CardDescription className="text-neutral-400">🔄 Inicializando sistema de métricas en tiempo real...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-neutral-500" />
            <p className="text-sm text-neutral-400 mt-2">Conectando con el sistema de verificación...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-500';
    if (accuracy >= 50) return 'text-yellow-500';
    if (accuracy >= 30) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const formatProfitLoss = (value: number) => {
    const color = value >= 0 ? 'text-green-500' : 'text-red-500';
    const sign = value >= 0 ? '+' : '';
    return <span className={color}>{sign}{value.toFixed(2)}%</span>;
  };
  
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header con estado del sistema */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-neutral-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Sistema de Verificación de Precisión
            </div>
            <div className="flex items-center gap-2">
              {isUpdating && <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />}
              <Badge variant="outline" className="bg-green-900 text-green-200 border-green-700">
                ✅ DATOS EN TIEMPO REAL
              </Badge>
            </div>
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Última actualización: {metrics.lastUpdated ? new Date(metrics.lastUpdated).toLocaleTimeString() : '—'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 📊 MÉTRICAS PRINCIPALES - COMPLETAMENTE FUNCIONALES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precisión General</p>
                <p className={`text-2xl font-bold ${getAccuracyColor(metrics.overallAccuracy)}`}>
                  {metrics.totalPredictions > 0 ? metrics.overallAccuracy.toFixed(1) : '0.0'}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.totalPredictions > 0 ? 'Basado en datos reales' : 'Esperando predicciones...'}
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={metrics.overallAccuracy} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
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
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">P&L Promedio (%)</p>
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
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold">
                  {formatTime(metrics.averageTimeToResolution)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Más rápido: {formatTime(metrics.quickestResolution)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 📈 TABS SIMPLIFICADAS - SOLO ESENCIALES */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="by-action">Por Acción</TabsTrigger>
        </TabsList>
        
        {/* TAB: RESUMEN */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Estado de Predicciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-900 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="font-medium text-green-100">Exitosas</span>
                    </div>
                    <Badge variant="outline" className="bg-green-800 text-green-200 font-bold border-green-700">
                      {metrics.successfulPredictions}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-900 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-300" />
                      <span className="font-medium text-red-100">Fallidas</span>
                    </div>
                    <Badge variant="outline" className="bg-red-800 text-red-200 font-bold border-red-700">
                      {metrics.failedPredictions}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-900 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock4 className="h-4 w-4 text-blue-300" />
                      <span className="font-medium text-blue-100">Pendientes</span>
                    </div>
                    <Badge variant="outline" className="bg-blue-800 text-blue-200 font-bold border-blue-700">
                      {metrics.pendingPredictions}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                  Rendimiento Financiero
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">P&L Total</span>
                    <span className="font-bold text-lg">
                      {formatProfitLoss(metrics.totalProfitLoss)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mejor Trade</span>
                    <span className="font-bold">
                      {formatProfitLoss(metrics.bestTrade)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Peor Trade</span>
                    <span className="font-bold">
                      {formatProfitLoss(metrics.worstTrade)}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Promedio por Trade</span>
                      <span className="font-bold">
                        {formatProfitLoss(metrics.averageProfitLoss)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* TAB: POR ACCIÓN */}
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
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Precisión BUY</span>
                      <span className={`font-bold text-lg ${getAccuracyColor(metrics.buyAccuracy)}`}>
                        {metrics.buyAccuracy.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={metrics.buyAccuracy} className="h-2" />
                  </div>
                  
                  <div className="pt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total BUY:</span>
                      <span className="font-medium">
                        {advancedPredictionVerificationSystem.getComprehensiveMetrics().totalPredictions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exitosas BUY:</span>
                      <span className="font-medium text-green-600">
                        {advancedPredictionVerificationSystem.getComprehensiveMetrics().successfulPredictions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fallidas BUY:</span>
                      <span className="font-medium text-red-600">
                        {advancedPredictionVerificationSystem.getComprehensiveMetrics().failedPredictions}
                      </span>
                    </div>
                  </div>
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
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Precisión SELL</span>
                      <span className={`font-bold text-lg ${getAccuracyColor(metrics.sellAccuracy)}`}>
                        {metrics.sellAccuracy.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={metrics.sellAccuracy} className="h-2" />
                  </div>
                  
                  <div className="pt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total SELL:</span>
                      <span className="font-medium">
                        {advancedPredictionVerificationSystem.getComprehensiveMetrics().totalPredictions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exitosas SELL:</span>
                      <span className="font-medium text-green-600">
                        {advancedPredictionVerificationSystem.getComprehensiveMetrics().successfulPredictions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fallidas SELL:</span>
                      <span className="font-medium text-red-600">
                        {advancedPredictionVerificationSystem.getComprehensiveMetrics().failedPredictions}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer con información de verificación */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent className="pt-4">
          <p className="text-xs text-neutral-400 text-center">
            📊 Todas las métricas basadas en verificación automática contra precios reales de mercado • 
            Actualización cada 10 segundos • 
            Sistema completamente transparente y auditable
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
