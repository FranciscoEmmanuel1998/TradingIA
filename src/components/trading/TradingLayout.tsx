import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Watchlist } from "./Watchlist";
import { ChartPanel } from "./ChartPanel";
import { AlertPanel } from "./AlertPanel";
import { Header } from "./Header";
import BienvenidaIA from "./BienvenidaIA";
import AdaptiveLearningDashboard from "./AdaptiveLearningDashboard";
import MLflowDashboard from "./MLflowDashboard";
import RiverOnlineLearningDashboard from "./RiverOnlineLearningDashboard";
import AdvancedPredictionDashboard from "./AdvancedPredictionDashboard";
import PredictionSystemDemo from "./PredictionSystemDemo";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { TrendingUp, Bell, Brain, Database } from "lucide-react";
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import { useMLflowIntegration } from '@/hooks/useMLflowIntegration';

export const TradingLayout = () => {
  const [selectedAsset, setSelectedAsset] = useState("AAPL");
  const [showAlerts, setShowAlerts] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showLearning, setShowLearning] = useState(false);
  const [showMLflow, setShowMLflow] = useState(false);
  const [showRiver, setShowRiver] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showPredictionDemo, setShowPredictionDemo] = useState(false);
  
  const {
    metrics,
    config,
    isLearning,
    triggerLearningCycle,
    resetConfiguration
  } = useAdaptiveLearning();

  const {
    stats: mlflowStats,
    isVersioning,
    forceVersioning,
    executeRollback,
    cleanRegistry
  } = useMLflowIntegration();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        onToggleAlerts={() => setShowAlerts(!showAlerts)} 
        onToggleWelcome={() => setShowWelcome(!showWelcome)}
        onToggleLearning={() => setShowLearning(!showLearning)}
        onToggleMLflow={() => setShowMLflow(!showMLflow)}
        onToggleRiver={() => setShowRiver(!showRiver)}
        onTogglePredictions={() => setShowPredictions(!showPredictions)}
        onTogglePredictionDemo={() => setShowPredictionDemo(!showPredictionDemo)}
        showWelcome={showWelcome}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Watchlist Sidebar */}
        <div className="w-80 border-r border-border bg-card">
          <Watchlist 
            selectedAsset={selectedAsset}
            onSelectAsset={setSelectedAsset}
          />
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 flex flex-col">
          {showWelcome && (
            <div className="p-4">
              <ErrorBoundary>
                <BienvenidaIA onClose={() => setShowWelcome(false)} />
              </ErrorBoundary>
            </div>
          )}
          <ErrorBoundary fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-muted-foreground">
                  Panel de gráficos temporalmente no disponible
                </p>
              </div>
            </div>
          }>
            <ChartPanel selectedAsset={selectedAsset} />
          </ErrorBoundary>
        </div>

        {/* Alert Panel (conditionally shown) */}
        {showAlerts && (
          <div className="w-96 border-l border-border bg-card">
            <AlertPanel selectedAsset={selectedAsset} />
          </div>
        )}

        {/* Adaptive Learning Panel (conditionally shown) */}
        {showLearning && (
          <div className="w-96 border-l border-border bg-card p-4">
            <AdaptiveLearningDashboard
              metrics={metrics}
              config={config}
              isLearning={isLearning}
              onTriggerLearning={triggerLearningCycle}
              onResetConfig={resetConfiguration}
            />
          </div>
        )}

        {/* MLflow Model Registry Panel (conditionally shown) */}
        {showMLflow && (
          <div className="w-96 border-l border-border bg-card p-4">
            <MLflowDashboard
              stats={mlflowStats}
              isVersioning={isVersioning}
              onForceVersioning={forceVersioning}
              onRollback={executeRollback}
              onCleanRegistry={cleanRegistry}
            />
          </div>
        )}

        {/* River Online Learning Panel (conditionally shown) */}
        {showRiver && (
          <div className="w-96 border-l border-border bg-card p-4 overflow-y-auto">
            <RiverOnlineLearningDashboard />
          </div>
        )}

        {/* Advanced Predictions Analytics Panel (conditionally shown) */}
        {showPredictions && (
          <div className="w-96 border-l border-border bg-card p-4 overflow-y-auto">
            <AdvancedPredictionDashboard />
          </div>
        )}
      </div>

      {/* Prediction System Demo Overlay (conditionally shown) */}
      {showPredictionDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">🧠 Sistema de Predicciones IA - Demo</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPredictionDemo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Cerrar
              </Button>
            </div>
            <PredictionSystemDemo />
          </div>
        </div>
      )}
    </div>
  );
};