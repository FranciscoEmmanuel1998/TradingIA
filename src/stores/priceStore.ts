import { create } from 'zustand';
import { PriceData, ConnectionStatus } from '../types/trading';

interface PriceStore {
  // State
  prices: Record<string, PriceData>;
  connectionStatus: Record<string, ConnectionStatus>;
  
  // Actions
  updatePrice: (symbol: string, data: PriceData) => void;
  setConnectionStatus: (symbol: string, status: ConnectionStatus) => void;
  getPrice: (symbol: string) => PriceData | undefined;
  
  // Cleanup
  removePriceData: (symbol: string) => void;
}

export const usePriceStore = create<PriceStore>((set, get) => ({
  prices: {},
  connectionStatus: {},
  
  updatePrice: (symbol: string, data: PriceData) => 
    set((state) => ({
      prices: {
        ...state.prices,
        [symbol]: data
      }
    })),
  
  setConnectionStatus: (symbol: string, status: ConnectionStatus) =>
    set((state) => ({
      connectionStatus: {
        ...state.connectionStatus,
        [symbol]: status
      }
    })),
  
  getPrice: (symbol: string) => {
    const state = get();
    return state.prices[symbol];
  },
  
  removePriceData: (symbol: string) =>
    set((state) => {
      const newPrices = { ...state.prices };
      const newStatus = { ...state.connectionStatus };
      delete newPrices[symbol];
      delete newStatus[symbol];
      
      return {
        prices: newPrices,
        connectionStatus: newStatus
      };
    })
}));
