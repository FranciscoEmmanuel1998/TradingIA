import { useEffect, useRef } from 'react';
import { usePriceStore } from '../stores/priceStore';
import { BinanceWSMessage, PriceData } from '../types/trading';
import { predictionVerificationSystem } from '../core/verification/PredictionVerificationSystem';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/';

export const useBinancePrice = (symbol: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second
  
  const { updatePrice, setConnectionStatus, getPrice } = usePriceStore();
  
  const connect = () => {
    try {
      // Cerrar conexión existente si la hay
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setConnectionStatus(symbol, 'connecting');
      
      // Format symbol for Binance (lowercase)
      const formattedSymbol = symbol.toLowerCase();
      const wsUrl = `${BINANCE_WS_URL}${formattedSymbol}@ticker`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log(`✅ Binance WS connected for ${symbol}`);
        setConnectionStatus(symbol, 'connected');
        reconnectAttempts.current = 0;
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data: BinanceWSMessage = JSON.parse(event.data);
          
          const priceData: PriceData = {
            symbol: data.s,
            price: parseFloat(data.c),
            timestamp: Date.now(),
            change24h: parseFloat(data.P),
            volume: parseFloat(data.v)
          };
          
          updatePrice(symbol, priceData);
          
          // 📊 ENVIAR PRECIO AL SISTEMA DE VERIFICACIÓN
          predictionVerificationSystem.updatePrice(data.s, parseFloat(data.c));
        } catch (error) {
          console.error(`❌ Error parsing Binance data for ${symbol}:`, error);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error(`❌ Binance WS error for ${symbol}:`, error);
        setConnectionStatus(symbol, 'error');
      };
      
      wsRef.current.onclose = (event) => {
        console.log(`🔌 Binance WS closed for ${symbol}`, event.code, event.reason);
        setConnectionStatus(symbol, 'disconnected');
        
        // Solo reconectar si no fue una desconexión intencional
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
          console.log(`🔄 Reconnecting ${symbol} in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else if (event.code !== 1000) {
          console.error(`💀 Max reconnection attempts reached for ${symbol}`);
          setConnectionStatus(symbol, 'error');
        }
      };
      
    } catch (error) {
      console.error(`❌ Failed to create WS connection for ${symbol}:`, error);
      setConnectionStatus(symbol, 'error');
    }
  };
  
  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };
  
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [symbol]);
  
  // Return current price data and connection status
  const currentPrice = getPrice(symbol);
  const connectionStatus = usePriceStore(state => state.connectionStatus[symbol] || 'disconnected');
  
  return {
    price: currentPrice,
    connectionStatus,
    reconnect: connect,
    disconnect
  };
};
