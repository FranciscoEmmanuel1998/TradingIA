import React from 'react';
import { useBinancePrice } from '../hooks/useBinancePrice';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface PriceTickerProps {
  symbol: string;
  className?: string;
}

export const PriceTicker: React.FC<PriceTickerProps> = ({ symbol, className }) => {
  const { price, connectionStatus } = useBinancePrice(symbol);
  
  const isConnected = connectionStatus === 'connected';
  const isPositiveChange = price ? price.change24h >= 0 : false;
  
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(value);
  };
  
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  return (
    <Card className={cn("p-4 min-w-[280px]", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{symbol}</h3>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Badge 
              variant={isConnected ? "default" : "destructive"}
              className="text-xs"
            >
              {connectionStatus}
            </Badge>
          </div>
        </div>
        
        {price && (
          <div className="flex items-center gap-1">
            {isPositiveChange ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {price ? (
        <div className="space-y-1">
          <div className="text-2xl font-mono font-bold">
            {formatPrice(price.price)}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span 
              className={cn(
                "font-medium",
                isPositiveChange ? "text-green-600" : "text-red-600"
              )}
            >
              {formatPercentage(price.change24h)}
            </span>
            
            <span className="text-muted-foreground">
              Vol: {price.volume.toLocaleString(undefined, { 
                notation: 'compact', 
                maximumFractionDigits: 1 
              })}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Last update: {new Date(price.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
        </div>
      )}
    </Card>
  );
};
