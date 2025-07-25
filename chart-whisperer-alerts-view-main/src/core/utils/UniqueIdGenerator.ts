// 🆔 Generador de IDs únicos para señales
// Garantiza IDs completamente únicos para React keys

class UniqueIdGenerator {
  private static instance: UniqueIdGenerator;
  private counter: number = 0;
  private usedIds: Set<string> = new Set();
  
  private constructor() {}
  
  public static getInstance(): UniqueIdGenerator {
    if (!UniqueIdGenerator.instance) {
      UniqueIdGenerator.instance = new UniqueIdGenerator();
    }
    return UniqueIdGenerator.instance;
  }
  
  public generateSignalId(symbol: string): string {
    let id: string;
    let attempts = 0;
    
    do {
      this.counter++;
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 8);
      const cleanSymbol = symbol.replace(/[^A-Z]/g, '');
      
      id = `${cleanSymbol}_${timestamp}_${this.counter}_${random}`;
      attempts++;
      
      // Failsafe para evitar loops infinitos
      if (attempts > 100) {
        id = `${cleanSymbol}_${timestamp}_${this.counter}_${Math.random()}_${performance.now()}`;
        break;
      }
    } while (this.usedIds.has(id));
    
    this.usedIds.add(id);
    
    // Limpiar IDs antiguos para evitar memory leaks
    if (this.usedIds.size > 1000) {
      const idsArray = Array.from(this.usedIds);
      const toKeep = idsArray.slice(-500); // Mantener últimos 500
      this.usedIds = new Set(toKeep);
    }
    
    return id;
  }
  
  public clearUsedIds(): void {
    this.usedIds.clear();
  }
}

export const uniqueIdGenerator = UniqueIdGenerator.getInstance();
