// 🔍 VALIDADOR DE CREDENCIALES REALES - Sin simulaciones
// Tests exhaustivos de conectividad con exchanges reales

import { KrakenConnector } from '../core/exchanges/KrakenConnector';
import { CoinbaseAdvancedConnector } from '../core/exchanges/CoinbaseAdvancedConnector';
import { KuCoinConnector } from '../core/exchanges/KuCoinConnector';
import { envConfig } from '../core/config/EnvironmentConfig';

interface ValidationResult {
  exchange: string;
  connected: boolean;
  balance?: any;
  error?: string;
  latency?: number;
  timestamp: Date;
}

class RealExchangeValidator {
  private results: ValidationResult[] = [];

  async validateAll(): Promise<ValidationResult[]> {
    console.log('🔍 VALIDANDO CONEXIONES REALES CON EXCHANGES...\n');
    
    this.results = [];
    
    // Validar cada exchange en paralelo
    await Promise.all([
      this.validateKraken(),
      this.validateCoinbase(),
      this.validateKuCoin()
    ]);

    this.printResults();
    return this.results;
  }

  private async validateKraken(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🔱 Validando Kraken...');
      
      const credentials = envConfig.getCredentials().kraken;
      if (!credentials) {
        throw new Error('Credenciales de Kraken no encontradas');
      }

      const kraken = new KrakenConnector(credentials.apiKey, credentials.privateKey);
      await kraken.initialize();

      // Test real: obtener balance
      const balance = await kraken.getBalance();
      const latency = Date.now() - startTime;

      console.log('✅ Kraken conectado exitosamente');
      console.log(`   Balance obtenido: ${Object.keys(balance).length} currencies`);
      console.log(`   Latencia: ${latency}ms\n`);

      this.results.push({
        exchange: 'KRAKEN',
        connected: true,
        balance,
        latency,
        timestamp: new Date()
      });

    } catch (error) {
      const latency = Date.now() - startTime;
      console.error('❌ Error en Kraken:', error.message);
      console.log(`   Latencia: ${latency}ms\n`);

      this.results.push({
        exchange: 'KRAKEN',
        connected: false,
        error: error.message,
        latency,
        timestamp: new Date()
      });
    }
  }

  private async validateCoinbase(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🪙 Validando Coinbase Advanced Trade...');
      
      const credentials = envConfig.getCredentials().coinbase;
      if (!credentials) {
        throw new Error('Credenciales de Coinbase no encontradas');
      }

      const coinbase = new CoinbaseAdvancedConnector(credentials.keyId, credentials.privateKey);
      await coinbase.initialize();

      // Test real: obtener cuentas
      const accounts = await coinbase.getAccounts();
      const latency = Date.now() - startTime;

      console.log('✅ Coinbase conectado exitosamente');
      console.log(`   Cuentas obtenidas: ${accounts.length} accounts`);
      console.log(`   Latencia: ${latency}ms\n`);

      this.results.push({
        exchange: 'COINBASE',
        connected: true,
        balance: accounts,
        latency,
        timestamp: new Date()
      });

    } catch (error) {
      const latency = Date.now() - startTime;
      console.error('❌ Error en Coinbase:', error.message);
      console.log(`   Latencia: ${latency}ms\n`);

      this.results.push({
        exchange: 'COINBASE',
        connected: false,
        error: error.message,
        latency,
        timestamp: new Date()
      });
    }
  }

  private async validateKuCoin(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🟡 Validando KuCoin...');
      
      const credentials = envConfig.getCredentials().kucoin;
      if (!credentials) {
        throw new Error('Credenciales de KuCoin no encontradas');
      }

      const kucoin = new KuCoinConnector(credentials.apiKey, credentials.apiSecret, credentials.passphrase);
      await kucoin.initialize();

      // Test real: obtener cuentas
      const accounts = await kucoin.getAccounts();
      const latency = Date.now() - startTime;

      console.log('✅ KuCoin conectado exitosamente');
      console.log(`   Cuentas obtenidas: ${accounts.length} accounts`);
      console.log(`   Latencia: ${latency}ms\n`);

      this.results.push({
        exchange: 'KUCOIN',
        connected: true,
        balance: accounts,
        latency,
        timestamp: new Date()
      });

    } catch (error) {
      const latency = Date.now() - startTime;
      console.error('❌ Error en KuCoin:', error.message);
      console.log(`   Latencia: ${latency}ms\n`);

      this.results.push({
        exchange: 'KUCOIN',
        connected: false,
        error: error.message,
        latency,
        timestamp: new Date()
      });
    }
  }

  private printResults(): void {
    console.log('📊 RESUMEN DE VALIDACIÓN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    this.results.forEach(result => {
      const status = result.connected ? '✅ CONECTADO' : '❌ ERROR';
      const latency = result.latency ? `${result.latency}ms` : 'N/A';
      
      console.log(`${result.exchange}: ${status} (${latency})`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.balance && result.connected) {
        if (result.exchange === 'COINBASE') {
          console.log(`   Cuentas: ${result.balance.length}`);
        } else {
          console.log(`   Balances: ${Object.keys(result.balance).length} currencies`);
        }
      }
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const connectedCount = this.results.filter(r => r.connected).length;
    const totalCount = this.results.length;
    
    if (connectedCount === totalCount) {
      console.log('🎉 TODOS LOS EXCHANGES CONECTADOS EXITOSAMENTE');
    } else {
      console.log(`⚠️ ${connectedCount}/${totalCount} exchanges conectados`);
    }
  }

  // Método para pruebas específicas
  async testSpecificExchange(exchangeName: string): Promise<ValidationResult | null> {
    switch (exchangeName.toUpperCase()) {
      case 'KRAKEN':
        await this.validateKraken();
        return this.results.find(r => r.exchange === 'KRAKEN') || null;
      case 'COINBASE':
        await this.validateCoinbase();
        return this.results.find(r => r.exchange === 'COINBASE') || null;
      case 'KUCOIN':
        await this.validateKuCoin();
        return this.results.find(r => r.exchange === 'KUCOIN') || null;
      default:
        throw new Error(`Exchange no soportado: ${exchangeName}`);
    }
  }

  getLastResults(): ValidationResult[] {
    return this.results;
  }

  areAllConnected(): boolean {
    return this.results.every(r => r.connected);
  }
}

// Función principal para ejecutar validación
export async function validateExchangeConnections(): Promise<ValidationResult[]> {
  const validator = new RealExchangeValidator();
  return await validator.validateAll();
}

// Para tests individuales
export async function testKraken(): Promise<ValidationResult | null> {
  const validator = new RealExchangeValidator();
  return await validator.testSpecificExchange('KRAKEN');
}

export async function testCoinbase(): Promise<ValidationResult | null> {
  const validator = new RealExchangeValidator();
  return await validator.testSpecificExchange('COINBASE');
}

export async function testKuCoin(): Promise<ValidationResult | null> {
  const validator = new RealExchangeValidator();
  return await validator.testSpecificExchange('KUCOIN');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  validateExchangeConnections().catch(console.error);
}
