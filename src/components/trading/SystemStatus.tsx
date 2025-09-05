import React from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

interface SystemStatusProps {
  isSignalSystemActive?: boolean;
  isPriceTrackingActive?: boolean;
  isVerificationSystemActive?: boolean;
  totalPredictions?: number;
  lastUpdateTime?: Date;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({
  isSignalSystemActive = false,
  isPriceTrackingActive = false,
  isVerificationSystemActive = false,
  totalPredictions = 0,
  lastUpdateTime
}) => {
  const getStatusIcon = (isActive: boolean, isLoading?: boolean) => {
    if (isLoading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (isActive) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (isActive: boolean, label: string, isLoading?: boolean) => {
    if (isLoading) {
      return <Badge variant="outline" className="bg-yellow-50">🔄 {label}</Badge>;
    }
    return (
      <Badge 
        variant={isActive ? "default" : "destructive"}
        className={isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
      >
        {isActive ? "✅" : "❌"} {label}
      </Badge>
    );
  };

  return (
    <Card className="bg-gradient-to-r from-slate-50 to-gray-50">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Estado del Sistema de Precisión</h3>
            {lastUpdateTime && (
              <span className="text-xs text-gray-500">
                Última actualización: {lastUpdateTime.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(isSignalSystemActive)}
              {getStatusBadge(isSignalSystemActive, "Señales IA")}
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(isPriceTrackingActive)}
              {getStatusBadge(isPriceTrackingActive, "Precios")}
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(isVerificationSystemActive)}
              {getStatusBadge(isVerificationSystemActive, "Verificación")}
            </div>
          </div>

          {totalPredictions > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                Total de predicciones: <strong>{totalPredictions}</strong>
              </span>
            </div>
          )}

          {/* Estado general del sistema */}
          <div className="pt-2 border-t">
            {isSignalSystemActive && isPriceTrackingActive && isVerificationSystemActive ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700 font-medium">
                  🚀 Sistema completamente funcional
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-700 font-medium">
                  ⚠️ Sistema inicializándose...
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
