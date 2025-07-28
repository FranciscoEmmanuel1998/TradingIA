import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GitBranch, 
  Rocket, 
  Archive, 
  TrendingUp, 
  Shield, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Database
} from 'lucide-react';
import { ModelVersion } from '@/core/mlops/MLflowModelRegistry';

interface ModelVersionStats {
  totalVersions: number;
  stagingVersions: number;
  productionVersions: number;
  archivedVersions: number;
  currentProduction: ModelVersion | null;
  currentStaging: ModelVersion | null;
  comparison: any;
  lastVersionedAccuracy: number;
  config: any;
}

interface MLflowDashboardProps {
  stats?: ModelVersionStats;
  isVersioning?: boolean;
  onForceVersioning?: () => void;
  onRollback?: () => void;
  onCleanRegistry?: () => void;
}

const defaultStats: ModelVersionStats = {
  totalVersions: 3,
  stagingVersions: 1,
  productionVersions: 1,
  archivedVersions: 1,
  currentProduction: {
    version: 'v1.1703123456',
    name: 'SuperinteligenciaAI_TradingModel',
    stage: 'Production',
    accuracy: 0.891,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    metadata: {
      confidenceThreshold: 0.85,
      technicalWeights: { rsi: 0.25, bollinger: 0.30, macd: 0.25, volume: 0.20 },
      learningCycles: 15,
      trainingMetrics: { totalPredictions: 180, timestamp: new Date().toISOString() }
    },
    modelId: 'model-prod-001'
  },
  currentStaging: {
    version: 'v1.1703209856',
    name: 'SuperinteligenciaAI_TradingModel',
    stage: 'Staging',
    accuracy: 0.923,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    metadata: {
      confidenceThreshold: 0.87,
      technicalWeights: { rsi: 0.28, bollinger: 0.32, macd: 0.22, volume: 0.18 },
      learningCycles: 23,
      trainingMetrics: { totalPredictions: 245, timestamp: new Date().toISOString() }
    },
    modelId: 'model-stg-002'
  },
  comparison: {
    accuracyDiff: 0.032,
    cyclesDiff: 8,
    recommendPromotion: true
  },
  lastVersionedAccuracy: 0.891,
  config: {
    enableAutoVersioning: true,
    versioningThreshold: 0.02,
    autoPromotionEnabled: true,
    rollbackThreshold: 0.80
  }
};

export const MLflowDashboard: React.FC<MLflowDashboardProps> = ({
  stats = defaultStats,
  isVersioning = false,
  onForceVersioning,
  onRollback,
  onCleanRegistry
}) => {

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Production': return 'bg-green-500';
      case 'Staging': return 'bg-yellow-500';
      case 'Archived': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'Production': return 'default';
      case 'Staging': return 'secondary';
      case 'Archived': return 'outline';
      default: return 'secondary';
    }
  };

  const formatAccuracy = (accuracy: number) => {
    return `${(accuracy * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">MLflow Model Registry</h2>
          {isVersioning && (
            <Badge variant="secondary" className="animate-pulse">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Versionando
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={onForceVersioning} 
            disabled={isVersioning}
            variant="outline"
            size="sm"
          >
            <GitBranch className="h-4 w-4 mr-2" />
            Nueva Versión
          </Button>
          <Button 
            onClick={onRollback}
            variant="ghost"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Rollback
          </Button>
          <Button 
            onClick={onCleanRegistry}
            variant="ghost"
            size="sm"
          >
            <Archive className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Versiones</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVersions}</div>
            <p className="text-xs text-muted-foreground">
              Modelos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Producción</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats.currentProduction ? formatAccuracy(stats.currentProduction.accuracy) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.currentProduction?.version || 'Sin modelo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Staging</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {stats.currentStaging ? formatAccuracy(stats.currentStaging.accuracy) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.currentStaging?.version || 'Sin modelo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivados</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{stats.archivedVersions}</div>
            <p className="text-xs text-muted-foreground">
              Versiones anteriores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparación de versiones */}
      {stats.comparison && (
        <Alert>
          {stats.comparison.recommendPromotion ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription>
            {stats.comparison.recommendPromotion ? (
              <>
                <strong>Recomendación de promoción:</strong> El modelo en staging tiene 
                {(stats.comparison.accuracyDiff * 100).toFixed(1)}% mejor precisión 
                que producción. 
                <Badge variant="default" className="ml-2">
                  Listo para promoción
                </Badge>
              </>
            ) : (
              <>
                <strong>Modelo en desarrollo:</strong> El modelo en staging necesita 
                más entrenamiento antes de la promoción.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Detalles de versiones */}
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="production">Producción</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Modelo en Producción */}
            {stats.currentProduction && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Producción</span>
                    <Badge variant={getStageBadgeVariant('Production')}>
                      <Rocket className="h-3 w-3 mr-1" />
                      Production
                    </Badge>
                  </CardTitle>
                  <CardDescription>{stats.currentProduction.version}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Precisión</span>
                      <span className="text-sm font-medium">
                        {formatAccuracy(stats.currentProduction.accuracy)}
                      </span>
                    </div>
                    <Progress value={stats.currentProduction.accuracy * 100} />
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ciclos de aprendizaje:</span>
                      <span>{stats.currentProduction.metadata.learningCycles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Umbral confianza:</span>
                      <span>{(stats.currentProduction.metadata.confidenceThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creado:</span>
                      <span>{stats.currentProduction.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modelo en Staging */}
            {stats.currentStaging && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Staging</span>
                    <Badge variant={getStageBadgeVariant('Staging')}>
                      <Target className="h-3 w-3 mr-1" />
                      Staging
                    </Badge>
                  </CardTitle>
                  <CardDescription>{stats.currentStaging.version}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Precisión</span>
                      <span className="text-sm font-medium">
                        {formatAccuracy(stats.currentStaging.accuracy)}
                      </span>
                    </div>
                    <Progress value={stats.currentStaging.accuracy * 100} />
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ciclos de aprendizaje:</span>
                      <span>{stats.currentStaging.metadata.learningCycles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Umbral confianza:</span>
                      <span>{(stats.currentStaging.metadata.confidenceThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creado:</span>
                      <span>{stats.currentStaging.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          {stats.currentProduction && (
            <Card>
              <CardHeader>
                <CardTitle>Modelo en Producción - Detalles</CardTitle>
                <CardDescription>
                  {stats.currentProduction.version} • Activo desde {stats.currentProduction.createdAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Pesos Técnicos</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>RSI:</span>
                        <span>{(stats.currentProduction.metadata.technicalWeights.rsi * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bollinger:</span>
                        <span>{(stats.currentProduction.metadata.technicalWeights.bollinger * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MACD:</span>
                        <span>{(stats.currentProduction.metadata.technicalWeights.macd * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volumen:</span>
                        <span>{(stats.currentProduction.metadata.technicalWeights.volume * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Métricas de Entrenamiento</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total predicciones:</span>
                        <span>{stats.currentProduction.metadata.trainingMetrics.totalPredictions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ciclos aprendizaje:</span>
                        <span>{stats.currentProduction.metadata.learningCycles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ID del modelo:</span>
                        <span className="font-mono text-xs">{stats.currentProduction.modelId.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Versionado Automático</CardTitle>
              <CardDescription>
                Parámetros del sistema MLOps para gestión automática de modelos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Versionado Automático</span>
                    <Badge variant={stats.config.enableAutoVersioning ? "default" : "secondary"}>
                      {stats.config.enableAutoVersioning ? "Activado" : "Desactivado"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Promoción Automática</span>
                    <Badge variant={stats.config.autoPromotionEnabled ? "default" : "secondary"}>
                      {stats.config.autoPromotionEnabled ? "Activado" : "Desactivado"}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Umbral de mejora:</span>
                    <span className="text-sm font-medium">
                      {(stats.config.versioningThreshold * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Umbral rollback:</span>
                    <span className="text-sm font-medium">
                      {(stats.config.rollbackThreshold * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLflowDashboard;
