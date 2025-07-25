import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ComposedChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  Area,
  Bar,
  ReferenceLine
} from "recharts";
import { TrendingUp, TrendingDown, Volume2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartPanelProps {
  selectedAsset: string;
}

interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi: number;
  ema20: number;
  ema50: number;
  macd: number;
  signal: number;
}

// Mock data generator
const generateMockData = (symbol: string): CandleData[] => {
  const data: CandleData[] = [];
  let basePrice = symbol.includes("BTC") ? 43000 : symbol.includes("ETH") ? 2500 : 180;
  
  for (let i = 0; i < 100; i++) {
    const variation = (Math.random() - 0.5) * 0.02;
    const open = basePrice;
    const close = open * (1 + variation);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    data.push({
      timestamp: new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000000,
      rsi: 30 + Math.random() * 40,
      ema20: close * (0.98 + Math.random() * 0.04),
      ema50: close * (0.96 + Math.random() * 0.08),
      macd: (Math.random() - 0.5) * 2,
      signal: (Math.random() - 0.5) * 2
    });
    
    basePrice = close;
  }
  
  return data;
};

export const ChartPanel = ({ selectedAsset }: ChartPanelProps) => {
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [timeframe, setTimeframe] = useState("1D");
  const [indicators, setIndicators] = useState({
    ema: true,
    rsi: true,
    macd: true,
    volume: true
  });

  useEffect(() => {
    setChartData(generateMockData(selectedAsset));
  }, [selectedAsset]);

  const latestData = chartData[chartData.length - 1];
  const previousData = chartData[chartData.length - 2];
  
  const priceChange = latestData && previousData ? 
    latestData.close - previousData.close : 0;
  const priceChangePercent = latestData && previousData ? 
    (priceChange / previousData.close) * 100 : 0;

  const formatPrice = (price: number) => {
    return selectedAsset.includes("USD") ? 
      price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
      price.toFixed(2);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <div>Apertura: <span className="font-mono">${formatPrice(data.open)}</span></div>
            <div>Máximo: <span className="font-mono text-bull">${formatPrice(data.high)}</span></div>
            <div>Mínimo: <span className="font-mono text-bear">${formatPrice(data.low)}</span></div>
            <div>Cierre: <span className="font-mono">${formatPrice(data.close)}</span></div>
            <div>Volumen: <span className="font-mono">{data.volume.toLocaleString()}</span></div>
            {indicators.rsi && <div>RSI: <span className="font-mono">{data.rsi.toFixed(2)}</span></div>}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Asset Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">{selectedAsset}</h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-mono font-bold">
                ${latestData ? formatPrice(latestData.close) : "0.00"}
              </span>
              <Badge 
                variant={priceChange >= 0 ? "default" : "destructive"}
                className={cn(
                  "flex items-center gap-1",
                  priceChange >= 0 ? "bg-bull text-bull-foreground" : "bg-bear text-bear-foreground"
                )}
              >
                {priceChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {["1H", "4H", "1D", "1W", "1M"].map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1">
        <Tabs defaultValue="chart" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chart">Gráfico Principal</TabsTrigger>
            <TabsTrigger value="volume">Volumen</TabsTrigger>
            <TabsTrigger value="rsi">RSI</TabsTrigger>
            <TabsTrigger value="macd">MACD</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="h-[calc(100%-3rem)] mt-4">
            <Card className="h-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="hsl(var(--chart-text))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--chart-text))"
                    fontSize={12}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Candlestick representation using bars */}
                  <Bar
                    dataKey={(data: CandleData) => [data.low, data.high]}
                    fill="hsl(var(--muted-foreground))"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                  />
                  
                  {/* EMA Lines */}
                  {indicators.ema && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="ema20"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        name="EMA 20"
                      />
                      <Line
                        type="monotone"
                        dataKey="ema50"
                        stroke="hsl(var(--neutral))"
                        strokeWidth={2}
                        dot={false}
                        name="EMA 50"
                      />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="volume" className="h-[calc(100%-3rem)] mt-4">
            <Card className="h-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                  <XAxis dataKey="timestamp" stroke="hsl(var(--chart-text))" fontSize={12} />
                  <YAxis stroke="hsl(var(--chart-text))" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="volume" fill="hsl(var(--chart-volume))" opacity={0.8} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="rsi" className="h-[calc(100%-3rem)] mt-4">
            <Card className="h-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                  <XAxis dataKey="timestamp" stroke="hsl(var(--chart-text))" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--chart-text))" fontSize={12} />
                  <Tooltip />
                  <ReferenceLine y={70} stroke="hsl(var(--bear))" strokeDasharray="5 5" />
                  <ReferenceLine y={30} stroke="hsl(var(--bull))" strokeDasharray="5 5" />
                  <Area
                    type="monotone"
                    dataKey="rsi"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="macd" className="h-[calc(100%-3rem)] mt-4">
            <Card className="h-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                  <XAxis dataKey="timestamp" stroke="hsl(var(--chart-text))" fontSize={12} />
                  <YAxis stroke="hsl(var(--chart-text))" fontSize={12} />
                  <Tooltip />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                  <Bar dataKey="macd" fill="hsl(var(--primary))" opacity={0.7} />
                  <Line
                    type="monotone"
                    dataKey="signal"
                    stroke="hsl(var(--bear))"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Indicator Toggle */}
      <div className="mt-4 flex items-center gap-4 p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">Indicadores:</span>
        {Object.entries(indicators).map(([key, enabled]) => (
          <Button
            key={key}
            variant={enabled ? "default" : "outline"}
            size="sm"
            onClick={() => setIndicators(prev => ({ ...prev, [key]: !prev[key as keyof typeof indicators] }))}
            className="capitalize"
          >
            {key.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  );
};