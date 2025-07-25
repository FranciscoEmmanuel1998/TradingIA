import { mlflowModelRegistry, ModelVersion } from './MLflowModelRegistry';
import { adaptiveLearningIntegration } from '@/core/intelligence/AdaptiveLearningIntegration';
import { superinteligenciaAI } from '@/core/ai/SuperinteligenciaAI';
import { predictionVerificationSystem } from '@/core/verification/PredictionVerificationSystem';

/**
 * Motor de gestión automática de versiones de modelos
 * Conecta el aprendizaje adaptativo con MLflow Model Registry
 */

export interface AutoVersioningConfig {
  enableAutoVersioning: boolean;
  versioningThreshold: number; // Diferencia mínima de precisión para nueva versión
  maxVersionsInStaging: number;
  autoPromotionEnabled: boolean;
  rollbackThreshold: number; // Precisión mínima antes de rollback automático
}

export class ModelVersionController {
  private config: AutoVersioningConfig;
  private lastVersionedAccuracy: number = 0;
  private versioningInProgress: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<AutoVersioningConfig> = {}) {
    this.config = {
      enableAutoVersioning: true,
      versioningThreshold: 0.02, // 2% de mejora mínima
      maxVersionsInStaging: 3,
      autoPromotionEnabled: true,
      rollbackThreshold: 0.80, // 80% precisión mínima
      ...config
    };

    console.log('🎯 ModelVersionController inicializado:', this.config);
    this.startMonitoring();
  }

  /**
   * Inicia el monitoreo automático de versiones
   */
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Monitorear cada 2 minutos
    this.monitoringInterval = setInterval(() => {
      this.checkForVersioning();
    }, 2 * 60 * 1000);

    console.log('👀 Monitoreo automático de versiones iniciado');
  }

  /**
   * Evalúa si se debe crear una nueva versión
   */
  private async checkForVersioning(): Promise<void> {
    if (!this.config.enableAutoVersioning || this.versioningInProgress) {
      return;
    }

    try {
      const metrics = predictionVerificationSystem.getAccuracyMetrics();
      const currentAccuracy = metrics.overallAccuracy / 100; // Convertir a decimal

      // Verificar si hay mejora significativa
      const accuracyImprovement = currentAccuracy - this.lastVersionedAccuracy;
      
      if (accuracyImprovement >= this.config.versioningThreshold) {
        console.log('📈 Mejora detectada, creando nueva versión:', {
          currentAccuracy,
          previousAccuracy: this.lastVersionedAccuracy,
          improvement: accuracyImprovement
        });

        await this.createNewVersion();
      }

      // Verificar rollback automático
      if (currentAccuracy < this.config.rollbackThreshold) {
        console.log('⚠️ Precisión por debajo del umbral, evaluando rollback:', {
          currentAccuracy,
          threshold: this.config.rollbackThreshold
        });

        await this.evaluateRollback();
      }

    } catch (error) {
      console.error('❌ Error en checkForVersioning:', error);
    }
  }

  /**
   * Crea una nueva versión del modelo
   */
  async createNewVersion(): Promise<ModelVersion | null> {
    if (this.versioningInProgress) {
      console.log('⏳ Versionado ya en progreso...');
      return null;
    }

    this.versioningInProgress = true;

    try {
      // Obtener métricas actuales
      const metrics = predictionVerificationSystem.getAccuracyMetrics();
      const adaptiveConfig = adaptiveLearningIntegration.getAdaptiveConfig();
      const learningPerformance = adaptiveLearningIntegration.getLearningPerformance();

      // Preparar metadata del modelo
      const modelMetadata = {
        accuracy: metrics.overallAccuracy / 100,
        confidenceThreshold: adaptiveConfig.minConfidenceThreshold,
        technicalWeights: {
          rsi: 0.25,
          bollinger: 0.30,
          macd: 0.25,
          volume: 0.20
        },
        learningCycles: learningPerformance.totalAdjustments,
        trainingMetrics: {
          totalPredictions: metrics.totalPredictions,
          successfulPredictions: Math.round(metrics.totalPredictions * metrics.overallAccuracy / 100),
          averageProfitLoss: metrics.averageProfitLoss || 0,
          averageTimeToResolution: metrics.averageTimeToResolution || 0,
          timestamp: new Date().toISOString()
        }
      };

      // Obtener estado actual del modelo (simulado)
      const modelData = {
        config: adaptiveConfig,
        performance: learningPerformance,
        version: `v${Date.now()}`,
        aiEngineState: 'serialized_model_state' // En producción sería el modelo serializado
      };

      // Registrar nueva versión
      const newVersion = await mlflowModelRegistry.registerModel(modelData, modelMetadata);

      // Limpiar versiones antigas en staging
      await this.cleanupOldStagingVersions();

      this.lastVersionedAccuracy = modelMetadata.accuracy;

      console.log('✅ Nueva versión creada exitosamente:', {
        version: newVersion.version,
        accuracy: newVersion.accuracy,
        stage: newVersion.stage
      });

      return newVersion;

    } catch (error) {
      console.error('❌ Error creando nueva versión:', error);
      return null;
    } finally {
      this.versioningInProgress = false;
    }
  }

  /**
   * Limpia versiones antiguas en staging
   */
  private async cleanupOldStagingVersions(): Promise<void> {
    const allVersions = mlflowModelRegistry.getAllVersions();
    const stagingVersions = allVersions.filter(v => v.stage === 'Staging');

    if (stagingVersions.length > this.config.maxVersionsInStaging) {
      const versionsToArchive = stagingVersions
        .slice(this.config.maxVersionsInStaging)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      for (const version of versionsToArchive) {
        version.stage = 'Archived';
        console.log('📦 Versión antigua archivada:', version.version);
      }
    }
  }

  /**
   * Evalúa y ejecuta rollback si es necesario
   */
  private async evaluateRollback(): Promise<void> {
    const currentProduction = mlflowModelRegistry.getCurrentProductionModel();
    
    if (!currentProduction) {
      console.log('ℹ️ No hay modelo en producción para rollback');
      return;
    }

    const currentMetrics = predictionVerificationSystem.getAccuracyMetrics();
    const currentAccuracy = currentMetrics.overallAccuracy / 100;

    // Evaluación de rollback: precisión muy baja por período sostenido
    if (currentAccuracy < this.config.rollbackThreshold) {
      console.log('🚨 Ejecutando rollback automático por baja precisión');
      
      const rollbackVersion = await mlflowModelRegistry.rollbackToPreviousVersion();
      
      if (rollbackVersion) {
        // Aplicar configuración de la versión anterior
        await this.applyModelVersion(rollbackVersion);
        
        console.log('🔄 Rollback completado a versión:', rollbackVersion.version);
      }
    }
  }

  /**
   * Aplica la configuración de una versión específica del modelo
   */
  private async applyModelVersion(version: ModelVersion): Promise<void> {
    try {
      // Aplicar configuración al motor de IA
      if (superinteligenciaAI.updateConfidenceThreshold) {
        await superinteligenciaAI.updateConfidenceThreshold(version.metadata.confidenceThreshold);
      }

      if (superinteligenciaAI.updateTechnicalWeights) {
        await superinteligenciaAI.updateTechnicalWeights(version.metadata.technicalWeights);
      }

      console.log('⚙️ Configuración de modelo aplicada:', {
        version: version.version,
        confidenceThreshold: version.metadata.confidenceThreshold,
        technicalWeights: version.metadata.technicalWeights
      });

    } catch (error) {
      console.error('❌ Error aplicando versión del modelo:', error);
    }
  }

  /**
   * Fuerza la creación de una nueva versión
   */
  async forceVersioning(): Promise<ModelVersion | null> {
    console.log('🔄 Forzando creación de nueva versión...');
    return await this.createNewVersion();
  }

  /**
   * Obtiene estadísticas de versionado
   */
  getVersioningStats() {
    const allVersions = mlflowModelRegistry.getAllVersions();
    const { production, staging, comparison } = mlflowModelRegistry.getVersionComparison();

    return {
      totalVersions: allVersions.length,
      stagingVersions: allVersions.filter(v => v.stage === 'Staging').length,
      productionVersions: allVersions.filter(v => v.stage === 'Production').length,
      archivedVersions: allVersions.filter(v => v.stage === 'Archived').length,
      currentProduction: production,
      currentStaging: staging,
      comparison,
      lastVersionedAccuracy: this.lastVersionedAccuracy,
      config: this.config
    };
  }

  /**
   * Actualiza configuración de versionado
   */
  updateConfig(newConfig: Partial<AutoVersioningConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de versionado actualizada:', this.config);
  }

  /**
   * Detiene el monitoreo automático
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Monitoreo automático detenido');
    }
  }

  /**
   * Obtiene el estado actual del controlador
   */
  getStatus() {
    return {
      isMonitoring: this.monitoringInterval !== null,
      versioningInProgress: this.versioningInProgress,
      lastVersionedAccuracy: this.lastVersionedAccuracy,
      config: this.config
    };
  }
}

// Singleton instance
export const modelVersionController = new ModelVersionController();
