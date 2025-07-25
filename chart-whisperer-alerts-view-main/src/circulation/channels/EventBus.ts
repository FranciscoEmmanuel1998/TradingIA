// 🌐 EVENT BUS - Sistema Circulatorio de Comunicación

type EventCallback = (data: any) => void;

export class EventBus {
  private static instance: EventBus;
  private subscribers: Map<string, EventCallback[]>;
  private eventHistory: Array<{ event: string; data: any; timestamp: number }>;

  private constructor() {
    this.subscribers = new Map();
    this.eventHistory = [];
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  subscribe(event: string, callback: EventCallback): void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    
    this.subscribers.get(event)!.push(callback);
    console.log(`🔌 EventBus: Suscrito a evento '${event}'`);
  }

  unsubscribe(event: string, callback: EventCallback): void {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        console.log(`🔌 EventBus: Desuscrito de evento '${event}'`);
      }
    }
  }

  emit(event: string, data?: any): void {
    // Registrar en historial
    this.eventHistory.push({
      event,
      data,
      timestamp: Date.now()
    });

    // Mantener solo los últimos 1000 eventos
    if (this.eventHistory.length > 1000) {
      this.eventHistory = this.eventHistory.slice(-1000);
    }

    console.log(`📡 EventBus: Emitiendo '${event}'`, data);

    // Notificar a suscriptores
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ EventBus: Error en callback para '${event}':`, error);
        }
      });
    }
  }

  getEventHistory(limit: number = 50): Array<{ event: string; data: any; timestamp: number }> {
    return this.eventHistory.slice(-limit);
  }

  getSubscriberCount(event: string): number {
    return this.subscribers.get(event)?.length || 0;
  }

  getAllEvents(): string[] {
    return Array.from(this.subscribers.keys());
  }

  clear(): void {
    this.subscribers.clear();
    this.eventHistory = [];
    console.log('🧹 EventBus: Sistema de eventos limpiado');
  }
}
