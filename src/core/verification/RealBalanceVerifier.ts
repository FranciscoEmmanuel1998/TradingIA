// 💰 REAL BALANCE VERIFICATION - Verificación de Saldos Reales
// Sistema que verifica saldos REALES de exchanges (no simulados)

import { KrakenConnector } from '../exchanges/KrakenConnector';
import { CoinbaseAdvancedConnector } from '../exchanges/CoinbaseAdvancedConnector';
import { KuCoinConnector } from '../exchanges/KuCoinConnector';

export interface RealBalance {
  exchange: string;
  asset: string;
  available: number;
  locked: number;
  total: number;
  lastUpdate: Date;
  verified: boolean;
}

export interface BalanceVerificationResult {
  success: boolean;
  totalExchanges: number;
  verifiedExchanges: number;
  balances: RealBalance[];
  errors: string[];
}

export class RealBalanceVerifier {
  private static instance: RealBalanceVerifier;
  private lastVerification: Date | null = null;
  private cachedBalances: RealBalance[] = [];
  
  // Instances de conectores (se inicializan bajo demanda)
  private krakenConnector: KrakenConnector | null = null;
  private coinbaseConnector: CoinbaseAdvancedConnector | null = null;
  private kuCoinConnector: KuCoinConnector | null = null;

  private constructor() {}

  static getInstance(): RealBalanceVerifier {
    if (!RealBalanceVerifier.instance) {
      RealBalanceVerifier.instance = new RealBalanceVerifier();
    }
    return RealBalanceVerifier.instance;
  }

  // 🔧 Inicializar conectores con credenciales
  initializeConnectors(credentials: {
    kraken?: { apiKey: string; privateKey: string };
    coinbase?: { apiKey: string; passphrase: string; privateKey: string };
    kucoin?: { apiKey: string; secretKey: string; passphrase: string };
  }): void {
    
    if (credentials.kraken) {
      this.krakenConnector = new KrakenConnector(
        credentials.kraken.apiKey,
        credentials.kraken.privateKey
      );
    }

    if (credentials.coinbase) {
      this.coinbaseConnector = new CoinbaseAdvancedConnector(
        credentials.coinbase.apiKey,
        credentials.coinbase.privateKey
      );
    }

    if (credentials.kucoin) {
      this.kuCoinConnector = new KuCoinConnector(
        credentials.kucoin.apiKey,
        credentials.kucoin.secretKey,
        credentials.kucoin.passphrase
      );
    }

    console.log('🔧 RealBalanceVerifier: Conectores inicializados');
  }

  // 🔍 Verificar TODOS los saldos reales
  async verifyAllRealBalances(): Promise<BalanceVerificationResult> {
    console.log('💰 Iniciando verificación de saldos REALES...');

    const result: BalanceVerificationResult = {
      success: false,
      totalExchanges: 3,
      verifiedExchanges: 0,
      balances: [],
      errors: []
    };

    // Verificar Kraken
    try {
      const krakenBalances = await this.verifyKrakenBalance();
      result.balances.push(...krakenBalances);
      result.verifiedExchanges++;
      console.log('✅ Kraken: Saldos reales verificados');
    } catch (error) {
      result.errors.push(`Kraken: ${error.message}`);
      console.error('❌ Kraken: Error verificando saldos reales:', error.message);
    }

    // Verificar Coinbase
    try {
      const coinbaseBalances = await this.verifyCoinbaseBalance();
      result.balances.push(...coinbaseBalances);
      result.verifiedExchanges++;
      console.log('✅ Coinbase: Saldos reales verificados');
    } catch (error) {
      result.errors.push(`Coinbase: ${error.message}`);
      console.error('❌ Coinbase: Error verificando saldos reales:', error.message);
    }

    // Verificar KuCoin
    try {
      const kucoinBalances = await this.verifyKuCoinBalance();
      result.balances.push(...kucoinBalances);
      result.verifiedExchanges++;
      console.log('✅ KuCoin: Saldos reales verificados');
    } catch (error) {
      result.errors.push(`KuCoin: ${error.message}`);
      console.error('❌ KuCoin: Error verificando saldos reales:', error.message);
    }

    // Evaluar resultado
    result.success = result.verifiedExchanges > 0;
    this.lastVerification = new Date();
    this.cachedBalances = result.balances;

    console.log(`💰 Verificación completada: ${result.verifiedExchanges}/${result.totalExchanges} exchanges`);
    
    return result;
  }

  // 🦑 Verificar saldos reales en Kraken
  private async verifyKrakenBalance(): Promise<RealBalance[]> {
    if (!this.krakenConnector || !this.krakenConnector.getConnectionStatus().connected) {
      throw new Error('Kraken no conectado - no se pueden verificar saldos reales');
    }

    try {
      // Realizar llamada REAL a la API de Kraken para obtener balance
      const krakenBalance = await this.krakenConnector.getBalance();
      
      const balances: RealBalance[] = [];

      // Convertir respuesta de Kraken a formato estándar
      for (const [asset, amount] of Object.entries(krakenBalance)) {
        const numericAmount = parseFloat(amount as string);
        
        if (numericAmount > 0) {
          balances.push({
            exchange: 'Kraken',
            asset: asset,
            available: numericAmount,
            locked: 0, // Kraken balance endpoint no distingue locked
            total: numericAmount,
            lastUpdate: new Date(),
            verified: true
          });
        }
      }

      return balances;

    } catch (error) {
      throw new Error(`Error verificando balance real de Kraken: ${error.message}`);
    }
  }

  // 🔵 Verificar saldos reales en Coinbase
  private async verifyCoinbaseBalance(): Promise<RealBalance[]> {
    if (!this.coinbaseConnector || !this.coinbaseConnector.getConnectionStatus().connected) {
      throw new Error('Coinbase no conectado - no se pueden verificar saldos reales');
    }

    try {
      // Realizar llamada REAL a la API de Coinbase Advanced
      const accounts = await this.coinbaseConnector.getAccounts();
      
      const balances: RealBalance[] = [];

      for (const account of accounts) {
        const available = parseFloat(account.available_balance?.value || '0');
        const locked = 0; // Coinbase Advanced API no expone holds en accounts endpoint
        
        if (available > 0) {
          balances.push({
            exchange: 'Coinbase',
            asset: account.currency,
            available: available,
            locked: locked,
            total: available + locked,
            lastUpdate: new Date(),
            verified: true
          });
        }
      }

      return balances;

    } catch (error) {
      throw new Error(`Error verificando balance real de Coinbase: ${error.message}`);
    }
  }

  // 🟡 Verificar saldos reales en KuCoin
  private async verifyKuCoinBalance(): Promise<RealBalance[]> {
    if (!this.kuCoinConnector || !this.kuCoinConnector.getConnectionStatus().connected) {
      throw new Error('KuCoin no conectado - no se pueden verificar saldos reales');
    }

    try {
      // Realizar llamada REAL a la API de KuCoin
      const accounts = await this.kuCoinConnector.getAccounts();
      
      const balances: RealBalance[] = [];

      for (const account of accounts) {
        const available = parseFloat(account.available || '0');
        const locked = parseFloat(account.holds || '0');
        
        if (available > 0 || locked > 0) {
          balances.push({
            exchange: 'KuCoin',
            asset: account.currency,
            available: available,
            locked: locked,
            total: available + locked,
            lastUpdate: new Date(),
            verified: true
          });
        }
      }

      return balances;

    } catch (error) {
      throw new Error(`Error verificando balance real de KuCoin: ${error.message}`);
    }
  }

  // 📊 Obtener resumen de saldos
  getBalanceSummary(): { 
    totalAssets: number; 
    totalValue: number; 
    exchanges: string[]; 
    lastUpdate: Date | null 
  } {
    const exchanges = [...new Set(this.cachedBalances.map(b => b.exchange))];
    const totalAssets = this.cachedBalances.length;
    // Para valor total necesitaríamos precios actuales, por ahora solo contamos activos
    
    return {
      totalAssets,
      totalValue: 0, // TODO: Calcular con precios reales
      exchanges,
      lastUpdate: this.lastVerification
    };
  }

  // 🔍 Verificar si hay fondos suficientes para trading
  hasMinimumBalance(minValueUSD: number = 10): boolean {
    // TODO: Implementar conversión a USD con precios reales
    // Por ahora, verificamos que hay al menos algunos activos
    return this.cachedBalances.some(balance => balance.available > 0);
  }

  // 📋 Obtener balances verificados
  getVerifiedBalances(): RealBalance[] {
    return this.cachedBalances.filter(balance => balance.verified);
  }

  // ⏰ Necesita nueva verificación?
  needsReverification(maxAgeMinutes: number = 5): boolean {
    if (!this.lastVerification) return true;
    
    const now = new Date();
    const ageMinutes = (now.getTime() - this.lastVerification.getTime()) / (1000 * 60);
    
    return ageMinutes > maxAgeMinutes;
  }
}

// Instancia global del verificador
export const realBalanceVerifier = RealBalanceVerifier.getInstance();

// Función de utilidad para verificación rápida
export async function quickBalanceCheck(): Promise<boolean> {
  try {
    const result = await realBalanceVerifier.verifyAllRealBalances();
    return result.success && result.verifiedExchanges > 0;
  } catch (error) {
    console.error('❌ Error en verificación rápida de balance:', error.message);
    return false;
  }
}
