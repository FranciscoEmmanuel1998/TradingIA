// 🎛️ CONTROL CENTRAL DASHBOARD - Panel de control del sistema optimizado
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Shield, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  Settings,
  RefreshCw,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { SignalMonitorPanel } from './SignalMonitorPanel';
import { SignalPerformanceTracker } from './SignalPerformanceTracker';
import { enhancedSystemIntegrator, SystemStatus } from '@/core/integration/EnhancedSystemIntegrator';

export function OptimizedTradingDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isActive: false,
    dataQuality: 'OFFLINE',
    signalsGenerated: 0,
    dataSourcesOnline: 0,
    lastUpdate: new Date(),
    avgResponseTime: 0,
    errorRate: 0
  });
  
  const [isSystemRunning, setIsSystemRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  useEffect(() => {
    // Actualizar estado cada 10 segundos
    const statusInterval = setInterval(() => {
      const status = enhancedSystemIntegrator.getSystemStatus();
      setSystemStatus(status);
      setIsSystemRunning(status.isActive);
      setLastRefresh(new Date());
    }, 10000);
    
    // Carga inicial
    const initialStatus = enhancedSystemIntegrator.getSystemStatus();
    setSystemStatus(initialStatus);
    setIsSystemRunning(initialStatus.isActive);
    
    return () => clearInterval(statusInterval);
  }, []);
  
  const handleStartSystem = async () => {
    try {
      setIsSystemRunning(true);
      await enhancedSystemIntegrator.start();
      console.log('✅ Sistema iniciado desde dashboard');
    } catch (error) {
      console.error('❌ Error iniciando sistema:', error);
      setIsSystemRunning(false);
    }
  };
  
  const handleStopSystem = () => {
    enhancedSystemIntegrator.stop();
    setIsSystemRunning(false);
    console.log('⏹️ Sistema detenido desde dashboard');
  };
  
  const handleRefreshStats = () => {
    const detailedStats = enhancedSystemIntegrator.getDetailedStats();
    setStats(detailedStats);
    setLastRefresh(new Date());
    console.log('🔄 Estadísticas actualizadas');
  };
  
  const getDataQualityColor = (quality: string) => {
    switch (quality) {
      case 'EXCELLENT': return 'text-green-600 bg-green-100';
      case 'GOOD': return 'text-blue-600 bg-blue-100';
      case 'POOR': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-red-600 bg-red-100';
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      {/* Header del Dashboard */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            🚀 Enhanced Trading System
          </h1>
          <p className="text-gray-600 mt-2">Sistema de trading optimizado con datos gratuitos de alta calidad</p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={handleRefreshStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          
          {!isSystemRunning ? (
            <Button onClick={handleStartSystem} className="bg-green-600 hover:bg-green-700" size="lg">
              <PlayCircle className="w-5 h-5 mr-2" />
              Iniciar Sistema
            </Button>
          ) : (
            <Button onClick={handleStopSystem} variant="destructive" size="lg">
              <PauseCircle className="w-5 h-5 mr-2" />
              Detener Sistema
            </Button>
          )}
        </div>
      </div>
      
      {/* Estado del Sistema */}
      <Alert className={isSystemRunning ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <Activity className={`w-4 h-4 ${isSystemRunning ? 'text-green-600' : 'text-yellow-600'}`} />
        <AlertDescription className={isSystemRunning ? 'text-green-800' : 'text-yellow-800'}>
          <div className="flex justify-between items-center">
            <div>
              <strong>Estado:</strong> {isSystemRunning ? 'SISTEMA ACTIVO - Generando señales en tiempo real' : 'SISTEMA INACTIVO - Presiona "Iniciar Sistema" para comenzar'}
            </div>
            <div className="text-sm">
              Última actualización: {formatTime(lastRefresh)}
            </div>
          </div>
        </AlertDescription>
      </Alert>
      
      {/* Métricas Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{systemStatus.signalsGenerated}</div>
                <div className="text-sm text-gray-600">Señales Generadas</div>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{systemStatus.dataSourcesOnline}</div>
                <div className="text-sm text-gray-600">Fuentes Online</div>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getDataQualityColor(systemStatus.dataQuality).split(' ')[0]}`}>
                  {systemStatus.dataQuality}
                </div>
                <div className="text-sm text-gray-600">Calidad de Datos</div>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{systemStatus.avgResponseTime.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">Tiempo Respuesta</div>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{systemStatus.errorRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Tasa de Error</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {isSystemRunning ? formatUptime(Date.now() - systemStatus.lastUpdate.getTime()) : '0h 0m'}
                </div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <Activity className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Indicadores de Salud del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4" />
              Sistema de Señales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${isSystemRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isSystemRunning ? 'Operativo' : 'Inactivo'}
              </span>
            </div>
            <Progress value={isSystemRunning ? 100 : 0} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              Fuentes de Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${systemStatus.dataSourcesOnline > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {systemStatus.dataSourcesOnline} de 3 activas
              </span>
            </div>
            <Progress value={(systemStatus.dataSourcesOnline / 3) * 100} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              Calidad General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDataQualityColor(systemStatus.dataQuality)}>
                {systemStatus.dataQuality}
              </Badge>
            </div>
            <Progress 
              value={
                systemStatus.dataQuality === 'EXCELLENT' ? 100 :
                systemStatus.dataQuality === 'GOOD' ? 75 :
                systemStatus.dataQuality === 'POOR' ? 50 : 0
              } 
              className="h-2" 
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs del Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard Principal</TabsTrigger>
          <TabsTrigger value="signals">Monitor de Señales</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumen de Rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Resumen del Sistema</CardTitle>
                <CardDescription>
                  Métricas clave del sistema optimizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Win Rate Objetivo</span>
                    <span className="text-sm font-bold text-green-600">65%+</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Risk/Reward Ratio</span>
                    <span className="text-sm font-bold text-blue-600">1.5:1+</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sharpe Ratio Target</span>
                    <span className="text-sm font-bold text-purple-600">1.5+</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            {/* Estado de APIs Gratuitas */}
            <Card>
              <CardHeader>
                <CardTitle>🌐 APIs Gratuitas</CardTitle>
                <CardDescription>
                  Estado de las fuentes de datos sin costo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Alpha Vantage</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">500/día</Badge>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Yahoo Finance</span>
                  </div>
                  <Badge variant="outline" className="text-blue-600">Ilimitado</Badge>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">CryptoCompare</span>
                  </div>
                  <Badge variant="outline" className="text-purple-600">1000/mes</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Plan de Optimización */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Plan de Optimización - Presupuesto $0</CardTitle>
              <CardDescription>
                Roadmap de mejoras implementadas y en progreso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Completado</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Enhanced Signal Generator</li>
                    <li>• Free Data Aggregator</li>
                    <li>• Multi-timeframe Analysis</li>
                    <li>• Performance Tracking</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">🚧 En Progreso</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Confluencia de 5+ indicadores</li>
                    <li>• Sistema de scoring dinámico</li>
                    <li>• Backtesting histórico</li>
                    <li>• Optimización de filtros</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">📋 Próximo</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Machine Learning básico</li>
                    <li>• Análisis de sentimientos</li>
                    <li>• Portfolio de estrategias</li>
                    <li>• Reporting profesional</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="signals">
          <SignalMonitorPanel isActive={isSystemRunning} />
        </TabsContent>
        
        <TabsContent value="performance">
          <SignalPerformanceTracker />
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Configuración del Sistema</CardTitle>
              <CardDescription>
                Configuración y parámetros del sistema optimizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Parámetros de Señales</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Confianza mínima: <strong>70%</strong></div>
                    <div>Risk/Reward mínimo: <strong>1.5:1</strong></div>
                    <div>Máx. señales activas: <strong>5</strong></div>
                    <div>Confirmaciones mínimas: <strong>3</strong></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Fuentes de Datos</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Alpha Vantage (API Key)</span>
                      <Badge variant="outline">Configurado</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Yahoo Finance</span>
                      <Badge variant="outline">Activo</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>CryptoCompare</span>
                      <Badge variant="outline">Activo</Badge>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <Settings className="w-4 h-4" />
                  <AlertDescription>
                    Para configurar APIs adicionales, edita el archivo de variables de entorno (.env)
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
