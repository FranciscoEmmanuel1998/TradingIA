import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TradingSignalsFree from "./pages/TradingSignalsFree";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LiberationInterface } from "./components/trading/LiberationInterface";
import { useEffect } from "react";

// 🎯 INTEGRACIÓN REAL - Sistema sin simulaciones
import { initializeRealTradingSystem } from "./core/integration/SystemIntegration";

const queryClient = new QueryClient();

const App = () => {
  
  // 🎯 INICIALIZAR SISTEMA REAL AL CARGAR LA APP
  useEffect(() => {
    const initSystem = async () => {
      console.log('� INICIALIZANDO SISTEMA DE TRADING REAL...');
      
      try {
        const success = await initializeRealTradingSystem();
        
        if (success) {
          console.log('✅ SISTEMA REAL INICIALIZADO - Tracking de señales activado');
          console.log('� Todas las métricas serán verificables contra precios de mercado');
        } else {
          console.error('❌ ERROR: Fallo en inicialización del sistema real');
        }
        
      } catch (error) {
        console.error('💥 ERROR CRÍTICO EN INICIALIZACIÓN:', error);
      }
    };

    initSystem();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            {/* Ruta principal - Señales gratuitas sin registro */}
            <Route path="/" element={<TradingSignalsFree />} />
            
            {/* Dashboard completo del sistema */}
            <Route path="/dashboard" element={<Index />} />
            
            {/* Interfaz de liberación */}
            <Route path="/liberation" element={<LiberationInterface />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
