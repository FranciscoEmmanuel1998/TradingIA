// 🔥 MONITOR DE SISTEMA REAL - Verificar estado de conexiones y datos
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { realSystemInitializer } from '../../core/initialization/RealSystemInitializer';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface SystemStatus {
  initialized: boolean;
  connections: Map<string, any>;
  dataFlow: any;
  latency: number;
}

export const RealSystemMonitor: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Obtener estado inicial
    updateSystemStatus();

    // Actualizar cada 10 segundos
    const interval = setInterval(updateSystemStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const updateSystemStatus = () => {
    try {
      const status = realSystemInitializer.getSystemStatus();
      setSystemStatus(status);
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Error obteniendo estado del sistema:', error);
      setIsLoading(false);
    }
  };

  const getConnectionStatusIcon = (connected: boolean) => {
    return connected ? 
      <CheckCircle className="h-4 w-4 text-green-400" /> : 
      <AlertTriangle className="h-4 w-4 text-red-400" />;
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-400';
    if (latency < 200) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLatencyBadgeVariant = (latency: number) => {
    if (latency < 100) return 'default';
    if (latency < 200) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card className="bg-black/40 border-gray-700">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 text-purple-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-400">Cargando estado del sistema...</p>
        </CardContent>
      </Card>
    );
  }

  if (!systemStatus) {
    return (
      <Card className="bg-black/40 border-red-500/30">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">Error obteniendo estado del sistema</p>
        </CardContent>
      </Card>
    );
  }

  const connectedCount = Array.from(systemStatus.connections.values())
    .filter((status: any) => status.connected).length;
  const totalExchanges = systemStatus.connections.size;

  return (
    <div className="space-y-4">
      {/* Estado General */}
      <Card className="bg-black/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="h-5 w-5 mr-2 text-purple-400" />
            Estado del Sistema Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {systemStatus.initialized ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-400">
                {systemStatus.initialized ? 'Inicializado' : 'No Inicializado'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {connectedCount}/{totalExchanges}
              </div>
              <div className="text-sm text-gray-400">Exchanges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {systemStatus.dataFlow?.activeSymbols || 0}
              </div>
              <div className="text-sm text-gray-400">Símbolos</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${getLatencyColor(systemStatus.latency)}`}>
                {systemStatus.latency.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-400">Latencia</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de Conexiones */}
      <Card className="bg-black/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Wifi className="h-5 w-5 mr-2 text-blue-400" />
            Estado de Exchanges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from(systemStatus.connections.entries()).map(([exchange, status]: [string, any]) => (
              <div key={exchange} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                <div className="flex items-center space-x-3">
                  {getConnectionStatusIcon(status.connected)}
                  <span className="text-white font-medium">{exchange}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={status.connected ? 'default' : 'destructive'}>
                    {status.connected ? 'Conectado' : 'Desconectado'}
                  </Badge>
                  {status.latency && (
                    <Badge variant={getLatencyBadgeVariant(status.latency)}>
                      {status.latency}ms
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flujo de Datos */}
      <Card className="bg-black/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-400" />
            Flujo de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total de Ticks:</span>
              <span className="text-white font-mono">
                {systemStatus.dataFlow?.totalTicks?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Última Actualización:</span>
              <span className="text-white font-mono">
                {new Date(systemStatus.dataFlow?.lastUpdate || 0).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Sistema Activo:</span>
              <Badge variant={systemStatus.dataFlow?.isActive ? 'default' : 'destructive'}>
                {systemStatus.dataFlow?.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {connectedCount < totalExchanges && (
        <Alert className="border-yellow-500/50 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-yellow-200">
            <strong>Advertencia:</strong> No todos los exchanges están conectados. 
            Esto puede afectar la calidad de las señales.
          </AlertDescription>
        </Alert>
      )}

      {systemStatus.latency > 150 && (
        <Alert className="border-red-500/50 bg-red-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            <strong>Latencia Alta:</strong> La latencia está por encima de 150ms. 
            Esto puede afectar la precisión de las señales.
          </AlertDescription>
        </Alert>
      )}

      {!systemStatus.dataFlow?.isActive && (
        <Alert className="border-red-500/50 bg-red-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            <strong>Sistema Inactivo:</strong> El flujo de datos no está activo. 
            Las señales pueden no estar siendo generadas.
          </AlertDescription>
        </Alert>
      )}

      {/* Info de última actualización */}
      <div className="text-center text-gray-500 text-sm">
        Última actualización: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};
