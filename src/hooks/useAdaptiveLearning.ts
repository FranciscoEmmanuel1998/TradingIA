import React, { useState, useEffect } from 'react';
import { adaptiveLearningIntegration } from '@/core/intelligence/AdaptiveLearningIntegration';
import { predictionVerificationSystem } from '@/core/verification/PredictionVerificationSystem';
import { superinteligenciaAI } from '@/core/ai/SuperinteligenciaAI';

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

export const useAdaptiveLearning = () => {
  const [metrics, setMetrics] = useState<LearningMetrics>({
    overallAccuracy: 85.0,
    totalPredictions: 0,
    successfulPredictions: 0,
    averageProfitLoss: 0,
    averageTimeToResolution: 0,
    learningCycles: 0,
    lastUpdate: new Date()
  });

  const [config, setConfig] = useState<AdaptiveConfig>({
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
  });

  const [isLearning, setIsLearning] = useState(false);
  const [adaptiveLearning] = useState(() => adaptiveLearningIntegration);

  // Actualizar métricas periódicamente
  useEffect(() => {
    const updateMetrics = async () => {
    try {
      const verificationMetrics = predictionVerificationSystem.getAccuracyMetrics();
      
      setMetrics(prev => ({
        ...prev,
        overallAccuracy: verificationMetrics.overallAccuracy,
        totalPredictions: verificationMetrics.totalPredictions,
        successfulPredictions: Math.round(verificationMetrics.totalPredictions * verificationMetrics.overallAccuracy / 100),
        averageProfitLoss: verificationMetrics.averageProfitLoss || 0,
        averageTimeToResolution: verificationMetrics.averageTimeToResolution || 0,
        lastUpdate: new Date()
      }));

      // Obtener configuración actual del AI
      const currentThreshold = 0.85; // Valor por defecto
      
      setConfig(prev => ({
        ...prev,
        confidenceThreshold: currentThreshold
      }));      } catch (error) {
        console.warn('Error updating adaptive learning metrics:', error);
      }
    };

    // Actualizar cada 30 segundos
    const interval = setInterval(updateMetrics, 30000);
    updateMetrics(); // Ejecutar inmediatamente

    return () => clearInterval(interval);
  }, []);

  // Ejecutar ciclo de aprendizaje
  const triggerLearningCycle = async () => {
    if (isLearning) return;

    setIsLearning(true);
    console.log('🧠 Iniciando ciclo de aprendizaje adaptativo...');

    try {
      await adaptiveLearning.performLearningCycle();
      
      setMetrics(prev => ({
        ...prev,
        learningCycles: prev.learningCycles + 1,
        lastUpdate: new Date()
      }));

      // Actualizar configuración después del aprendizaje
      const newThreshold = config.confidenceThreshold; // Mantener actual
      
      setConfig(prev => ({
        ...prev,
        confidenceThreshold: newThreshold
      }));

      console.log('✅ Ciclo de aprendizaje completado');
      
    } catch (error) {
      console.error('❌ Error en ciclo de aprendizaje:', error);
    } finally {
      setIsLearning(false);
    }
  };

  // Resetear configuración a valores por defecto
  const resetConfiguration = async () => {
    try {
      // Resetear configuración del motor de AI
      if (superinteligenciaAI.updateConfidenceThreshold) {
        await superinteligenciaAI.updateConfidenceThreshold(0.85);
      }

      setConfig({
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
      });

      console.log('🔄 Configuración reseteada a valores por defecto');
      
    } catch (error) {
      console.error('❌ Error reseteando configuración:', error);
    }
  };

  // Configurar aprendizaje automático
  useEffect(() => {
    const setupAutomaticLearning = () => {
      // Ejecutar ciclo de aprendizaje cada 10 minutos si hay suficientes predicciones
      const autoLearningInterval = setInterval(() => {
        if (metrics.totalPredictions >= 10 && !isLearning) {
          console.log('🔄 Ejecutando ciclo de aprendizaje automático...');
          triggerLearningCycle();
        }
      }, 10 * 60 * 1000); // 10 minutos

      return () => clearInterval(autoLearningInterval);
    };

    const cleanup = setupAutomaticLearning();
    return cleanup;
  }, [metrics.totalPredictions, isLearning]);

  return {
    metrics,
    config,
    isLearning,
    triggerLearningCycle,
    resetConfiguration,
    adaptiveLearning
  };
};
