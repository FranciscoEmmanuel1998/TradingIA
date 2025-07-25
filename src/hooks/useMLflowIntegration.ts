import React, { useState, useEffect } from 'react';
import { modelVersionController } from '@/core/mlops/ModelVersionController';
import { mlflowModelRegistry } from '@/core/mlops/MLflowModelRegistry';

interface MLflowStats {
  totalVersions: number;
  stagingVersions: number;
  productionVersions: number;
  archivedVersions: number;
  currentProduction: any;
  currentStaging: any;
  comparison: any;
  lastVersionedAccuracy: number;
  config: any;
}

export const useMLflowIntegration = () => {
  const [stats, setStats] = useState<MLflowStats>({
    totalVersions: 0,
    stagingVersions: 0,
    productionVersions: 0,
    archivedVersions: 0,
    currentProduction: null,
    currentStaging: null,
    comparison: null,
    lastVersionedAccuracy: 0,
    config: {}
  });

  const [isVersioning, setIsVersioning] = useState(false);

  // Actualizar estadísticas periódicamente
  useEffect(() => {
    const updateStats = () => {
      try {
        const versioningStats = modelVersionController.getVersioningStats();
        setStats(versioningStats);
      } catch (error) {
        console.warn('Error updating MLflow stats:', error);
      }
    };

    // Actualizar cada 15 segundos
    const interval = setInterval(updateStats, 15000);
    updateStats(); // Ejecutar inmediatamente

    return () => clearInterval(interval);
  }, []);

  // Forzar creación de nueva versión
  const forceVersioning = async () => {
    if (isVersioning) return;

    setIsVersioning(true);
    console.log('🔄 Forzando creación de nueva versión...');

    try {
      const newVersion = await modelVersionController.forceVersioning();
      
      if (newVersion) {
        console.log('✅ Nueva versión creada:', newVersion.version);
        
        // Actualizar estadísticas inmediatamente
        const updatedStats = modelVersionController.getVersioningStats();
        setStats(updatedStats);
      } else {
        console.warn('⚠️ No se pudo crear nueva versión');
      }
      
    } catch (error) {
      console.error('❌ Error en versionado forzado:', error);
    } finally {
      setIsVersioning(false);
    }
  };

  // Ejecutar rollback
  const executeRollback = async () => {
    try {
      console.log('🔄 Ejecutando rollback...');
      
      const rollbackVersion = await mlflowModelRegistry.rollbackToPreviousVersion();
      
      if (rollbackVersion) {
        console.log('✅ Rollback exitoso a versión:', rollbackVersion.version);
        
        // Actualizar estadísticas
        const updatedStats = modelVersionController.getVersioningStats();
        setStats(updatedStats);
      } else {
        console.warn('⚠️ No hay versiones disponibles para rollback');
      }
      
    } catch (error) {
      console.error('❌ Error en rollback:', error);
    }
  };

  // Limpiar registro local
  const cleanRegistry = () => {
    try {
      console.log('🗑️ Limpiando registro de modelos...');
      
      mlflowModelRegistry.clearRegistry();
      
      // Resetear estadísticas
      const clearedStats = modelVersionController.getVersioningStats();
      setStats(clearedStats);
      
      console.log('✅ Registro limpiado exitosamente');
      
    } catch (error) {
      console.error('❌ Error limpiando registro:', error);
    }
  };

  // Promover modelo a producción
  const promoteToProduction = async (version: string) => {
    try {
      console.log('🚀 Promoviendo a producción:', version);
      
      await mlflowModelRegistry.promoteToProduction(version);
      
      // Actualizar estadísticas
      const updatedStats = modelVersionController.getVersioningStats();
      setStats(updatedStats);
      
      console.log('✅ Promoción exitosa');
      
    } catch (error) {
      console.error('❌ Error en promoción:', error);
    }
  };

  // Obtener información de estado del sistema
  const getSystemStatus = () => {
    return {
      mlflowConnected: false, // En esta implementación usamos local storage
      autoVersioningEnabled: stats.config.enableAutoVersioning || false,
      monitoringActive: modelVersionController.getStatus().isMonitoring,
      lastVersionedAccuracy: stats.lastVersionedAccuracy,
      registrySize: stats.totalVersions
    };
  };

  // Configurar parámetros de versionado
  const updateVersioningConfig = (newConfig: any) => {
    try {
      modelVersionController.updateConfig(newConfig);
      
      // Actualizar estadísticas para reflejar nueva configuración
      const updatedStats = modelVersionController.getVersioningStats();
      setStats(updatedStats);
      
      console.log('⚙️ Configuración actualizada:', newConfig);
      
    } catch (error) {
      console.error('❌ Error actualizando configuración:', error);
    }
  };

  // Obtener historial de versiones
  const getVersionHistory = () => {
    try {
      return mlflowModelRegistry.getAllVersions();
    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      return [];
    }
  };

  // Obtener métricas de comparación detalladas
  const getDetailedComparison = () => {
    try {
      return mlflowModelRegistry.getVersionComparison();
    } catch (error) {
      console.error('❌ Error en comparación:', error);
      return { production: null, staging: null, comparison: null };
    }
  };

  return {
    stats,
    isVersioning,
    forceVersioning,
    executeRollback,
    cleanRegistry,
    promoteToProduction,
    getSystemStatus,
    updateVersioningConfig,
    getVersionHistory,
    getDetailedComparison,
    modelVersionController,
    mlflowModelRegistry
  };
};
