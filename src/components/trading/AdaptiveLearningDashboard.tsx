import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Settings, 
  BarChart3, 
  Zap,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface LearningMetrics {
  overallAccuracy: number;
  totalPredictions: number;
  successfulPredictions: number;
  averageProfitLoss: number;
  averageTimeToResolution: number;
  learningCycles: number;
  lastUpdate: Date;
}

interface AdaptiveConfig {
  confidenceThreshold: number;
  technicalWeights: {
    rsi: number;
    bollinger: number;
    macd: number;
    volume: number;
  };
  buyWeights: {
    bullish: number;
    neutral: number;
    bearish: number;
  };
  learningRate: number;
}

interface AdaptiveLearningDashboardProps {
  metrics?: LearningMetrics;
  config?: AdaptiveConfig;
  isLearning?: boolean;
  onTriggerLearning?: () => void;
  onResetConfig?: () => void;
}

const defaultMetrics: LearningMetrics = {
  overallAccuracy: 87.5,
  totalPredictions: 245,
  successfulPredictions: 214,
  averageProfitLoss: 2.34,
  averageTimeToResolution: 18.5,
  learningCycles: 12,
  lastUpdate: new Date()
};

const defaultConfig: AdaptiveConfig = {
  confidenceThreshold: 0.85,
  technicalWeights: {
    rsi: 0.25,
    bollinger: 0.30,
    macd: 0.25,
    volume: 0.20
  },
  buyWeights: {
    bullish: 0.40,
    neutral: 0.35,
    bearish: 0.25
  },
  learningRate: 0.1
};

export const AdaptiveLearningDashboard: React.FC<AdaptiveLearningDashboardProps> = ({
  metrics = defaultMetrics,
  config = defaultConfig,
  isLearning = false,
  onTriggerLearning,
  onResetConfig
}) => {

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-500';
    if (accuracy >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyBadgeVariant = (accuracy: number) => {
    if (accuracy >= 90) return 'default';
    if (accuracy >= 80) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Aprendizaje Adaptativo</h2>
          {isLearning && (
            <Badge variant="secondary" className="animate-pulse">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Aprendiendo
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={onTriggerLearning} 
            disabled={isLearning}
            variant="outline"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Ciclo de Aprendizaje
          </Button>
          <Button 
            onClick={onResetConfig}
            variant="ghost"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Reset Config
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisión General</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(metrics.overallAccuracy)}`}>
              {metrics.overallAccuracy.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.successfulPredictions} de {metrics.totalPredictions} predicciones
            </p>
            <Progress 
              value={metrics.overallAccuracy} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P&L Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.averageProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {metrics.averageProfitLoss >= 0 ? '+' : ''}{metrics.averageProfitLoss.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Por predicción exitosa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Resolución</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageTimeToResolution.toFixed(1)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio de resolución
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ciclos de Aprendizaje</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {metrics.learningCycles}
            </div>
            <p className="text-xs text-muted-foreground">
              Última actualización: {metrics.lastUpdate.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado del sistema */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Sistema de aprendizaje adaptativo activo. Precisión objetivo: ≥90%. 
          Estado actual: <Badge variant={getAccuracyBadgeVariant(metrics.overallAccuracy)}>
            {metrics.overallAccuracy >= 90 ? 'ÓPTIMO' : metrics.overallAccuracy >= 80 ? 'BUENO' : 'MEJORANDO'}
          </Badge>
        </AlertDescription>
      </Alert>

      {/* Configuración adaptativa */}
      <Tabs defaultValue="weights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weights">Pesos Técnicos</TabsTrigger>
          <TabsTrigger value="confidence">Confianza</TabsTrigger>
          <TabsTrigger value="learning">Parámetros</TabsTrigger>
        </TabsList>

        <TabsContent value="weights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pesos de Indicadores Técnicos</CardTitle>
              <CardDescription>
                Ajustes automáticos basados en rendimiento histórico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">RSI</span>
                    <span className="text-sm text-muted-foreground">
                      {(config.technicalWeights.rsi * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={config.technicalWeights.rsi * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Bollinger Bands</span>
                    <span className="text-sm text-muted-foreground">
                      {(config.technicalWeights.bollinger * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={config.technicalWeights.bollinger * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">MACD</span>
                    <span className="text-sm text-muted-foreground">
                      {(config.technicalWeights.macd * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={config.technicalWeights.macd * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Volumen</span>
                    <span className="text-sm text-muted-foreground">
                      {(config.technicalWeights.volume * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={config.technicalWeights.volume * 100} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Umbral de Confianza Adaptativo</CardTitle>
              <CardDescription>
                Ajuste dinámico basado en precisión histórica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Umbral Actual</span>
                    <span className="text-sm text-muted-foreground">
                      {(config.confidenceThreshold * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={config.confidenceThreshold * 100} />
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {(config.buyWeights.bullish * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Bullish</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {(config.buyWeights.neutral * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {(config.buyWeights.bearish * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Bearish</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parámetros de Aprendizaje</CardTitle>
              <CardDescription>
                Configuración del motor de aprendizaje automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Tasa de Aprendizaje</span>
                    <span className="text-sm text-muted-foreground">
                      {config.learningRate.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={config.learningRate * 100} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">Conservador</div>
                    <div className="text-xs text-muted-foreground">
                      Cambios graduales y estables
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">Agresivo</div>
                    <div className="text-xs text-muted-foreground">
                      Adaptación rápida a mercados
                    </div>
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

export default AdaptiveLearningDashboard;
