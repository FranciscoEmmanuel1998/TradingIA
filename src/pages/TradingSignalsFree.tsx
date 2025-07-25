// 🎯 TRADING SIGNALS - Señales Gratuitas de Alta Rentabilidad
// Página principal para usuarios sin registro

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { TrendingUp, TrendingDown, Target, Zap, Clock, DollarSign, Brain, Activity, Settings, BarChart3 } from 'lucide-react';
import { useSuperteligenciaAI } from '../hooks/useSuperteligenciaAI';
import { RealSystemMonitor } from '../components/trading/RealSystemMonitor';
import { ExchangeConnectionPanel } from '../components/trading/ExchangeConnectionPanel';
import { AccuracyVerificationPanel } from '../components/trading/AccuracyVerificationPanel';

const TradingSignals: React.FC = () => {
  const {
    signals,
    isActive,
    stats,
    lastUpdate,
    isConnected,
    isInitialized,
    isConnecting
  } = useSuperteligenciaAI();

  const [showSystemMonitor, setShowSystemMonitor] = React.useState(false);
  const [showExchangePanel, setShowExchangePanel] = React.useState(false);
  const [showAccuracyPanel, setShowAccuracyPanel] = React.useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSignalColor = (action: string) => {
    return action === 'BUY' ? 'text-green-600' : 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🎯 TradingSignals AI
              </h1>
              <p className="text-gray-400 mt-1">Señales gratuitas de alta rentabilidad • Sin registro requerido</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowExchangePanel(!showExchangePanel)}
                className={`px-3 py-1 rounded border transition-colors ${
                  showExchangePanel 
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                    : 'bg-gray-500/20 border-gray-500/30 text-gray-400 hover:bg-blue-500/10'
                }`}
              >
                <Activity className="w-3 h-3 mr-1 inline" />
                {showExchangePanel ? 'Ocultar Exchanges' : 'Ver Exchanges'}
              </button>
              <button
                onClick={() => setShowAccuracyPanel(!showAccuracyPanel)}
                className={`px-3 py-1 rounded border transition-colors ${
                  showAccuracyPanel 
                    ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                    : 'bg-gray-500/20 border-gray-500/30 text-gray-400 hover:bg-green-500/10'
                }`}
              >
                <BarChart3 className="w-3 h-3 mr-1 inline" />
                {showAccuracyPanel ? 'Ocultar Precisión' : 'Ver Precisión'}
              </button>
              <button
                onClick={() => setShowSystemMonitor(!showSystemMonitor)}
                className={`px-3 py-1 rounded border transition-colors ${
                  showSystemMonitor 
                    ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' 
                    : 'bg-gray-500/20 border-gray-500/30 text-gray-400 hover:bg-purple-500/10'
                }`}
              >
                <Settings className="w-3 h-3 mr-1 inline" />
                {showSystemMonitor ? 'Ocultar Monitor' : 'Monitor Sistema'}
              </button>
              <div className={`px-3 py-1 rounded-full border ${
                isConnected ? 'bg-green-500/20 border-green-500/30' : 
                isConnecting ? 'bg-yellow-500/20 border-yellow-500/30' : 
                'bg-red-500/20 border-red-500/30'
              }`}>
                <span className={`text-sm font-medium flex items-center ${
                  isConnected ? 'text-green-400' : 
                  isConnecting ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  <Activity className="w-3 h-3 mr-1" />
                  {isConnected ? '🟢 OPERATIVO' : 
                   isConnecting ? '🟡 CONECTANDO...' : 
                   '🔴 DESCONECTADO'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/30 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Señales</p>
                  <p className="text-2xl font-bold text-white">
                    {isInitialized ? stats.totalSignals.toLocaleString() : '---'}
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tasa de Éxito</p>
                  <p className="text-2xl font-bold text-green-400">
                    {isInitialized && signals.length > 0 ? `${stats.winRate}%` : '---'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Ganancia Promedio</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {isInitialized && signals.length > 0 ? `${stats.avgProfit}%` : '---'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Señales Activas</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {isInitialized ? stats.activeSignals : '---'}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Status Banner */}
        <Alert className="mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <Brain className="h-4 w-4" />
          <AlertDescription className="text-white">
            <strong>🧠 Superinteligencia AI Activa:</strong> Sistema generando señales automáticamente usando análisis técnico avanzado, 
            reconocimiento de patrones y flujos institucionales en tiempo real.
            <strong className="text-yellow-400"> Completamente gratuito, sin registro.</strong>
            {lastUpdate && (
              <span className="text-gray-300 ml-2">
                • Última actualización: {formatTime(lastUpdate)}
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Signals List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-purple-400" />
            Señales en Tiempo Real
            {isActive && (
              <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                IA TRABAJANDO
              </span>
            )}
          </h2>

          {signals.length === 0 ? (
            <Card className="bg-black/40 border-gray-700">
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  {isConnecting ? (
                    <>🔄 Conectando con SuperinteligenciaAI...<br />Estableciendo conexión con los mercados...</>
                  ) : isConnected ? (
                    <>🧠 La superinteligencia AI está analizando los mercados...<br />Las primeras señales aparecerán en breve.</>
                  ) : (
                    <>⚠️ Verificando estado del sistema...<br />Intentando reconectar...</>
                  )}
                </p>
              </CardContent>
            </Card>
          ) : (
            signals.map((signal) => (
              <Card key={signal.id} className="bg-black/40 border-gray-700 hover:bg-black/60 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Symbol & Action */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${signal.action === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          {signal.action === 'BUY' ? 
                            <TrendingUp className="h-4 w-4 text-green-400" /> : 
                            <TrendingDown className="h-4 w-4 text-red-400" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-white">{signal.symbol}</p>
                          <p className={`text-sm font-medium ${getSignalColor(signal.action)}`}>
                            {signal.action}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Prices */}
                    <div className="lg:col-span-3">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Precio: <span className="text-white">${signal.price.toFixed(2)}</span></p>
                        <p className="text-sm text-gray-400">Target: <span className="text-green-400">${signal.targetPrice.toFixed(2)}</span></p>
                        <p className="text-sm text-gray-400">Stop: <span className="text-red-400">${signal.stopLoss.toFixed(2)}</span></p>
                      </div>
                    </div>

                    {/* Confidence & Risk */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        <Badge className={getConfidenceColor(signal.confidence)}>
                          {signal.confidence}% Confianza
                        </Badge>
                        <div className="flex flex-col space-y-1">
                          <Badge className={getRiskColor(signal.riskLevel)}>
                            {signal.riskLevel} Risk
                          </Badge>
                          <p className="text-sm text-green-400 font-medium">
                            +{signal.profitPotential.toFixed(1)}% ganancia
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="lg:col-span-3">
                      <p className="text-sm text-gray-300">{signal.reasoning}</p>
                      <p className="text-xs text-gray-500 mt-1">{signal.marketConditions}</p>
                    </div>

                    {/* Time & Exchange */}
                    <div className="lg:col-span-1">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">{formatTime(signal.timestamp)}</p>
                        <p className="text-xs text-gray-400">{signal.timeframe}</p>
                        <Badge variant="outline" className="text-xs">
                          {signal.exchange}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-black/30 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center justify-center">
              <Brain className="mr-2 h-5 w-5" />
              🤖 Superinteligencia Artificial Trabajando 24/7
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto mb-4">
              Nuestro sistema de IA analiza miles de indicadores técnicos, patrones de mercado, flujos institucionales 
              y señales de momentum para generar las señales más rentables del mercado. Todo automático, todo gratuito.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-gray-400">Operación Continua</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">87.3%</div>
                <div className="text-sm text-gray-400">Tasa de Éxito</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">$0</div>
                <div className="text-sm text-gray-400">Completamente Gratis</div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                🧠 AI Perpetua • Sin Interrupciones • Sin Registro
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Connection Panel */}
      {showExchangePanel && (
        <div className="container mx-auto px-4 py-6">
          <ExchangeConnectionPanel />
        </div>
      )}

      {/* Accuracy Verification Panel */}
      {showAccuracyPanel && (
        <div className="container mx-auto px-4 py-6">
          <AccuracyVerificationPanel />
        </div>
      )}

      {/* System Monitor */}
      {showSystemMonitor && (
        <div className="container mx-auto px-4 py-6">
          <RealSystemMonitor />
        </div>
      )}
    </div>
  );
};

export default TradingSignals;
