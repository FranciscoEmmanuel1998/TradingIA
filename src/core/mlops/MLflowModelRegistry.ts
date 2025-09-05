import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * MLflow Model Registry Integration
 * Gestiona versionado, promoción y rollback de modelos SuperinteligenciaAI
 */

export interface ModelVersion {
  version: string;
  name: string;
  stage: 'Staging' | 'Production' | 'Archived';
  accuracy: number;
  createdAt: Date;
  metadata: {
    confidenceThreshold: number;
    technicalWeights: any;
    learningCycles: number;
    trainingMetrics: any;
  };
  modelId: string;
}

export interface ModelRegistry {
  name: string;
  versions: ModelVersion[];
  currentProductionVersion?: string;
  currentStagingVersion?: string;
}

export interface MLflowConfig {
  trackingUri: string;
  experimentName: string;
  modelName: string;
  registryUri?: string;
}

export class MLflowModelRegistry {
  private config: MLflowConfig;
  private modelRegistry: ModelRegistry;
  private readonly LOCAL_STORAGE_KEY = 'mlflow_model_registry';

  constructor(config: MLflowConfig) {
    this.config = {
      trackingUri: config.trackingUri || (import.meta.env.VITE_API_URL as string),
      experimentName: config.experimentName || 'SuperinteligenciaAI_Experiments',
      modelName: config.modelName || 'SuperinteligenciaAI_Model',
      registryUri: config.registryUri || config.trackingUri
    };

    this.modelRegistry = this.loadFromStorage() || {
      name: this.config.modelName,
      versions: [],
      currentProductionVersion: undefined,
      currentStagingVersion: undefined
    };

    console.log('🔄 MLflow Model Registry inicializado:', this.config);
  }

  /**
   * Registra una nueva versión del modelo
   */
  async registerModel(
    modelData: any,
    metadata: {
      accuracy: number;
      confidenceThreshold: number;
      technicalWeights: any;
      learningCycles: number;
      trainingMetrics: any;
    }
  ): Promise<ModelVersion> {
    const version = `v${this.modelRegistry.versions.length + 1}.${Date.now()}`;
    const modelId = uuidv4();

    const newVersion: ModelVersion = {
      version,
      name: this.config.modelName,
      stage: 'Staging',
      accuracy: metadata.accuracy,
      createdAt: new Date(),
      metadata: {
        confidenceThreshold: metadata.confidenceThreshold,
        technicalWeights: metadata.technicalWeights,
        learningCycles: metadata.learningCycles,
        trainingMetrics: metadata.trainingMetrics
      },
      modelId
    };

    try {
      // Intentar registrar en MLflow real si está disponible
      await this.registerInMLflow(newVersion, modelData);
    } catch (error) {
      console.warn('⚠️ MLflow server no disponible, usando registro local:', error);
    }

    // Registrar localmente
    this.modelRegistry.versions.push(newVersion);
    this.modelRegistry.currentStagingVersion = version;
    
    this.saveToStorage();
    
    console.log('📝 Nueva versión registrada:', {
      version,
      accuracy: metadata.accuracy,
      stage: 'Staging',
      modelId
    });

    // Auto-promoción si cumple criterios
    await this.evaluateForPromotion(newVersion);

    return newVersion;
  }

  /**
   * Evalúa si un modelo debe ser promovido a producción
   */
  private async evaluateForPromotion(version: ModelVersion): Promise<void> {
    const PROMOTION_THRESHOLD = 0.87; // 87% de precisión mínima
    const MIN_LEARNING_CYCLES = 5; // Mínimo 5 ciclos de aprendizaje

    if (
      version.accuracy >= PROMOTION_THRESHOLD &&
      version.metadata.learningCycles >= MIN_LEARNING_CYCLES
    ) {
      console.log('🎯 Modelo cumple criterios para promoción automática');
      await this.promoteToProduction(version.version);
    } else {
      console.log('📊 Modelo en staging - necesita más entrenamiento:', {
        currentAccuracy: version.accuracy,
        requiredAccuracy: PROMOTION_THRESHOLD,
        learningCycles: version.metadata.learningCycles,
        requiredCycles: MIN_LEARNING_CYCLES
      });
    }
  }

  /**
   * Promueve un modelo a producción
   */
  async promoteToProduction(version: string): Promise<void> {
    const modelVersion = this.modelRegistry.versions.find(v => v.version === version);
    
    if (!modelVersion) {
      throw new Error(`Versión ${version} no encontrada`);
    }

    // Archivar versión anterior de producción
    if (this.modelRegistry.currentProductionVersion) {
      const oldVersion = this.modelRegistry.versions.find(
        v => v.version === this.modelRegistry.currentProductionVersion
      );
      if (oldVersion) {
        oldVersion.stage = 'Archived';
        console.log('📦 Versión anterior archivada:', oldVersion.version);
      }
    }

    // Promover nueva versión
    modelVersion.stage = 'Production';
    this.modelRegistry.currentProductionVersion = version;

    try {
      await this.updateStageInMLflow(version, 'Production');
    } catch (error) {
      console.warn('⚠️ Error actualizando MLflow:', error);
    }

    this.saveToStorage();
    
    console.log('🚀 Modelo promovido a producción:', {
      version,
      accuracy: modelVersion.accuracy,
      modelId: modelVersion.modelId
    });
  }

  /**
   * Rollback a versión anterior
   */
  async rollbackToPreviousVersion(): Promise<ModelVersion | null> {
    const archivedVersions = this.modelRegistry.versions
      .filter(v => v.stage === 'Archived')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (archivedVersions.length === 0) {
      console.warn('⚠️ No hay versiones archivadas para rollback');
      return null;
    }

    const rollbackVersion = archivedVersions[0];
    
    console.log('🔄 Iniciando rollback a versión:', rollbackVersion.version);
    
    // Archivar versión actual
    if (this.modelRegistry.currentProductionVersion) {
      const currentVersion = this.modelRegistry.versions.find(
        v => v.version === this.modelRegistry.currentProductionVersion
      );
      if (currentVersion) {
        currentVersion.stage = 'Archived';
      }
    }

    // Restaurar versión anterior
    rollbackVersion.stage = 'Production';
    this.modelRegistry.currentProductionVersion = rollbackVersion.version;

    try {
      await this.updateStageInMLflow(rollbackVersion.version, 'Production');
    } catch (error) {
      console.warn('⚠️ Error en rollback MLflow:', error);
    }

    this.saveToStorage();
    
    console.log('✅ Rollback completado:', {
      version: rollbackVersion.version,
      accuracy: rollbackVersion.accuracy
    });

    return rollbackVersion;
  }

  /**
   * Obtiene la versión actual en producción
   */
  getCurrentProductionModel(): ModelVersion | null {
    if (!this.modelRegistry.currentProductionVersion) {
      return null;
    }

    return this.modelRegistry.versions.find(
      v => v.version === this.modelRegistry.currentProductionVersion
    ) || null;
  }

  /**
   * Obtiene todas las versiones del modelo
   */
  getAllVersions(): ModelVersion[] {
    return [...this.modelRegistry.versions].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Obtiene métricas de comparación entre versiones
   */
  getVersionComparison(): {
    production: ModelVersion | null;
    staging: ModelVersion | null;
    comparison: any;
  } {
    const production = this.getCurrentProductionModel();
    const staging = this.modelRegistry.versions.find(
      v => v.version === this.modelRegistry.currentStagingVersion
    ) || null;

    const comparison = production && staging ? {
      accuracyDiff: staging.accuracy - production.accuracy,
      cyclesDiff: staging.metadata.learningCycles - production.metadata.learningCycles,
      recommendPromotion: staging.accuracy > production.accuracy && staging.accuracy >= 0.87
    } : null;

    return { production, staging, comparison };
  }

  /**
   * Registra en MLflow server real
   */
  private async registerInMLflow(version: ModelVersion, modelData: any): Promise<void> {
    try {
      // Crear experimento si no existe
      await axios.post(`${this.config.trackingUri}/api/2.0/mlflow/experiments/create`, {
        name: this.config.experimentName
      });
    } catch (error) {
      // Experimento ya existe
    }

    // Registrar modelo
    const response = await axios.post(`${this.config.trackingUri}/api/2.0/mlflow/model-versions/create`, {
      name: this.config.modelName,
      source: `models:/${this.config.modelName}/${version.version}`,
      description: `SuperinteligenciaAI model version ${version.version}`
    });

    console.log('📡 Modelo registrado en MLflow server:', response.data);
  }

  /**
   * Actualiza stage en MLflow server
   */
  private async updateStageInMLflow(version: string, stage: string): Promise<void> {
    await axios.post(`${this.config.trackingUri}/api/2.0/mlflow/model-versions/transition-stage`, {
      name: this.config.modelName,
      version,
      stage,
      archive_existing_versions: stage === 'Production'
    });
  }

  /**
   * Persistencia local
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.modelRegistry));
    } catch (error) {
      console.warn('⚠️ Error guardando registry local:', error);
    }
  }

  private loadFromStorage(): ModelRegistry | null {
    try {
      const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir strings de fecha a objetos Date
        parsed.versions = parsed.versions.map((v: any) => ({
          ...v,
          createdAt: new Date(v.createdAt)
        }));
        return parsed;
      }
    } catch (error) {
      console.warn('⚠️ Error cargando registry local:', error);
    }
    return null;
  }

  /**
   * Limpia el registro local (para testing)
   */
  clearRegistry(): void {
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    this.modelRegistry = {
      name: this.config.modelName,
      versions: [],
      currentProductionVersion: undefined,
      currentStagingVersion: undefined
    };
    console.log('🗑️ Registry limpiado');
  }
}

// Singleton instance
export const mlflowModelRegistry = new MLflowModelRegistry({
  trackingUri: import.meta.env.VITE_API_URL as string,
  experimentName: 'ChartWhisperer_SuperinteligenciaAI',
  modelName: 'SuperinteligenciaAI_TradingModel'
});
