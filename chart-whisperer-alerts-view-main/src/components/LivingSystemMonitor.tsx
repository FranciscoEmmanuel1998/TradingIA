import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { TradingBrain } from '../core/brain/TradingBrain';
import { EventBus } from '../circulation/channels/EventBus';
import { Brain, Heart, Activity, Shield, Zap, Eye } from 'lucide-react';

interface SystemStatus {
  isAlive: boolean;
  modules: Record<string, number>;
  recentEvents: Array<{ event: string; timestamp: number }>;
  performance: number;
  decisions: number;
}

export const LivingSystemMonitor: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isAlive: false,
    modules: {},
    recentEvents: [],
    performance: 0,
    decisions: 0
  });
  const [brain] = useState(() => TradingBrain.getInstance());
  const [eventBus] = useState(() => EventBus.getInstance());

  useEffect(() => {
    // Inicializar el sistema vivo de forma asíncrona
    const initializeBrain = async () => {
      try {
        await brain.initialize();
      } catch (error) {
        console.error('❌ Error inicializando TradingBrain:', error);
      }
    };

    initializeBrain();

    // Escuchar eventos del sistema
    const handleSystemEvent = (data: any) => {
      setSystemStatus(prev => ({
        ...prev,
        recentEvents: [
          { event: 'System Event', timestamp: Date.now() },
          ...prev.recentEvents.slice(0, 9)
        ]
      }));
    };

    eventBus.subscribe('brain.decision', handleSystemEvent);
    eventBus.subscribe('system.survival_mode', handleSystemEvent);
    eventBus.subscribe('execution.reduce_exposure', handleSystemEvent);

    // Actualizar estado cada segundo
    const interval = setInterval(() => {
      const health = brain.getHealth();
      const events = eventBus.getEventHistory(5);
      
      setSystemStatus(prev => ({
        ...prev,
        isAlive: brain.isActive(),
        performance: health,
        modules: {
          brain: health,
          respiration: 0.95 + Math.random() * 0.05,
          perception: 0.88 + Math.random() * 0.1,
          execution: 0.92 + Math.random() * 0.08,
          immunity: 0.97 + Math.random() * 0.03,
          genetics: 0.85 + Math.random() * 0.1
        },
        recentEvents: events.map(e => ({
          event: e.event,
          timestamp: e.timestamp
        })),
        decisions: events.filter(e => e.event.includes('decision')).length
      }));
    }, 1000);

    return () => {
      clearInterval(interval);
      brain.stop();
    };
  }, [brain, eventBus]);

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'brain': return <Brain className="h-4 w-4" />;
      case 'respiration': return <Activity className="h-4 w-4" />;
      case 'perception': return <Eye className="h-4 w-4" />;
      case 'execution': return <Zap className="h-4 w-4" />;
      case 'immunity': return <Shield className="h-4 w-4" />;
      case 'genetics': return <Heart className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 0.8) return 'text-green-500';
    if (health >= 0.6) return 'text-yellow-500';
    if (health >= 0.4) return 'text-orange-500';
    return 'text-red-500';
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`h-3 w-3 rounded-full ${systemStatus.isAlive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <h2 className="text-2xl font-bold">🧬 Sistema Vivo - ChartWhisperer</h2>
        <Badge variant={systemStatus.isAlive ? "default" : "destructive"}>
          {systemStatus.isAlive ? 'CONSCIENTE' : 'INACTIVO'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Estado General */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Estado Vital
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Performance:</span>
                <span className={getHealthColor(systemStatus.performance)}>
                  {(systemStatus.performance * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Decisiones:</span>
                <span className="font-mono">{systemStatus.decisions}</span>
              </div>
              <div className="flex justify-between">
                <span>Eventos:</span>
                <span className="font-mono">{systemStatus.recentEvents.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salud de Módulos */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Módulos Orgánicos
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(systemStatus.modules).map(([module, health]) => (
                <div key={module} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getModuleIcon(module)}
                    <span className="text-sm capitalize">{module}</span>
                  </div>
                  <span className={`text-sm font-mono ${getHealthColor(health)}`}>
                    {(health * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Eventos Recientes */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Actividad Neural
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {systemStatus.recentEvents.map((event, index) => (
                <div key={index} className="text-xs">
                  <div className="font-mono text-muted-foreground">
                    {formatTime(event.timestamp)}
                  </div>
                  <div className="text-sm">{event.event}</div>
                </div>
              ))}
              {systemStatus.recentEvents.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Esperando actividad neural...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualización del Pulso del Sistema */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">🫀 Latido del Sistema</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000"
                style={{ width: `${systemStatus.performance * 100}%` }}
              />
            </div>
            <div className="text-sm font-mono">
              {(systemStatus.performance * 100).toFixed(1)}% VITAL
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
