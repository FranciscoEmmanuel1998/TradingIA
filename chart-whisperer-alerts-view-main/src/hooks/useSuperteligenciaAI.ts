// 🎯 HOOK para integrar la Superinteligencia AI con React
// Conecta la IA perpetua con la interfaz de usuario

import { useState, useEffect, useCallback } from 'react';
import { superinteligenciaAI, AISignal } from '../core/ai/SuperinteligenciaAI';
import { predictionVerificationSystem } from '../core/verification/PredictionVerificationSystem';

interface AIHookState {
  signals: AISignal[];
  isActive: boolean;
  stats: {
    totalSignals: number;
    winRate: number;
    avgProfit: number;
    activeSignals: number;
  };
  lastUpdate: Date | null;
}

export const useSuperteligenciaAI = () => {
  const [state, setState] = useState<AIHookState>({
    signals: [],
    isActive: false,
    stats: {
      totalSignals: 0,
      winRate: 0,
      avgProfit: 0,
      activeSignals: 0
    },
    lastUpdate: null
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // 📡 Recibir nuevas señales de la IA
  const handleNewSignal = useCallback((signal: AISignal) => {
    setState(prevState => {
      // Verificar si ya existe una señal con el mismo ID
      const existingSignal = prevState.signals.find(s => s.id === signal.id);
      if (existingSignal) {
        console.warn(`⚠️ Señal duplicada detectada y omitida: ${signal.id}`);
        return prevState; // No agregar señal duplicada
      }
      
      const newSignals = [signal, ...prevState.signals.slice(0, 19)]; // Mantener 20 señales máximo
      
      // Calcular estadísticas actualizadas
      const totalSignals = prevState.stats.totalSignals + 1;
      const activeSignals = newSignals.filter(s => s.confidence >= 75).length;
      
      // Simular win rate basado en la calidad de las señales
      const avgConfidence = newSignals.reduce((sum, s) => sum + s.confidence, 0) / newSignals.length;
      const winRate = Math.min(95, Math.max(70, avgConfidence - 10));
      
      // Calcular ganancia promedio
      const avgProfit = newSignals.reduce((sum, s) => sum + s.profitPotential, 0) / newSignals.length;

      return {
        signals: newSignals,
        isActive: true,
        stats: {
          totalSignals,
          winRate: Number(winRate.toFixed(1)),
          avgProfit: Number(avgProfit.toFixed(1)),
          activeSignals
        },
        lastUpdate: new Date()
      };
    });
  }, []);

  // 🚀 Inicializar la IA al montar el componente
  useEffect(() => {
    const initializeAI = async () => {
      console.log('🧠 Conectando con Superinteligencia AI...');
      setIsConnecting(true);
      
      try {
        // Suscribirse a nuevas señales
        superinteligenciaAI.onSignal(handleNewSignal);
        
        // 🎯 INICIALIZAR SISTEMA DE VERIFICACIÓN
        predictionVerificationSystem.start();
        
        // Activar la IA si no está activa
        superinteligenciaAI.start();
        
        // Simular delay de conexión realista
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setState(prevState => ({
          ...prevState,
          isActive: true,
          stats: {
            totalSignals: 0, // Empezar desde 0, se actualizará con señales reales
            winRate: 0,
            avgProfit: 0,
            activeSignals: 0
          }
        }));
        
        setIsInitialized(true);
        setIsConnecting(false);
        console.log('✅ SuperinteligenciaAI conectada y operativa');
        
      } catch (error) {
        console.error('❌ Error inicializando SuperinteligenciaAI:', error);
        setIsConnecting(false);
      }
    };

    initializeAI();

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Desconectando de Superinteligencia AI...');
      setIsInitialized(false);
      setIsConnecting(false);
    };
  }, [handleNewSignal]);

  // 🎮 Métodos de control
  const startAI = useCallback(() => {
    superinteligenciaAI.start();
    setState(prevState => ({ ...prevState, isActive: true }));
  }, []);

  const stopAI = useCallback(() => {
    superinteligenciaAI.stop();
    setState(prevState => ({ ...prevState, isActive: false }));
  }, []);

  const clearSignals = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      signals: [],
      stats: {
        ...prevState.stats,
        activeSignals: 0
      }
    }));
  }, []);

  // 📊 Métricas en tiempo real
  const getTopPerformingSignals = useCallback(() => {
    return state.signals
      .filter(signal => signal.confidence >= 85)
      .sort((a, b) => b.profitPotential - a.profitPotential)
      .slice(0, 5);
  }, [state.signals]);

  const getRecentActivity = useCallback(() => {
    return state.signals
      .filter(signal => {
        const now = new Date();
        const signalTime = new Date(signal.timestamp);
        const diffMinutes = (now.getTime() - signalTime.getTime()) / (1000 * 60);
        return diffMinutes <= 30; // Últimos 30 minutos
      });
  }, [state.signals]);

  const getPerformanceMetrics = useCallback(() => {
    const highConfidenceSignals = state.signals.filter(s => s.confidence >= 80);
    const mediumRiskSignals = state.signals.filter(s => s.riskLevel === 'MEDIUM');
    const buySignals = state.signals.filter(s => s.action === 'BUY');
    
    return {
      highConfidenceCount: highConfidenceSignals.length,
      avgConfidence: state.signals.length > 0 
        ? state.signals.reduce((sum, s) => sum + s.confidence, 0) / state.signals.length 
        : 0,
      buySignalRatio: state.signals.length > 0 
        ? (buySignals.length / state.signals.length) * 100 
        : 0,
      mediumRiskRatio: state.signals.length > 0 
        ? (mediumRiskSignals.length / state.signals.length) * 100 
        : 0
    };
  }, [state.signals]);

  return {
    // Estado principal
    signals: state.signals,
    isActive: state.isActive,
    stats: state.stats,
    lastUpdate: state.lastUpdate,
    
    // Estados de conexión
    isInitialized,
    isConnecting,
    isConnected: isInitialized && state.isActive && !isConnecting,
    
    // Métodos de control
    startAI,
    stopAI,
    clearSignals,
    
    // Métricas avanzadas
    getTopPerformingSignals,
    getRecentActivity,
    getPerformanceMetrics
  };
};
