#!/usr/bin/env node
// 🚀 QUICK EXCHANGE TEST - Test rápido de conexiones reales
// Sin reintentos infinitos, solo una prueba directa

import { config } from 'dotenv';
import * as sodium from 'libsodium-wrappers-sumo';
import { KrakenConnector } from '../src/core/exchanges/KrakenConnector.ts';
import { CoinbaseAdvancedConnector } from '../src/core/exchanges/CoinbaseAdvancedConnector.ts';
import { KuCoinConnector } from '../src/core/exchanges/KuCoinConnector.ts';

// Cargar variables de entorno desde .env.local
config({ path: '.env.local' });

console.log('🚀 QUICK TEST - Probando conexiones directas...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Configurar timeout global para evitar esperas infinitas
const TIMEOUT_MS = 10000; // 10 segundos máximo

async function quickTestKraken() {
  console.log('\n🔱 Testing Kraken (1 intento, 10s timeout)...');
  
  if (!process.env.KRAKEN_API_KEY || !process.env.KRAKEN_PRIVATE_KEY) {
    console.log('❌ Kraken: Credenciales no configuradas');
    return false;
  }

  try {
    const kraken = new KrakenConnector(
      process.env.KRAKEN_API_KEY,
      process.env.KRAKEN_PRIVATE_KEY
    );

    // Test directo de balance con timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
    );

    const testPromise = kraken.getBalance();
    
    const result = await Promise.race([testPromise, timeoutPromise]);
    
    console.log('✅ Kraken: CONECTADO - Balance obtenido');
    console.log('   Activos:', Object.keys(result).length);
    return true;

  } catch (error) {
    console.log('❌ Kraken: ERROR -', error.message);
    return false;
  }
}

async function quickTestCoinbase() {
  console.log('\n🪙 Testing Coinbase CDP (1 intento, 10s timeout)...');
  
  if (!process.env.CDP_KEY_ID || !process.env.CDP_PRIVATE_KEY) {
    console.log('❌ Coinbase: Credenciales no configuradas');
    return false;
  }

  try {
    const coinbase = new CoinbaseAdvancedConnector(
      process.env.CDP_KEY_ID,
      process.env.CDP_PRIVATE_KEY
    );

    // Inicializar sodium primero
    await sodium.ready;

    // Test directo de cuentas con timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
    );

    const testPromise = coinbase.getAccounts();
    
    const result = await Promise.race([testPromise, timeoutPromise]);
    
    console.log('✅ Coinbase: CONECTADO - Cuentas obtenidas');
    console.log('   Cuentas:', result.length);
    return true;

  } catch (error) {
    console.log('❌ Coinbase: ERROR -', error.message);
    return false;
  }
}

async function quickTestKuCoin() {
  console.log('\n🟡 Testing KuCoin (1 intento, 10s timeout)...');
  
  if (!process.env.KUCOIN_API_KEY || !process.env.KUCOIN_API_SECRET || !process.env.KUCOIN_API_PASSPHRASE) {
    console.log('❌ KuCoin: Credenciales no configuradas');
    return false;
  }

  try {
    const kucoin = new KuCoinConnector(
      process.env.KUCOIN_API_KEY,
      process.env.KUCOIN_API_SECRET,
      process.env.KUCOIN_API_PASSPHRASE
    );

    // Test directo de cuentas con timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
    );

    const testPromise = kucoin.getAccounts();
    
    const result = await Promise.race([testPromise, timeoutPromise]);
    
    console.log('✅ KuCoin: CONECTADO - Cuentas obtenidas');
    console.log('   Cuentas:', result.length);
    return true;

  } catch (error) {
    console.log('❌ KuCoin: ERROR -', error.message);
    return false;
  }
}

// Ejecutar todos los tests
async function runQuickTests() {
  const results = {
    kraken: false,
    coinbase: false,
    kucoin: false
  };

  // Ejecutar todos los tests en paralelo para mayor velocidad
  const [krakenResult, coinbaseResult, kucoinResult] = await Promise.allSettled([
    quickTestKraken(),
    quickTestCoinbase(), 
    quickTestKuCoin()
  ]);

  results.kraken = krakenResult.status === 'fulfilled' && krakenResult.value;
  results.coinbase = coinbaseResult.status === 'fulfilled' && coinbaseResult.value;
  results.kucoin = kucoinResult.status === 'fulfilled' && kucoinResult.value;

  // Mostrar resultado final
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏁 RESULTADO FINAL:');
  
  const connected = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`📊 Exchanges conectados: ${connected}/${total}`);
  
  if (results.kraken) console.log('🔱 Kraken: CONECTADO');
  if (results.coinbase) console.log('🪙 Coinbase: CONECTADO');  
  if (results.kucoin) console.log('🟡 KuCoin: CONECTADO');

  if (connected === total) {
    console.log('🎉 ¡TODOS LOS EXCHANGES CONECTADOS!');
    console.log('exchanges:', Object.keys(results).filter(k => results[k]).map(k => k.toUpperCase()));
  } else {
    console.log('⚠️  Algunos exchanges necesitan configuración');
  }

  process.exit(connected === total ? 0 : 1);
}

runQuickTests().catch(error => {
  console.error('💥 Error fatal:', error.message);
  process.exit(1);
});
