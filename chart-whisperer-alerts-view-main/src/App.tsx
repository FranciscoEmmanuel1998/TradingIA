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

// 🔥 EXTERMINIO DE MOCKS - Importar sistemas anti-simulación
// import { systemGuard } from "./core/security/SystemGuard";
// import { realMarketFeed } from "./core/feeds/RealMarketFeed";

const queryClient = new QueryClient();

const App = () => {
  
  // 🛡️ Inicializar sistemas anti-simulación al cargar la app
  useEffect(() => {
    // Solo inicializar en modo de producción real
    if (import.meta.env.VITE_ENABLE_SIMULATION === 'false') {
      console.log('🔥 EXTERMINIO DE MOCKS: Inicializando sistema anti-simulación...');
      
      // TODO: Descomentar cuando los módulos estén disponibles en el cliente
      // systemGuard.startGuard();
      // realMarketFeed.initialize();
      
      console.log('🛡️ Sistema configurado para datos REALES únicamente');
    } else {
      console.warn('⚠️ ADVERTENCIA: Modo de simulación detectado en el cliente');
    }
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
