import { useEffect, useState, useCallback } from 'react';

interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
}

/**
 * Hook para rastrear precios de múltiples símbolos
 * Nota: Este es un hook simplificado que usa un WebSocket común
 */
export const usePriceTracker = (symbols: string[]) => {
  const [trackedPrices, setTrackedPrices] = useState<Record<string, PriceData>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    let ws: WebSocket | null = null;
    
    const connectWebSocket = () => {
      try {
        // Crear conexión WebSocket para múltiples símbolos
        const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`).join('/');
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

        ws.onopen = () => {
          setIsConnected(true);
          console.log('🔗 Rastreador de precios conectado');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const price = parseFloat(data.c); // Current price
            const symbol = data.s; // Symbol
            
            if (symbol && price > 0) {
              setTrackedPrices(prev => ({
                ...prev,
                [symbol]: {
                  symbol,
                  price,
                  timestamp: Date.now()
                }
              }));
            }
          } catch (error) {
            console.warn('Error parsing price data:', error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log('🔌 Rastreador de precios desconectado');
        };

        ws.onerror = (error) => {
          console.error('❌ Error en rastreador de precios:', error);
          setIsConnected(false);
        };

      } catch (error) {
        console.error('❌ Error creando conexión de precios:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [symbols.join(',')]);

  const getPrice = useCallback((symbol: string): number | null => {
    return trackedPrices[symbol]?.price || null;
  }, [trackedPrices]);

  const getAllPrices = useCallback((): Record<string, PriceData> => {
    return trackedPrices;
  }, [trackedPrices]);

  return {
    prices: trackedPrices,
    getPrice,
    getAllPrices,
    isTracking: Object.keys(trackedPrices).length > 0,
    isConnected
  };
};
