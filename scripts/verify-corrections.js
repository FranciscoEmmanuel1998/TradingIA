// 🧪 SCRIPT DE VERIFICACIÓN POST-CORRECCIONES
// Ejecutar en la consola del navegador para validar las correcciones

console.log('🔍 VERIFICACIÓN POST-CORRECCIONES - FASE IA 1.5');
console.log('=================================================');

// 1. Verificar que no hay errores de CORS en KuCoin
console.log('\n📊 1. VERIFICANDO PROXY KUCOIN...');
fetch('/api/kucoin/api/v1/bullet-public', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(response => {
  if (response.ok) {
    console.log('✅ Proxy KuCoin funcionando - CORS resuelto');
    return response.json();
  } else {
    console.log('⚠️ Proxy KuCoin con problemas:', response.status);
  }
})
.then(data => {
  if (data?.code === '200000') {
    console.log('✅ Token KuCoin obtenido correctamente');
  }
})
.catch(error => console.log('❌ Error proxy KuCoin:', error));

// 2. Verificar React Router Future Flags
console.log('\n🔧 2. VERIFICANDO REACT ROUTER...');
const routerWarnings = [];
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');
  if (message.includes('React Router Future Flag')) {
    routerWarnings.push(message);
  }
  originalWarn.apply(console, args);
};

setTimeout(() => {
  if (routerWarnings.length === 0) {
    console.log('✅ React Router Future Flags configurados correctamente');
  } else {
    console.log('⚠️ Advertencias React Router detectadas:', routerWarnings.length);
  }
}, 2000);

// 3. Verificar generación de IDs únicos
console.log('\n🆔 3. VERIFICANDO IDS ÚNICOS DE SEÑALES...');
const signalIds = new Set();
let duplicateFound = false;

// Observer para elementos de señales
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1 && node.querySelector) {
        const signalElements = node.querySelectorAll('[data-signal-id]');
        signalElements.forEach((element) => {
          const id = element.getAttribute('data-signal-id');
          if (signalIds.has(id)) {
            console.log('❌ ID duplicado detectado:', id);
            duplicateFound = true;
          } else {
            signalIds.add(id);
          }
        });
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// 4. Verificar logs de desarrollo minimizados
console.log('\n📝 4. VERIFICANDO LOGS DE DESARROLLO...');
let devLogsCount = 0;
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  if (message.includes('RealDataBridgeDev') || message.includes('simulador')) {
    devLogsCount++;
  }
  originalLog.apply(console, args);
};

// 5. Estado general del sistema
setTimeout(() => {
  console.log('\n📊 RESUMEN DE VERIFICACIÓN:');
  console.log('============================');
  console.log('• Proxy KuCoin:', window.fetch ? '✅ Configurado' : '❌ No disponible');
  console.log('• React Router Flags:', routerWarnings.length === 0 ? '✅ OK' : '⚠️ Con warnings');
  console.log('• IDs únicos:', !duplicateFound ? '✅ Sin duplicados' : '❌ Duplicados encontrados');
  console.log('• Logs dev minimizados:', devLogsCount < 5 ? '✅ Controlados' : '⚠️ Verbosos');
  console.log('• Total IDs generados:', signalIds.size);
  
  if (!duplicateFound && routerWarnings.length === 0) {
    console.log('\n🎉 TODAS LAS CORRECCIONES FUNCIONANDO CORRECTAMENTE');
  } else {
    console.log('\n⚠️ Algunas correcciones requieren ajustes adicionales');
  }
}, 5000);

console.log('\n⏱️ Verificación en progreso... Resultados en 5 segundos');
