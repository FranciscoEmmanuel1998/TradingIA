// 🔐 ENVIRONMENT CONFIGURATION - Configuración Segura de APIs
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno con prioridad en .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface ExchangeCredentials {
  kraken?: {
    apiKey: string;
    privateKey: string;
    enabled: boolean;
  };
  coinbase?: {
    keyId: string;
    privateKey: string;
    enabled: boolean;
  };
  kucoin?: {
    apiKey: string;
    apiSecret: string;
    passphrase: string;
    enabled: boolean;
  };
}

export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private credentials: ExchangeCredentials;

  private constructor() {
    this.credentials = this.loadCredentials();
  }

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private loadCredentials(): ExchangeCredentials {
    const config: ExchangeCredentials = {};

    // Configuración de Kraken
    if (process.env.KRAKEN_API_KEY && process.env.KRAKEN_PRIVATE_KEY) {
      config.kraken = {
        apiKey: process.env.KRAKEN_API_KEY,
        privateKey: process.env.KRAKEN_PRIVATE_KEY,
        enabled: process.env.KRAKEN_ENABLED?.toLowerCase() === 'true' || true
      };
      console.log('✅ Kraken credentials loaded');
    } else {
      console.log('⚠️ Kraken credentials not found in environment');
    }

    // Configuración de Coinbase Advanced Trade
    if (process.env.CDP_KEY_ID && process.env.CDP_PRIVATE_KEY) {
      config.coinbase = {
        keyId: process.env.CDP_KEY_ID,
        privateKey: process.env.CDP_PRIVATE_KEY,
        enabled: process.env.COINBASE_ENABLED?.toLowerCase() === 'true' || true
      };
      console.log('✅ Coinbase Advanced Trade credentials loaded');
    } else if (process.env.COINBASE_API_KEY && process.env.COINBASE_API_SECRET) {
      // Fallback a configuración legacy
      config.coinbase = {
        keyId: process.env.COINBASE_API_KEY,
        privateKey: process.env.COINBASE_API_SECRET,
        enabled: process.env.COINBASE_ENABLED?.toLowerCase() === 'true' || true
      };
      console.log('✅ Coinbase credentials loaded (legacy format)');
    } else {
      console.log('⚠️ Coinbase credentials not found in environment');
    }

    // Configuración de KuCoin
    if (process.env.KUCOIN_API_KEY && process.env.KUCOIN_API_SECRET && process.env.KUCOIN_API_PASSPHRASE) {
      config.kucoin = {
        apiKey: process.env.KUCOIN_API_KEY,
        apiSecret: process.env.KUCOIN_API_SECRET,
        passphrase: process.env.KUCOIN_API_PASSPHRASE,
        enabled: process.env.KUCOIN_ENABLED?.toLowerCase() === 'true' || true
      };
      console.log('✅ KuCoin credentials loaded');
    } else {
      console.log('⚠️ KuCoin credentials not found in environment');
    }

    return config;
  }

  getCredentials(): ExchangeCredentials {
    return { ...this.credentials };
  }

  getEnabledExchanges(): string[] {
    const enabled: string[] = [];
    
    if (this.credentials.kraken?.enabled) enabled.push('kraken');
    if (this.credentials.coinbase?.enabled) enabled.push('coinbase');
    if (this.credentials.kucoin?.enabled) enabled.push('kucoin');
    
    return enabled;
  }

  validateCredentials(): { valid: boolean; missing: string[]; errors: string[] } {
    const missing: string[] = [];
    const errors: string[] = [];

    // Validar Kraken
    if (this.credentials.kraken?.enabled) {
      if (!this.credentials.kraken.apiKey) missing.push('KRAKEN_API_KEY');
      if (!this.credentials.kraken.privateKey) missing.push('KRAKEN_PRIVATE_KEY');
      
      try {
        if (this.credentials.kraken.privateKey) {
          Buffer.from(this.credentials.kraken.privateKey, 'base64');
        }
      } catch (error) {
        errors.push('KRAKEN_PRIVATE_KEY is not valid base64');
      }
    }

    // Validar Coinbase
    if (this.credentials.coinbase?.enabled) {
      if (!this.credentials.coinbase.keyId) missing.push('CDP_KEY_ID or COINBASE_API_KEY');
      if (!this.credentials.coinbase.privateKey) missing.push('CDP_PRIVATE_KEY or COINBASE_API_SECRET');
      
      try {
        if (this.credentials.coinbase.privateKey) {
          Buffer.from(this.credentials.coinbase.privateKey, 'base64');
        }
      } catch (error) {
        errors.push('Coinbase private key is not valid base64');
      }
    }

    // Validar KuCoin
    if (this.credentials.kucoin?.enabled) {
      if (!this.credentials.kucoin.apiKey) missing.push('KUCOIN_API_KEY');
      if (!this.credentials.kucoin.apiSecret) missing.push('KUCOIN_API_SECRET');
      if (!this.credentials.kucoin.passphrase) missing.push('KUCOIN_API_PASSPHRASE');
    }

    const valid = missing.length === 0 && errors.length === 0;
    
    return { valid, missing, errors };
  }

  // Para desarrollo/testing - NO usar en producción
  setTestCredentials(): void {
    console.log('⚠️ Setting test credentials for development');
    
    this.credentials = {
      kraken: {
        apiKey: '/6rX0unl4ajQgB1jinsTFDwGQi9a18fDqpP6IOWCIWRn/RfmIhy10SdX',
        privateKey: 'Y+cIHt0ih3scJSu9UMyiYWEAZG54g8/wgkxnFG4aEBntGHkdxWEeVmFLKDKxpeIekqYMNxAg/5eHKJpN1qGemg==',
        enabled: true
      },
      coinbase: {
        keyId: 'e17eef6b-96ca-4b60-b64f-cf096dbdb012',
        privateKey: 'PUk+gSfZmn77XVibdt+IRW91qU7HEGcEgQ+skv3v6qqc/NUKyvVaLvc4yauA0r53h8IkcOB9/OipSBL1qwwVUQ==',
        enabled: true
      },
      kucoin: {
        apiKey: '687e29971cad950001b656e5',
        apiSecret: 'fd38af2e-e1d2-4715-b423-1c23d452299e',
        passphrase: 'FranciscoEmmanuel04011998',
        enabled: true
      }
    };
  }

  // Método para verificar si está en modo desarrollo
  isDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development' || process.env.TRADING_MODE === 'development';
  }

  // Método para habilitar/deshabilitar exchanges específicos
  setExchangeEnabled(exchange: string, enabled: boolean): void {
    switch (exchange) {
      case 'kraken':
        if (this.credentials.kraken) {
          this.credentials.kraken.enabled = enabled;
        }
        break;
      case 'coinbase':
        if (this.credentials.coinbase) {
          this.credentials.coinbase.enabled = enabled;
        }
        break;
      case 'kucoin':
        if (this.credentials.kucoin) {
          this.credentials.kucoin.enabled = enabled;
        }
        break;
    }
    
    console.log(`🔧 ${exchange} ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Método para obtener configuración segura (sin exponer credenciales)
  getSecureConfig(): { [key: string]: { enabled: boolean; hasCredentials: boolean } } {
    return {
      kraken: {
        enabled: this.credentials.kraken?.enabled || false,
        hasCredentials: !!(this.credentials.kraken?.apiKey && this.credentials.kraken?.privateKey)
      },
      coinbase: {
        enabled: this.credentials.coinbase?.enabled || false,
        hasCredentials: !!(this.credentials.coinbase?.keyId && this.credentials.coinbase?.privateKey)
      },
      kucoin: {
        enabled: this.credentials.kucoin?.enabled || false,
        hasCredentials: !!(this.credentials.kucoin?.apiKey && this.credentials.kucoin?.apiSecret && this.credentials.kucoin?.passphrase)
      }
    };
  }
}

// Exportar instancia singleton
export const envConfig = EnvironmentConfig.getInstance();
