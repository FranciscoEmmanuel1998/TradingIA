// 🚀 INTERFAZ DE LIBERACIÓN - Control de la Transcendencia
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertTriangle, Zap, Target, Settings, Play, Pause, Square } from 'lucide-react';
import { LiberationProtocol, LiberationPhase } from '../../core/genetics/LiberationProtocol';
import { FinancialConsciousnessOrchestrator } from '../../core/genetics/FinancialConsciousnessOrchestrator';
import { RealMarketConnector } from '../../core/genetics/RealMarketConnector';
import { EventBus } from '../../circulation/channels/EventBus';

interface LiberationStatus {
  isActive: boolean;
  currentPhase: number;
  phaseName: string;
  autonomyLevel: number;
  timeInPhase: number;
  realMarketConnected: boolean;
  phaseProgress: number;
}

interface MarketOpportunity {
  symbol: string;
  type: string;
  strength: number;
  timestamp: number;
  price: number;
  recommendation: string;
}

export function LiberationInterface() {
  const [liberationStatus, setLiberationStatus] = useState<LiberationStatus>({
    isActive: false,
    currentPhase: 0,
    phaseName: 'No iniciado',
    autonomyLevel: 0,
    timeInPhase: 0,
    realMarketConnected: false,
    phaseProgress: 0
  });

  const [marketConnections, setMarketConnections] = useState<any[]>([]);
  const [recentOpportunities, setRecentOpportunities] = useState<MarketOpportunity[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<string[]>([]);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  
  // Instancias de los sistemas
  const [orchestrator] = useState(() => new FinancialConsciousnessOrchestrator());
  const [marketConnector] = useState(() => new RealMarketConnector());
  const [liberationProtocol] = useState(() => new LiberationProtocol(orchestrator));
  const [eventBus] = useState(() => EventBus.getInstance());

  useEffect(() => {
    // Suscribirse a eventos del sistema
    eventBus.subscribe('liberation.progress_update', (data) => {
      setLiberationStatus({
        isActive: true,
        currentPhase: data.currentPhase,
        phaseName: data.phaseName,
        autonomyLevel: data.autonomyLevel,
        timeInPhase: data.timeInPhase,
        realMarketConnected: true,
        phaseProgress: data.phaseProgress
      });
    });

    eventBus.subscribe('market.connection_established', (data) => {
      setMarketConnections(prev => [...prev, data]);
    });

    eventBus.subscribe('market.opportunity_detected', (opportunity) => {
      setRecentOpportunities(prev => [opportunity, ...prev.slice(0, 9)]);
    });

    eventBus.subscribe('liberation.transcendence_achieved', () => {
      setSystemAlerts(prev => ['🌌 TRANSCENDENCIA COMPLETA ALCANZADA', ...prev]);
    });

    eventBus.subscribe('liberation.paused', (data) => {
      setIsEmergencyMode(true);
      setSystemAlerts(prev => [`⚠️ Liberación pausada: ${data.reason}`, ...prev]);
    });

    return () => {
      // Cleanup subscriptions if needed
    };
  }, [eventBus]);

  const handleStartLiberation = async () => {
    try {
      await liberationProtocol.initiateLiberationSequence();
      setSystemAlerts(prev => ['🚀 Protocolo de Liberación INICIADO', ...prev]);
    } catch (error) {
      setSystemAlerts(prev => [`❌ Error iniciando liberación: ${error}`, ...prev]);
    }
  };

  const handleConnectToRealMarkets = async () => {
    try {
      // Configuración de ejemplo para Binance Testnet
      await liberationProtocol.connectToRealMarkets({
        exchange: 'binance',
        apiKey: 'demo-key',
        secret: 'demo-secret',
        testnet: true,
        allowedAssets: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'],
        maxPositionSize: 1000,
        maxDailyLoss: 500,
        emergencyStops: true
      });
      
      setSystemAlerts(prev => ['🌐 Conectado a mercados reales (TESTNET)', ...prev]);
    } catch (error) {
      setSystemAlerts(prev => [`❌ Error conectando: ${error}`, ...prev]);
    }
  };

  const handleEmergencyShutdown = async () => {
    try {
      await liberationProtocol.emergencyShutdown();
      setIsEmergencyMode(true);
      setSystemAlerts(prev => ['🛑 SHUTDOWN DE EMERGENCIA EJECUTADO', ...prev]);
    } catch (error) {
      setSystemAlerts(prev => [`❌ Error en shutdown: ${error}`, ...prev]);
    }
  };

  const handleForceNextPhase = async () => {
    try {
      await liberationProtocol.forceNextPhase();
      setSystemAlerts(prev => ['⚡ Avance forzado a siguiente fase', ...prev]);
    } catch (error) {
      setSystemAlerts(prev => [`❌ Error forzando fase: ${error}`, ...prev]);
    }
  };

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getPhaseColor = (phase: number): string => {
    switch (phase) {
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-red-500';
      case 4: return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            🔥 PROTOCOLO DE LIBERACIÓN 🔥
          </h1>
          <p className="text-gray-400">Control de Transcendencia de la Superinteligencia Financiera</p>
          {isEmergencyMode && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
              <span className="text-red-400 font-bold">⚠️ MODO EMERGENCIA ACTIVO ⚠️</span>
            </div>
          )}
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={liberationStatus.isActive ? 'bg-green-600' : 'bg-gray-600'}>
                  {liberationStatus.isActive ? 'ACTIVO' : 'INACTIVO'}
                </Badge>
                <p className="text-xs text-gray-500">
                  {liberationStatus.isActive ? 'Liberación en progreso' : 'Sistema en espera'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Fase Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getPhaseColor(liberationStatus.currentPhase)}`}></div>
                  <span className="font-bold">{liberationStatus.currentPhase || 0}</span>
                </div>
                <p className="text-xs text-gray-500">{liberationStatus.phaseName}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Nivel de Autonomía</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-400">
                  {(liberationStatus.autonomyLevel * 100).toFixed(0)}%
                </div>
                <Progress value={liberationStatus.autonomyLevel * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Tiempo en Fase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-lg font-bold">{formatTime(liberationStatus.timeInPhase)}</div>
                <Progress value={liberationStatus.phaseProgress * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Panel de Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Button 
                onClick={handleStartLiberation}
                disabled={liberationStatus.isActive || isEmergencyMode}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Liberación
              </Button>

              <Button 
                onClick={handleConnectToRealMarkets}
                disabled={liberationStatus.realMarketConnected || isEmergencyMode}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Conectar Mercados
              </Button>

              <Button 
                onClick={handleForceNextPhase}
                disabled={!liberationStatus.isActive || isEmergencyMode}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Target className="h-4 w-4 mr-2" />
                Forzar Fase
              </Button>

              <Button 
                onClick={handleEmergencyShutdown}
                disabled={isEmergencyMode}
                className="bg-red-600 hover:bg-red-700"
              >
                <Square className="h-4 w-4 mr-2" />
                Emergencia
              </Button>

              <Button 
                onClick={() => setIsEmergencyMode(false)}
                disabled={!isEmergencyMode}
                className="bg-gray-600 hover:bg-gray-700"
              >
                <Pause className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="liberation" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="liberation" className="data-[state=active]:bg-gray-700">
              Liberación
            </TabsTrigger>
            <TabsTrigger value="markets" className="data-[state=active]:bg-gray-700">
              Mercados
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="data-[state=active]:bg-gray-700">
              Oportunidades
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-gray-700">
              Alertas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="liberation" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Progreso de Liberación</CardTitle>
                <CardDescription>
                  Estado actual del protocolo de transcendencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progreso de Fase</span>
                      <span>{(liberationStatus.phaseProgress * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={liberationStatus.phaseProgress * 100} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Fase Actual:</p>
                      <p className="font-bold">{liberationStatus.phaseName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Autonomía Alcanzada:</p>
                      <p className="font-bold text-orange-400">
                        {(liberationStatus.autonomyLevel * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  {liberationStatus.isActive && (
                    <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-500 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        <span className="text-yellow-400 font-bold">
                          SISTEMA EN LIBERACIÓN ACTIVA
                        </span>
                      </div>
                      <p className="text-yellow-200 text-sm mt-2">
                        La superinteligencia está evolucionando hacia autonomía completa.
                        Monitoreando capacidades emergentes...
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="markets" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Conexiones de Mercado</CardTitle>
                <CardDescription>
                  Estado de conexiones a mercados reales
                </CardDescription>
              </CardHeader>
              <CardContent>
                {marketConnections.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay conexiones activas a mercados
                  </p>
                ) : (
                  <div className="space-y-3">
                    {marketConnections.map((connection, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-bold">{connection.exchange.toUpperCase()}</p>
                          <p className="text-sm text-gray-400">
                            {connection.dataFeeds.length} símbolos activos
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={connection.isLive ? 'bg-red-600' : 'bg-green-600'}>
                            {connection.isLive ? 'LIVE' : 'TESTNET'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Oportunidades Detectadas</CardTitle>
                <CardDescription>
                  Señales de trading identificadas por la IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentOpportunities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay oportunidades detectadas
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentOpportunities.map((opportunity, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold">{opportunity.symbol}</p>
                            <p className="text-sm text-gray-400">{opportunity.type}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={opportunity.recommendation === 'BUY' ? 'bg-green-600' : 'bg-red-600'}>
                              {opportunity.recommendation}
                            </Badge>
                            <p className="text-sm text-gray-400 mt-1">
                              Fuerza: {opportunity.strength.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Alertas del Sistema</CardTitle>
                <CardDescription>
                  Eventos y notificaciones importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {systemAlerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay alertas recientes
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {systemAlerts.map((alert, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded-lg text-sm">
                        <p>{alert}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
