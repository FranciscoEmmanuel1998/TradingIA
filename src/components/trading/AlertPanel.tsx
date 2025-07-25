import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Plus, 
  Trash2, 
  Volume2, 
  VolumeX, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Alert {
  id: string;
  asset: string;
  type: "price" | "ema_cross" | "rsi" | "volume";
  condition: "above" | "below" | "cross_up" | "cross_down";
  value: number;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  soundEnabled: boolean;
}

interface AlertPanelProps {
  selectedAsset: string;
}

export const AlertPanel = ({ selectedAsset }: AlertPanelProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newAlert, setNewAlert] = useState({
    type: "price" as Alert["type"],
    condition: "above" as Alert["condition"],
    value: 0,
    soundEnabled: true
  });
  const [globalSoundEnabled, setGlobalSoundEnabled] = useState(true);

  // Load alerts from localStorage
  useEffect(() => {
    const savedAlerts = localStorage.getItem("trading-alerts");
    if (savedAlerts) {
      try {
        const parsed = JSON.parse(savedAlerts);
        setAlerts(parsed.map((alert: any) => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined
        })));
      } catch (error) {
        console.error("Error loading alerts:", error);
      }
    }
  }, []);

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem("trading-alerts", JSON.stringify(alerts));
  }, [alerts]);

  // Play sound when alert is triggered
  const playAlertSound = useCallback(() => {
    if (!globalSoundEnabled) return;
    
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [globalSoundEnabled]);

  // Simulate price monitoring (in real app, this would come from WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentPrice = Math.random() * 200 + 150; // Mock price
      
      setAlerts(prev => prev.map(alert => {
        if (alert.isTriggered || !alert.isActive || alert.asset !== selectedAsset) {
          return alert;
        }

        let shouldTrigger = false;
        
        if (alert.type === "price") {
          if (alert.condition === "above" && currentPrice > alert.value) {
            shouldTrigger = true;
          } else if (alert.condition === "below" && currentPrice < alert.value) {
            shouldTrigger = true;
          }
        }

        if (shouldTrigger) {
          toast.success(`🚨 Alerta activada: ${alert.asset} ${alert.condition} $${alert.value}`, {
            duration: 5000,
          });
          
          if (alert.soundEnabled) {
            playAlertSound();
          }

          return {
            ...alert,
            isTriggered: true,
            triggeredAt: new Date()
          };
        }

        return alert;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedAsset, playAlertSound]);

  const createAlert = () => {
    if (newAlert.value <= 0) {
      toast.error("Por favor, ingresa un valor válido");
      return;
    }

    const alert: Alert = {
      id: Date.now().toString(),
      asset: selectedAsset,
      type: newAlert.type,
      condition: newAlert.condition,
      value: newAlert.value,
      isActive: true,
      isTriggered: false,
      createdAt: new Date(),
      soundEnabled: newAlert.soundEnabled
    };

    setAlerts(prev => [alert, ...prev]);
    setNewAlert({ ...newAlert, value: 0 });
    toast.success("Alerta creada exitosamente");
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast.success("Alerta eliminada");
  };

  const resetAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isTriggered: false, triggeredAt: undefined } : alert
    ));
    toast.success("Alerta reiniciada");
  };

  const activeAlerts = alerts.filter(alert => alert.isActive && !alert.isTriggered);
  const triggeredAlerts = alerts.filter(alert => alert.isTriggered);

  const getAlertTypeLabel = (type: Alert["type"]) => {
    const labels = {
      price: "Precio",
      ema_cross: "Cruce EMA",
      rsi: "RSI",
      volume: "Volumen"
    };
    return labels[type];
  };

  const getConditionLabel = (condition: Alert["condition"]) => {
    const labels = {
      above: "Por encima",
      below: "Por debajo",
      cross_up: "Cruce hacia arriba",
      cross_down: "Cruce hacia abajo"
    };
    return labels[condition];
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Sistema de Alertas
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGlobalSoundEnabled(!globalSoundEnabled)}
          >
            {globalSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="create" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Crear</TabsTrigger>
          <TabsTrigger value="active">
            Activas ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="triggered">
            Activadas ({triggeredAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="asset">Activo</Label>
                <Input
                  id="asset"
                  value={selectedAsset}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo de Alerta</Label>
                <Select
                  value={newAlert.type}
                  onValueChange={(value) => setNewAlert({ ...newAlert, type: value as Alert["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Precio</SelectItem>
                    <SelectItem value="ema_cross">Cruce EMA</SelectItem>
                    <SelectItem value="rsi">RSI</SelectItem>
                    <SelectItem value="volume">Volumen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Condición</Label>
                <Select
                  value={newAlert.condition}
                  onValueChange={(value) => setNewAlert({ ...newAlert, condition: value as Alert["condition"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {newAlert.type === "price" && (
                      <>
                        <SelectItem value="above">Por encima de</SelectItem>
                        <SelectItem value="below">Por debajo de</SelectItem>
                      </>
                    )}
                    {newAlert.type === "ema_cross" && (
                      <>
                        <SelectItem value="cross_up">Cruce hacia arriba</SelectItem>
                        <SelectItem value="cross_down">Cruce hacia abajo</SelectItem>
                      </>
                    )}
                    {newAlert.type === "rsi" && (
                      <>
                        <SelectItem value="above">Por encima de</SelectItem>
                        <SelectItem value="below">Por debajo de</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  type="number"
                  value={newAlert.value || ""}
                  onChange={(e) => setNewAlert({ ...newAlert, value: parseFloat(e.target.value) || 0 })}
                  placeholder={newAlert.type === "price" ? "Precio objetivo" : "Valor"}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sound"
                  checked={newAlert.soundEnabled}
                  onCheckedChange={(checked) => setNewAlert({ ...newAlert, soundEnabled: checked })}
                />
                <Label htmlFor="sound">Habilitar sonido</Label>
              </div>

              <Button onClick={createAlert} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Crear Alerta
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="flex-1">
          <div className="space-y-3 h-full overflow-y-auto">
            {activeAlerts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No hay alertas activas
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <Card key={alert.id} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getAlertTypeLabel(alert.type)}
                      </Badge>
                      <span className="font-medium text-sm">{alert.asset}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {alert.soundEnabled && <Volume2 className="h-3 w-3 text-muted-foreground" />}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAlert(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Switch checked={alert.isActive} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                        className="h-6 w-6 p-0 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getConditionLabel(alert.condition)} ${alert.value.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Creada: {alert.createdAt.toLocaleString()}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="triggered" className="flex-1">
          <div className="space-y-3 h-full overflow-y-auto">
            {triggeredAlerts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No hay alertas activadas
              </div>
            ) : (
              triggeredAlerts.map((alert) => (
                <Card key={alert.id} className="p-3 border-bull bg-bull/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-bull" />
                      <Badge variant="outline" className="text-xs border-bull text-bull">
                        {getAlertTypeLabel(alert.type)}
                      </Badge>
                      <span className="font-medium text-sm">{alert.asset}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetAlert(alert.id)}
                        className="text-xs"
                      >
                        Reiniciar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                        className="h-6 w-6 p-0 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-bull">
                    {getConditionLabel(alert.condition)} ${alert.value.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Activada: {alert.triggeredAt?.toLocaleString()}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};