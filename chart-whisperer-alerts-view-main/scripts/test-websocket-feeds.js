#!/usr/bin/env node
// 🌐 WEBSOCKET FEEDS TEST - Test de feeds en tiempo real
// Probando conexiones WebSocket públicas (sin autenticación)

import { config } from 'dotenv';
import WebSocket from 'ws';

// Cargar variables de entorno
config({ path: '.env.local' });

console.log('🌐 TESTING WEBSOCKET FEEDS - Datos en tiempo real...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const TIMEOUT_MS = 15000; // 15 segundos

async function testBinanceWebSocket() {
  console.log('\n🟨 Testing Binance WebSocket (público)...');
  
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
      
      let received = false;
      
      const timeout = setTimeout(() => {
        if (!received) {
          ws.close();
          console.log('❌ Binance: Timeout - Sin datos en 15s');
          resolve(false);
        }
      }, TIMEOUT_MS);

      ws.onopen = () => {
        console.log('   🔗 WebSocket conectado a Binance');
      };

      ws.onmessage = (event) => {
        if (!received) {
          received = true;
          clearTimeout(timeout);
          
          const data = JSON.parse(event.data);
          console.log('✅ Binance: DATOS REALES recibidos');
          console.log(`   Symbol: ${data.s}, Price: $${parseFloat(data.c).toLocaleString()}`);
          console.log(`   24h Change: ${data.P}%`);
          
          ws.close();
          resolve(true);
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.log('❌ Binance: Error WebSocket -', error.message);
        resolve(false);
      };

    } catch (error) {
      console.log('❌ Binance: Error -', error.message);
      resolve(false);
    }
  });
}

async function testKuCoinWebSocket() {
  console.log('\n🟡 Testing KuCoin WebSocket (público)...');
  
  return new Promise((resolve) => {
    try {
      // KuCoin usa REST API para datos públicos
      fetch('https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT')
        .then(response => response.json())
        .then(data => {
          if (data.code === '200000' && data.data) {
            console.log('✅ KuCoin: DATOS REALES recibidos (REST)');
            console.log(`   Symbol: BTC-USDT, Price: $${parseFloat(data.data.price).toLocaleString()}`);
            console.log(`   Size: ${data.data.size}`);
            resolve(true);
          } else {
            console.log('❌ KuCoin: Error en respuesta');
            resolve(false);
          }
        })
        .catch(error => {
          console.log('❌ KuCoin: Error -', error.message);
          resolve(false);
        });

    } catch (error) {
      console.log('❌ KuCoin: Error -', error.message);
      resolve(false);
    }
  });
}

async function testCoinbaseWebSocket() {
  console.log('\n🔵 Testing Coinbase WebSocket (público)...');
  
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');
      
      let received = false;
      
      const timeout = setTimeout(() => {
        if (!received) {
          ws.close();
          console.log('❌ Coinbase: Timeout - Sin datos en 15s');
          resolve(false);
        }
      }, TIMEOUT_MS);

      ws.onopen = () => {
        console.log('   🔗 WebSocket conectado a Coinbase');
        // Suscribirse al ticker de BTC-USD
        ws.send(JSON.stringify({
          type: 'subscribe',
          product_ids: ['BTC-USD'],
          channels: ['ticker']
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'ticker' && !received) {
          received = true;
          clearTimeout(timeout);
          
          console.log('✅ Coinbase: DATOS REALES recibidos');
          console.log(`   Symbol: ${data.product_id}, Price: $${parseFloat(data.price).toLocaleString()}`);
          console.log(`   24h Volume: ${parseFloat(data.volume_24h).toLocaleString()}`);
          
          ws.close();
          resolve(true);
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.log('❌ Coinbase: Error WebSocket -', error.message);
        resolve(false);
      };

    } catch (error) {
      console.log('❌ Coinbase: Error -', error.message);
      resolve(false);
    }
  });
}

// Ejecutar todos los tests
async function runWebSocketTests() {
  const results = {
    binance: false,
    coinbase: false,
    kucoin: false
  };

  // Ejecutar tests en paralelo
  const [binanceResult, coinbaseResult, kucoinResult] = await Promise.allSettled([
    testBinanceWebSocket(),
    testCoinbaseWebSocket(),
    testKuCoinWebSocket()
  ]);

  results.binance = binanceResult.status === 'fulfilled' && binanceResult.value;
  results.coinbase = coinbaseResult.status === 'fulfilled' && coinbaseResult.value;
  results.kucoin = kucoinResult.status === 'fulfilled' && kucoinResult.value;

  // Mostrar resultado final
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏁 RESULTADO WEBSOCKET FEEDS:');
  
  const connected = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`📊 Feeds en tiempo real: ${connected}/${total}`);
  
  if (results.binance) console.log('🟨 Binance: DATOS REALES ✅');
  if (results.coinbase) console.log('🔵 Coinbase: DATOS REALES ✅');  
  if (results.kucoin) console.log('🟡 KuCoin: DATOS REALES ✅');

  if (connected > 0) {
    console.log('🎉 ¡DATOS EN TIEMPO REAL FUNCIONANDO!');
    console.log('📈 El sistema puede recibir precios reales actualizados');
  } else {
    console.log('⚠️  No se pudieron obtener feeds en tiempo real');
  }

  process.exit(connected > 0 ? 0 : 1);
}

runWebSocketTests().catch(error => {
  console.error('💥 Error fatal:', error.message);
  process.exit(1);
});
