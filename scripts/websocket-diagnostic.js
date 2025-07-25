// 🧪 Script de diagnóstico para conexiones WebSocket
// Ejecutar en la consola del navegador para diagnosticar problemas de CORS

console.log('🔍 DIAGNÓSTICO DE CONEXIONES WEBSOCKET');
console.log('=====================================');

// Prueba Binance
console.log('\n📊 Probando Binance WebSocket...');
try {
  const binanceWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
  binanceWs.onopen = () => console.log('✅ Binance: Conexión exitosa');
  binanceWs.onerror = (error) => console.log('❌ Binance: Error', error);
  binanceWs.onclose = () => console.log('🔌 Binance: Conexión cerrada');
} catch (error) {
  console.log('❌ Binance: Error de conexión', error);
}

// Prueba Coinbase
console.log('\n🟦 Probando Coinbase WebSocket...');
try {
  const coinbaseWs = new WebSocket('wss://ws-feed.exchange.coinbase.com');
  coinbaseWs.onopen = () => {
    console.log('✅ Coinbase: Conexión exitosa');
    coinbaseWs.send(JSON.stringify({
      type: 'subscribe',
      channels: ['ticker'],
      product_ids: ['BTC-USD']
    }));
  };
  coinbaseWs.onerror = (error) => console.log('❌ Coinbase: Error', error);
  coinbaseWs.onclose = () => console.log('🔌 Coinbase: Conexión cerrada');
} catch (error) {
  console.log('❌ Coinbase: Error de conexión', error);
}

// Prueba KuCoin
console.log('\n🟢 Probando KuCoin WebSocket...');
try {
  // Primero intentar obtener el endpoint
  fetch('https://api.kucoin.com/api/v1/bullet-public')
    .then(response => response.json())
    .then(data => {
      console.log('✅ KuCoin: Endpoint obtenido', data);
      if (data.data && data.data.instanceServers[0]) {
        const wsUrl = `${data.data.instanceServers[0].endpoint}?token=${data.data.token}`;
        const kuCoinWs = new WebSocket(wsUrl);
        kuCoinWs.onopen = () => console.log('✅ KuCoin: WebSocket conectado');
        kuCoinWs.onerror = (error) => console.log('❌ KuCoin: WebSocket error', error);
        kuCoinWs.onclose = () => console.log('🔌 KuCoin: WebSocket cerrado');
      }
    })
    .catch(error => console.log('❌ KuCoin: Error obteniendo endpoint', error));
} catch (error) {
  console.log('❌ KuCoin: Error general', error);
}

// Información del navegador
console.log('\n🌐 INFO DEL NAVEGADOR:');
console.log('User Agent:', navigator.userAgent);
console.log('WebSocket disponible:', typeof WebSocket !== 'undefined');
console.log('Fetch disponible:', typeof fetch !== 'undefined');

console.log('\n🔧 NEXT STEPS:');
console.log('1. Revisar las conexiones exitosas vs fallidas');
console.log('2. Verificar errores de CORS en Network tab');
console.log('3. Considerar proxy para exchanges con CORS restrictivo');
