import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Star, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isFavorite: boolean;
}

interface WatchlistProps {
  selectedAsset: string;
  onSelectAsset: (symbol: string) => void;
}

const mockAssets: Asset[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 189.95, change: 2.45, changePercent: 1.31, isFavorite: true },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 378.85, change: -1.23, changePercent: -0.32, isFavorite: true },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.56, change: 0.89, changePercent: 0.63, isFavorite: false },
  { symbol: "BTC-USD", name: "Bitcoin", price: 43250.00, change: 1250.50, changePercent: 2.98, isFavorite: true },
  { symbol: "ETH-USD", name: "Ethereum", price: 2580.75, change: -45.30, changePercent: -1.73, isFavorite: true },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.42, change: 8.92, changePercent: 3.73, isFavorite: false },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.28, change: 15.47, changePercent: 1.80, isFavorite: false },
];

export const Watchlist = ({ selectedAsset, onSelectAsset }: WatchlistProps) => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || asset.isFavorite;
    return matchesSearch && matchesFilter;
  });

  const toggleFavorite = (symbol: string) => {
    setAssets(prev => prev.map(asset => 
      asset.symbol === symbol ? { ...asset, isFavorite: !asset.isFavorite } : asset
    ));
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatChange = (change: number, percent: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Watchlist
        </h2>
        
        <div className="space-y-3">
          <Input
            placeholder="Buscar activos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-background"
          />
          
          <div className="flex gap-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="flex-1"
            >
              Todos
            </Button>
            <Button 
              variant={filter === "favorites" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("favorites")}
              className="flex-1"
            >
              Favoritos
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredAssets.map((asset) => (
          <Card
            key={asset.symbol}
            className={cn(
              "p-3 cursor-pointer transition-all duration-200 hover:shadow-lg",
              selectedAsset === asset.symbol && "ring-2 ring-primary bg-accent"
            )}
            onClick={() => onSelectAsset(asset.symbol)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(asset.symbol);
                  }}
                >
                  <Star 
                    className={cn(
                      "h-3 w-3",
                      asset.isFavorite ? "fill-neutral text-neutral" : "text-muted-foreground"
                    )} 
                  />
                </Button>
                <span className="font-semibold text-sm">{asset.symbol}</span>
              </div>
              {asset.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-bull" />
              ) : (
                <TrendingDown className="h-4 w-4 text-bear" />
              )}
            </div>
            
            <div className="text-xs text-muted-foreground mb-1 truncate">
              {asset.name}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-medium">
                ${formatPrice(asset.price)}
              </span>
              <span 
                className={cn(
                  "text-xs font-medium",
                  asset.change >= 0 ? "text-bull" : "text-bear"
                )}
              >
                {formatChange(asset.change, asset.changePercent)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="outline" className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Activo
        </Button>
      </div>
    </div>
  );
};