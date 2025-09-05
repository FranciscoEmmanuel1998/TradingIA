// 🔥 NUEVO DASHBOARD REAL - SIN SIMULACIONES NI BACKTESTING FALSO
// Reemplaza SignalPerformanceTracker.tsx con métricas 100% verificables

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { realSignalTracker } from '../../core/verification/RealSignalTracker';

interface RealDashboardProps {
  className?: string;
}

export const RealPerformanceDashboard: React.FC<RealDashboardProps> = ({ className }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [activeSignals, setActiveSignals] = useState<any[]>([]);
  const [completedSignals, setCompletedSignals] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Actualizar métricas cada 10 segundos
    const interval = setInterval(() => {
      updateRealMetrics();
    }, 10000);

    // Carga inicial
    updateRealMetrics();

    return () => clearInterval(interval);
  }, []);

  const updateRealMetrics = () => {
    try {
      const realMetrics = realSignalTracker.getRealPerformanceMetrics();
      const active = realSignalTracker.getActiveSignals();
      const completed = realSignalTracker.getCompletedSignals();

      setMetrics(realMetrics);
      setActiveSignals(active);
      setCompletedSignals(completed);
      setLastUpdate(new Date());

      console.log('📊 MÉTRICAS REALES ACTUALIZADAS:', realMetrics);
    } catch (error) {
      console.error('❌ Error obteniendo métricas reales:', error);
    }
  };

  const startTracking = () => {
    realSignalTracker.startRealTracking();
    setIsTracking(true);
    console.log('🎯 TRACKING REAL INICIADO - Solo datos de mercado verificables');
  };

  const stopTracking = () => {
    realSignalTracker.stopRealTracking();
    setIsTracking(false);
    console.log('⏹️ TRACKING REAL DETENIDO');
  };

  const verifyIntegrity = () => {
    const integrity = realSignalTracker.verifyDataIntegrity();
    
    if (integrity.isValid) {
      alert('✅ VERIFICACIÓN EXITOSA: Todos los datos son reales y verificables');
    } else {
      alert(`❌ PROBLEMAS DETECTADOS:\n${integrity.issues.join('\n')}`);
    }
  };

  if (!metrics) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            🔍 Cargando métricas reales...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header de Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            📊 Dashboard de Performance REAL
            <div className="flex gap-2">
              <Button
                onClick={isTracking ? stopTracking : startTracking}
                variant={isTracking ? "destructive" : "default"}
                size="sm"
              >
                {isTracking ? '⏹️ Detener' : '▶️ Iniciar'} Tracking Real
              </Button>
              <Button onClick={verifyIntegrity} variant="outline" size="sm">
                🔍 Verificar Integridad
              </Button>
            </div>
          </CardTitle>
          <p className="text-sm text-gray-600">
            ⚠️ Solo métricas basadas en precios reales de mercado • 
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </p>
        </CardHeader>
      </Card>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {metrics.realWinRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Win Rate REAL</p>
            <p className="text-xs text-gray-500">
              {metrics.realWins}/{metrics.signalsExecuted} señales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${metrics.totalRealPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${metrics.totalRealPnL.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">PnL Total REAL</p>
            <p className="text-xs text-gray-500">
              Promedio: ${metrics.avgRealPnL.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.realProfitFactor.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Profit Factor</p>
            <p className="text-xs text-gray-500">
              {metrics.realProfitFactor > 1 ? 'Rentable' : 'No rentable'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.avgDurationMinutes.toFixed(0)}min
            </div>
            <p className="text-sm text-gray-600">Duración Promedio</p>
            <p className="text-xs text-gray-500">
              Más rápida: {metrics.fastestWin}min
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Señales Activas */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Señales Activas ({activeSignals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activeSignals.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay señales activas siendo rastreadas
            </p>
          ) : (
            <div className="space-y-2">
              {activeSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-blue-50"
                >
                  <div>
                    <span className="font-medium">{signal.symbol}</span>
                    <Badge variant={signal.action === 'BUY' ? 'default' : 'destructive'} className="ml-2">
                      {signal.action}
                    </Badge>
                    <span className="ml-2 text-sm text-gray-600">
                      Entrada: ${signal.entryPrice} → Target: ${signal.targetPrice}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${signal.realPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${signal.realPnL.toFixed(2)} ({signal.realPnLPercentage.toFixed(2)}%)
                    </div>
                    <div className="text-xs text-gray-500">
                      {signal.durationMinutes}min • ${signal.currentPrice?.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Últimas Señales Completadas */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Últimas Señales Completadas</CardTitle>
        </CardHeader>
        <CardContent>
          {completedSignals.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay señales completadas aún
            </p>
          ) : (
            <div className="space-y-2">
              {completedSignals.slice(-5).reverse().map((signal) => (
                <div
                  key={signal.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    signal.status === 'WIN' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div>
                    <span className="font-medium">{signal.symbol}</span>
                    <Badge variant={signal.action === 'BUY' ? 'default' : 'destructive'} className="ml-2">
                      {signal.action}
                    </Badge>
                    <Badge 
                      variant={signal.status === 'WIN' ? 'default' : 'destructive'} 
                      className="ml-2"
                    >
                      {signal.status}
                    </Badge>
                    <span className="ml-2 text-sm text-gray-600">
                      ${signal.entryPrice} → ${signal.currentPrice?.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${signal.realPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${signal.realPnL.toFixed(2)} ({signal.realPnLPercentage.toFixed(2)}%)
                    </div>
                    <div className="text-xs text-gray-500">
                      {signal.durationMinutes}min
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advertencia de Transparencia */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-800 mb-2">🔍 Verificación de Transparencia</h4>
          <p className="text-sm text-blue-700">
            • Todos los precios obtenidos de APIs públicas en tiempo real<br/>
            • PnL calculado sobre movimientos reales de mercado<br/>
            • Sin simulaciones, backtesting inflado o datos hardcodeados<br/>
            • Código fuente completamente auditable<br/>
            • Fuente: {metrics.dataSource}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealPerformanceDashboard;
