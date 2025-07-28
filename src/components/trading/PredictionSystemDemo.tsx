/**
 * 🎮 Demo del Sistema de Predicciones
 * 
 * Componente para demostrar el sistema completo de predicciones
 * con generación automática de señales y métricas en tiempo real.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { testPredictionSystem } from '../../core/testing/TestPredictionSystem';
import type { AISignal } from '../../core/ai/SuperinteligenciaAI';

interface DemoState {
  isRunning: boolean;
  signals: AISignal[];
  metrics: any;
  report: any;
  lastUpdate: Date;
}

export const PredictionSystemDemo: React.FC = () => {
  const [state, setState] = useState<DemoState>({
    isRunning: false,
    signals: [],
    metrics: { totalPredictions: 0, successfulPredictions: 0, failedPredictions: 0, pendingPredictions: 0, overallAccuracy: 0 },
    report: { summary: 'Sistema listo para comenzar...' },
    lastUpdate: new Date()
  });

  const [demoInterval, setDemoInterval] = useState<NodeJS.Timeout | null>(null);

  // Actualizar métricas cada segundo
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (state.isRunning) {
        const metrics = testPredictionSystem.getMetrics();
        const report = testPredictionSystem.getReport();
        
        setState(prev => ({
          ...prev,
          metrics,
          report,
          lastUpdate: new Date()
        }));
      }
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [state.isRunning]);

  const startDemo = () => {
    console.log('🚀 Iniciando demo del sistema de predicciones...');
    
    setState(prev => ({ ...prev, isRunning: true }));

    // Generar señales cada 8 segundos
    const interval = setInterval(() => {
      try {
        const signal = testPredictionSystem.generateTestSignal();
        const predictionId = testPredictionSystem.registerPrediction(signal);
        
        console.log(`📊 Nueva predicción generada: ${signal.symbol} ${signal.action} @${signal.price}`);
        
        setState(prev => ({
          ...prev,
          signals: [signal, ...prev.signals.slice(0, 9)] // Mantener últimas 10
        }));

        // Simular movimiento de precio después de 3-10 segundos
        setTimeout(() => {
          const priceChange = (Math.random() - 0.5) * 0.1; // ±5% change
          const newPrice = signal.price * (1 + priceChange);
          testPredictionSystem.updatePrice(signal.symbol, newPrice);
          console.log(`💹 Precio actualizado ${signal.symbol}: ${signal.price} → ${newPrice.toFixed(2)}`);
        }, 3000 + Math.random() * 7000);

      } catch (error) {
        console.error('❌ Error generando señal de demo:', error);
      }
    }, 8000);

    setDemoInterval(interval);
  };

  const stopDemo = () => {
    console.log('🛑 Deteniendo demo...');
    
    setState(prev => ({ ...prev, isRunning: false }));
    
    if (demoInterval) {
      clearInterval(demoInterval);
      setDemoInterval(null);
    }
  };

  const runQuickTest = async () => {
    console.log('⚡ Ejecutando test rápido...');
    await testPredictionSystem.runFullSystemTest();
    
    // Actualizar estado después del test
    const metrics = testPredictionSystem.getMetrics();
    const report = testPredictionSystem.getReport();
    
    setState(prev => ({
      ...prev,
      metrics,
      report,
      lastUpdate: new Date()
    }));
  };

  const formatAccuracy = (accuracy: number): string => {
    return isNaN(accuracy) ? '0.0' : accuracy.toFixed(1);
  };

  const getStatusColor = (accuracy: number): string => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">🧠 Sistema de Predicciones IA</h2>
        <p className="text-gray-600">Demo en vivo del sistema completo de análisis predictivo</p>
      </div>

      {/* Controles */}
      <div className="flex justify-center gap-4">
        {!state.isRunning ? (
          <Button onClick={startDemo} className="bg-green-600 hover:bg-green-700">
            🚀 Iniciar Demo
          </Button>
        ) : (
          <Button onClick={stopDemo} variant="destructive">
            🛑 Detener Demo
          </Button>
        )}
        
        <Button onClick={runQuickTest} variant="outline">
          ⚡ Test Rápido
        </Button>
      </div>

      {/* Estado del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Precisión General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(state.metrics.overallAccuracy)}`}>
              {formatAccuracy(state.metrics.overallAccuracy)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Predicciones Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {state.metrics.totalPredictions}
            </div>
            <div className="text-xs text-gray-500">
              {state.metrics.pendingPredictions} pendientes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Exitosas / Fallidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              <span className="text-green-600">{state.metrics.successfulPredictions}</span>
              {' / '}
              <span className="text-red-600">{state.metrics.failedPredictions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={state.isRunning ? "default" : "secondary"}>
              {state.isRunning ? "🟢 Activo" : "⚪ Inactivo"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Reporte del sistema */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Reporte del Sistema</CardTitle>
          <CardDescription>
            Último update: {state.lastUpdate.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line font-mono text-sm bg-gray-50 p-4 rounded">
            {state.report.summary}
          </div>
        </CardContent>
      </Card>

      {/* Últimas señales generadas */}
      {state.signals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Últimas Señales Generadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {state.signals.map((signal, index) => (
                <div key={signal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant={signal.action === 'BUY' ? "default" : "destructive"}>
                      {signal.action}
                    </Badge>
                    <span className="font-medium">{signal.symbol}</span>
                    <span className="text-gray-600">@{signal.price.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{signal.confidence}% confianza</div>
                    <div className="text-xs text-gray-500">{signal.timeframe}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Cómo usar</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• <strong>Iniciar Demo:</strong> Comienza la generación automática de señales cada 8 segundos</p>
          <p>• <strong>Test Rápido:</strong> Ejecuta un batch de 5 señales de prueba inmediatamente</p>
          <p>• Las métricas se actualizan automáticamente en tiempo real</p>
          <p>• El sistema simula movimientos de precios reales para verificar predicciones</p>
          <p>• Los resultados muestran métricas como "Precisión General 100.0%, P&L Promedio +12.92%"</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionSystemDemo;
