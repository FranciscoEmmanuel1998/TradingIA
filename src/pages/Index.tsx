import { TradingLayout } from "@/components/trading/TradingLayout";
import { PriceTicker } from "@/components/PriceTicker";
import { LivingSystemMonitor } from "@/components/LivingSystemMonitor";
import { AlignedTradingDashboard } from "@/components/AlignedTradingDashboard";
import { FinancialConsciousnessDashboard } from "@/components/trading/FinancialConsciousnessDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="consciousness" className="w-full">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold mb-4">⚔️  Sistema Alineado</h1>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="consciousness">🧠 Conciencia IA</TabsTrigger>
            <TabsTrigger value="aligned">⚔️ Sistema Alineado</TabsTrigger>
            <TabsTrigger value="system">🧬 Sistema Vivo</TabsTrigger>
            <TabsTrigger value="prices">💰 Precios Live</TabsTrigger>
            <TabsTrigger value="trading">📊 Trading</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="consciousness">
          <FinancialConsciousnessDashboard />
        </TabsContent>

        <TabsContent value="aligned">
          <AlignedTradingDashboard />
        </TabsContent>

        <TabsContent value="system">
          <LivingSystemMonitor />
        </TabsContent>

        <TabsContent value="prices">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">🚀 FASE 1 - Live Binance Prices</h2>
            <div className="flex gap-4 flex-wrap">
              <PriceTicker symbol="BTCUSDT" />
              <PriceTicker symbol="ETHUSDT" />
              <PriceTicker symbol="ADAUSDT" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trading">
          <TradingLayout />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
