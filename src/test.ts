// 🎮 SCRIPT DE PRUEBA - Test del Sistema Completo
import { ChartWhispererSystem, quickStart, devStart } from './index';

async function runSystemTests() {
  console.log('🧪 Iniciando pruebas del sistema Chart Whisperer...\n');

  try {
    // Test 1: Inicialización básica
    console.log('🔬 Test 1: Inicialización del sistema');
    const system = new ChartWhispererSystem();
    await system.initialize();
    console.log('✅ Sistema inicializado correctamente\n');

    // Test 2: Verificar estado del sistema
    console.log('🔬 Test 2: Verificación de estado');
    const status = system.getSystemStatus();
    console.log('📊 Estado del sistema:', status);
    console.log('✅ Estado verificado\n');

    // Test 3: Iniciar sistema
    console.log('🔬 Test 3: Inicio del sistema');
    await system.start();
    console.log('✅ Sistema iniciado correctamente\n');

    // Test 4: Verificar componentes
    console.log('🔬 Test 4: Verificación de componentes');
    const consciousness = system.getConsciousness();
    const liberation = system.getLiberationProtocol();
    const exchanges = system.getExchangeManager();
    const brain = system.getTradingBrain();

    console.log(`🧠 Consciousness: ${consciousness ? 'OK' : 'FAIL'}`);
    console.log(`🚀 Liberation: ${liberation ? 'OK' : 'FAIL'}`);
    console.log(`🌐 Exchanges: ${exchanges ? 'OK' : 'FAIL'}`);
    console.log(`⚡ Brain: ${brain ? 'OK' : 'FAIL'}`);
    console.log('✅ Componentes verificados\n');

    // Test 5: Dejar ejecutarse por 10 segundos
    console.log('🔬 Test 5: Ejecución durante 10 segundos...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log('✅ Ejecución completada\n');

    // Test 6: Detener sistema
    console.log('🔬 Test 6: Detención del sistema');
    await system.stop();
    console.log('✅ Sistema detenido correctamente\n');

    console.log('🎉 ¡Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    process.exit(1);
  }
}

async function runQuickStartTest() {
  console.log('🚀 Test de inicio rápido...\n');

  try {
    const system = await quickStart();
    console.log('✅ Quick start exitoso');
    
    // Ejecutar por 5 segundos
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await system.stop();
    console.log('✅ Quick start test completado\n');

  } catch (error) {
    console.error('❌ Error en quick start test:', error);
  }
}

async function runDevStartTest() {
  console.log('🧪 Test de inicio en modo desarrollo...\n');

  try {
    const system = await devStart();
    console.log('✅ Dev start exitoso');
    
    // Ejecutar por 5 segundos
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await system.stop();
    console.log('✅ Dev start test completado\n');

  } catch (error) {
    console.error('❌ Error en dev start test:', error);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'full';

  console.log(`
🌌 Chart Whisperer - Test Suite
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ejecutando: ${testType}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  switch (testType) {
    case 'full':
      await runSystemTests();
      break;
    case 'quick':
      await runQuickStartTest();
      break;
    case 'dev':
      await runDevStartTest();
      break;
    case 'all':
      await runQuickStartTest();
      await runDevStartTest();
      await runSystemTests();
      break;
    default:
      console.log('Tipos de test disponibles:');
      console.log('  npm run test:full   - Test completo del sistema');
      console.log('  npm run test:quick  - Test de inicio rápido');
      console.log('  npm run test:dev    - Test en modo desarrollo');
      console.log('  npm run test:all    - Todos los tests');
      break;
  }

  process.exit(0);
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Error ejecutando tests:', error);
    process.exit(1);
  });
}

export { runSystemTests, runQuickStartTest, runDevStartTest };
