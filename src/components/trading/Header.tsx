import { Button } from "@/components/ui/button";
import { Bell, TrendingUp, Settings, Sparkles, Brain, Database, Zap, BarChart4, Play } from "lucide-react";

interface HeaderProps {
  onToggleAlerts: () => void;
  onToggleWelcome?: () => void;
  onToggleLearning?: () => void;
  onToggleMLflow?: () => void;
  onToggleRiver?: () => void;
  onTogglePredictions?: () => void;
  onTogglePredictionDemo?: () => void;
  showWelcome?: boolean;
}

export const Header = ({ onToggleAlerts, onToggleWelcome, onToggleLearning, onToggleMLflow, onToggleRiver, onTogglePredictions, onTogglePredictionDemo, showWelcome }: HeaderProps) => {
  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-neutral bg-clip-text text-transparent">
            ChartWhisperer
          </h1>
        </div>
        <div className="ml-6 text-sm text-muted-foreground">
          Professional Trading Platform
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {onToggleWelcome && (
          <Button 
            variant={showWelcome ? "default" : "ghost"} 
            size="sm" 
            onClick={onToggleWelcome}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            IA
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onToggleAlerts}>
          <Bell className="h-4 w-4 mr-2" />
          Alertas
        </Button>
        {onToggleLearning && (
          <Button variant="ghost" size="sm" onClick={onToggleLearning}>
            <Brain className="h-4 w-4 mr-2" />
            Aprendizaje
          </Button>
        )}
        {onToggleMLflow && (
          <Button variant="ghost" size="sm" onClick={onToggleMLflow}>
            <Database className="h-4 w-4 mr-2" />
            MLflow
          </Button>
        )}
        {onToggleRiver && (
          <Button variant="ghost" size="sm" onClick={onToggleRiver}>
            <Zap className="h-4 w-4 mr-2" />
            River
          </Button>
        )}
        {onTogglePredictions && (
          <Button variant="ghost" size="sm" onClick={onTogglePredictions}>
            <BarChart4 className="h-4 w-4 mr-2" />
            Análisis
          </Button>
        )}
        {onTogglePredictionDemo && (
          <Button variant="ghost" size="sm" onClick={onTogglePredictionDemo}>
            <Play className="h-4 w-4 mr-2" />
            Demo
          </Button>
        )}
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </Button>
      </div>
    </header>
  );
};