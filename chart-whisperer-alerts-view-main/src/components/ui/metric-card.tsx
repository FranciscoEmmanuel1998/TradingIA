// 📊 Componente para mostrar métricas con estados de carga
import React from 'react';
import { Card, CardContent } from './card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  isLoading?: boolean;
  suffix?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  isLoading = false,
  suffix = ''
}) => {
  return (
    <Card className="bg-black/30 border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>
              {isLoading ? (
                <span className="inline-block w-16 h-8 bg-gray-600/30 rounded animate-pulse"></span>
              ) : (
                `${value}${suffix}`
              )}
            </p>
          </div>
          <Icon className={`h-8 w-8 ${color.replace('text-', 'text-').replace('-400', '-400')}`} />
        </div>
      </CardContent>
    </Card>
  );
};
