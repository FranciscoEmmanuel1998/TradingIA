// 🔒 VERIFICADOR DE PUREZA DEL SISTEMA
// Asegura que NO hay contaminación con datos simulados

export class SystemPurityChecker {
  private static instance: SystemPurityChecker;
  
  private constructor() {}
  
  public static getInstance(): SystemPurityChecker {
    if (!SystemPurityChecker.instance) {
      SystemPurityChecker.instance = new SystemPurityChecker();
    }
    return SystemPurityChecker.instance;
  }
  
  /**
   * 🚫 Verificar que NO hay simulaciones activas
   */
  public verifyNoSimulations(): boolean {
    const checks = {
      'ENABLE_SIMULATION': process.env.ENABLE_SIMULATION !== 'true',
      'USE_DEV_SIMULATOR': process.env.USE_DEV_SIMULATOR !== 'true',
      'VITE_ENABLE_SIMULATION': import.meta.env.VITE_ENABLE_SIMULATION !== 'true',
      'VITE_USE_DEV_SIMULATOR': import.meta.env.VITE_USE_DEV_SIMULATOR !== 'true',
      'ENABLE_REAL_DATA': process.env.ENABLE_REAL_DATA === 'true'
    };
    
    const failed = Object.entries(checks).filter(([key, passed]) => !passed);
    
    if (failed.length > 0) {
      console.error('🚫 CONTAMINACIÓN DETECTADA:');
      failed.forEach(([key, _]) => {
        console.error(`❌ ${key} configurado incorrectamente`);
      });
      return false;
    }
    
    console.log('✅ SISTEMA PURO: Solo datos reales detectados');
    return true;
  }
  
  /**
   * 🔍 Obtener estado detallado del sistema
   */
  public getSystemStatus(): {
    isPure: boolean;
    environment: Record<string, any>;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    // Verificar variables de entorno
    const env = {
      'ENABLE_SIMULATION': process.env.ENABLE_SIMULATION,
      'USE_DEV_SIMULATOR': process.env.USE_DEV_SIMULATOR,
      'ENABLE_REAL_DATA': process.env.ENABLE_REAL_DATA,
      'VITE_ENABLE_SIMULATION': import.meta.env.VITE_ENABLE_SIMULATION,
      'VITE_USE_DEV_SIMULATOR': import.meta.env.VITE_USE_DEV_SIMULATOR,
      'VITE_ENABLE_REAL_DATA': import.meta.env.VITE_ENABLE_REAL_DATA
    };
    
    // Detectar inconsistencias
    if (env.ENABLE_SIMULATION === 'true') warnings.push('ENABLE_SIMULATION activado');
    if (env.USE_DEV_SIMULATOR === 'true') warnings.push('USE_DEV_SIMULATOR activado');
    if (env.ENABLE_REAL_DATA !== 'true') warnings.push('ENABLE_REAL_DATA no activado');
    
    return {
      isPure: this.verifyNoSimulations(),
      environment: env,
      warnings
    };
  }
  
  /**
   * 🛡️ Bloquear funcionamiento si hay contaminación
   */
  public enforceRealDataOnly(): void {
    if (!this.verifyNoSimulations()) {
      throw new Error('🚫 SISTEMA CONTAMINADO: No se puede continuar con simulaciones activas');
    }
  }
}

// Singleton export
export const systemPurityChecker = SystemPurityChecker.getInstance();

// Verificación automática al importar
console.log('🔒 Verificando pureza del sistema...');
const status = systemPurityChecker.getSystemStatus();
if (!status.isPure) {
  console.warn('⚠️ SISTEMA CONTAMINADO:', status.warnings);
} else {
  console.log('✅ SISTEMA PURO VERIFICADO');
}
