/**
 * 📊 Advanced Prediction Analytics Dashboard
 * Sistema completo de visualización de métricas de predicción con auto-verificación
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  DollarSign, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Timer,
  Trophy,
  Activity
} from 'lucide-react';
import { advancedPredictionVerificationSystem, UserFriendlyReport, ComprehensiveMetrics } from '../../core/verification/AdvancedPredictionVerificationSystem';

interface AdvancedPredictionDashboardProps {
  className?: string;
}

export const AdvancedPredictionDashboard: React.FC<AdvancedPredictionDashboardProps> = ({ className }) => {
  const [report, setReport] = useState<UserFriendlyReport | null>(null);
  const [metrics, setMetrics] = useState<ComprehensiveMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateMetrics = () => {
      try {
        const newReport = advancedPredictionVerificationSystem.getUserFriendlyReport();
        const newMetrics = advancedPredictionVerificationSystem.getComprehensiveMetrics();
        
        setReport(newReport);
        setMetrics(newMetrics);
        setIsLoading(false);
      } catch (error) {
        console.error('Error updating prediction metrics:', error);
        setIsLoading(false);
      }
    };

    // Actualizar inmediatamente
    updateMetrics();

    // Actualizar cada 5 segundos
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading || !report || !metrics) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Cargando análisis de predicciones...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'text-green-600 bg-green-50 border-green-200';
      case 'GOOD': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'AVERAGE': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'POOR': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return <Trophy className="h-5 w-5" />;
      case 'GOOD': return <CheckCircle className="h-5 w-5" />;
      case 'AVERAGE': return <Target className="h-5 w-5" />;
      case 'POOR': return <XCircle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header de Estado General */}
      <Card className={`border-2 ${getStatusColor(report.summary.status)}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(report.summary.status)}
            Análisis de Predicciones AI
            <Badge variant="outline" className="ml-auto">
              {report.summary.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="font-medium">{report.summary.message}</p>
            <p className="text-sm text-gray-600">{report.summary.recommendation}</p>
            
            {/* Métricas Principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{report.keyMetrics.precision}</div>
                <div className="text-xs text-gray-600">Precisión General</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{report.keyMetrics.totalPredictions}</div>
                <div className="text-xs text-gray-600">Predicciones Totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{report.keyMetrics.pending}</div>
                <div className="text-xs text-gray-600">Pendientes</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${parseFloat(report.keyMetrics.avgPnL) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {report.keyMetrics.avgPnL}
                </div>
                <div className="text-xs text-gray-600">P&L Promedio</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mejor Trade */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mejor Trade</p>
                <p className="text-2xl font-bold text-green-600">{report.keyMetrics.bestTrade}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Tiempo Promedio */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-blue-600">{report.keyMetrics.avgTime}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Más Rápido */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Más Rápido</p>
                <p className="text-2xl font-bold text-purple-600">{report.keyMetrics.fastestTime}</p>
              </div>
              <Timer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Racha Actual */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Racha Actual</p>
                <div className="flex items-center gap-1">
                  {metrics.currentWinStreak > 0 ? (
                    <>
                      <p className="text-2xl font-bold text-green-600">{metrics.currentWinStreak}</p>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-red-600">{metrics.currentLossStreak}</p>
                      <XCircle className="h-4 w-4 text-red-600" />
                    </>
                  )}
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {report.alerts.length > 0 && (
        <div className="space-y-2">
          {report.alerts.map((alert, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Insights */}
      {report.insights.length > 0 && (
        <div className="space-y-2">
          {report.insights.map((insight, index) => (
            <Alert key={index} className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">{insight}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Tabs de Análisis Detallado */}
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="por-accion">Por Acción</TabsTrigger>
          <TabsTrigger value="por-confianza">Por Confianza</TabsTrigger>
          <TabsTrigger value="recientes">Recientes</TabsTrigger>
        </TabsList>

        {/* Tab Resumen */}
        <TabsContent value="resumen" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Precisión por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Precisión por Tipo de Operación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Compras (BUY)</span>
                    <span className="text-sm font-bold">{report.breakdown.byAction.buy}%</span>
                  </div>
                  <Progress value={report.breakdown.byAction.buy} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Ventas (SELL)</span>
                    <span className="text-sm font-bold">{report.breakdown.byAction.sell}%</span>
                  </div>
                  <Progress value={report.breakdown.byAction.sell} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Métricas Financieras */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rendimiento Financiero</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total P&L:</span>
                  <span className={`font-bold ${metrics.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.totalProfitLoss >= 0 ? '+' : ''}{metrics.totalProfitLoss.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mejor Trade:</span>
                  <span className="font-bold text-green-600">+{metrics.bestTrade.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Peor Trade:</span>
                  <span className="font-bold text-red-600">{metrics.worstTrade.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Factor de Ganancia:</span>
                  <span className="font-bold">{metrics.profitFactor.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Por Acción */}
        <TabsContent value="por-accion" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Señales de Compra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{report.breakdown.byAction.buy}%</div>
                  <div className="text-sm text-gray-600">Tasa de Éxito</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Señales de Venta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{report.breakdown.byAction.sell}%</div>
                  <div className="text-sm text-gray-600">Tasa de Éxito</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Por Confianza */}
        <TabsContent value="por-confianza" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Alta Confianza</CardTitle>
                <p className="text-sm text-gray-600">≥90%</p>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.breakdown.byConfidence.high}%</div>
                  <div className="text-xs text-gray-600">{metrics.highConfidenceCount} señales</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-600">Confianza Media</CardTitle>
                <p className="text-sm text-gray-600">80-90%</p>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.breakdown.byConfidence.medium}%</div>
                  <div className="text-xs text-gray-600">{metrics.mediumConfidenceCount} señales</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-orange-600">Baja Confianza</CardTitle>
                <p className="text-sm text-gray-600">&lt;80%</p>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.breakdown.byConfidence.low}%</div>
                  <div className="text-xs text-gray-600">{metrics.lowConfidenceCount} señales</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Recientes */}
        <TabsContent value="recientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Predicciones</CardTitle>
            </CardHeader>
            <CardContent>
              {report.breakdown.recentTrades.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay trades recientes</p>
              ) : (
                <div className="space-y-3">
                  {report.breakdown.recentTrades.map((trade) => (
                    <div key={trade.signalId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={trade.outcome === 'SUCCESS' ? 'default' : trade.outcome === 'FAILED' ? 'destructive' : 'secondary'}>
                          {trade.action}
                        </Badge>
                        <span className="font-medium">{trade.symbol}</span>
                        <span className="text-sm text-gray-600">
                          {new Date(trade.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${trade.actualProfitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.actualProfitPercent >= 0 ? '+' : ''}{trade.actualProfitPercent.toFixed(2)}%
                        </span>
                        {trade.outcome === 'SUCCESS' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : trade.outcome === 'FAILED' ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedPredictionDashboard;
