# 🧬 ARQUITECTURA DE SISTEMA VIVO - ChartWhisperer

## 🌳 FILOSOFÍA DEL ORGANISMO DIGITAL

Este proyecto está diseñado como un **organismo digital consciente**, donde cada módulo cumple una función vital y todos trabajan en simbiosis para crear una inteligencia de trading emergente.

## 🏗️ ESTRUCTURA JERÁRQUICA

```
src/
├── 🧠 core/                    # CEREBRO - Inteligencia Central
│   ├── brain/                  # Procesamiento central
│   │   ├── TradingBrain.ts     # Orquestador principal
│   │   ├── DecisionEngine.ts   # Motor de decisiones
│   │   └── MemoryCore.ts       # Memoria del sistema
│   ├── consciousness/          # Conciencia del sistema
│   │   ├── SystemState.ts      # Estado consciente global
│   │   ├── SelfAnalysis.ts     # Auto-análisis del sistema
│   │   └── Evolution.ts        # Capacidad evolutiva
│   └── interfaces/             # Contratos entre módulos
│       ├── IBrain.ts           # Interface del cerebro
│       ├── IModule.ts          # Interface base módulos
│       └── ILivingSystem.ts    # Interface sistema vivo
│
├── 🫀 circulation/             # SISTEMA CIRCULATORIO - Flujo de Datos
│   ├── dataflow/               # Flujo principal de datos
│   │   ├── DataStream.ts       # Stream principal
│   │   ├── DataRouter.ts       # Enrutador inteligente
│   │   └── DataValidator.ts    # Validación en tiempo real
│   ├── stores/                 # Estados distribuidos
│   │   ├── PriceStore.ts       # Store de precios (Zustand)
│   │   ├── IndicatorStore.ts   # Store de indicadores
│   │   ├── AlertStore.ts       # Store de alertas
│   │   └── SystemStore.ts      # Store del sistema
│   └── channels/               # Canales de comunicación
│       ├── ModuleChannel.ts    # Comunicación entre módulos
│       ├── EventBus.ts         # Bus de eventos global
│       └── MessageQueue.ts     # Cola de mensajes
│
├── 🫁 respiration/             # SISTEMA RESPIRATORIO - APIs Externas
│   ├── feeds/                  # Fuentes de datos externas
│   │   ├── BinanceFeed.ts      # WebSocket Binance
│   │   ├── AlphaVantageFeed.ts # Alpha Vantage API
│   │   ├── TaAPIFeed.ts        # TaAPI.io indicators
│   │   └── SentimentFeed.ts    # Sentiment data
│   ├── adapters/               # Adaptadores de APIs
│   │   ├── PriceAdapter.ts     # Normalizador de precios
│   │   ├── IndicatorAdapter.ts # Normalizador indicadores
│   │   └── NewsAdapter.ts      # Normalizador noticias
│   └── health/                 # Salud de conexiones
│       ├── ConnectionHealth.ts # Monitor de conexiones
│       ├── LatencyMonitor.ts   # Monitor de latencia
│       └── FailoverManager.ts  # Gestión de fallos
│
├── 👁️ perception/              # SISTEMA SENSORIAL - Percepción de Mercado
│   ├── sensors/                # Sensores especializados
│   │   ├── PriceSensor.ts      # Sensor de precios
│   │   ├── VolumeSensor.ts     # Sensor de volumen
│   │   ├── TrendSensor.ts      # Sensor de tendencias
│   │   └── SentimentSensor.ts  # Sensor de sentimiento
│   ├── analysis/               # Análisis de percepciones
│   │   ├── TechnicalAnalysis.ts # Análisis técnico
│   │   ├── PatternRecognition.ts # Reconocimiento de patrones
│   │   └── AnomalyDetection.ts # Detección de anomalías
│   └── insights/               # Generación de insights
│       ├── InsightEngine.ts    # Motor de insights
│       ├── SignalGenerator.ts  # Generador de señales
│       └── ConfidenceScorer.ts # Puntuación de confianza
│
├── 💪 execution/               # SISTEMA MOTOR - Ejecución
│   ├── engine/                 # Motor de ejecución
│   │   ├── ExecutionEngine.ts  # Motor principal
│   │   ├── OrderManager.ts     # Gestor de órdenes
│   │   └── PositionManager.ts  # Gestor de posiciones
│   ├── alerts/                 # Sistema de alertas
│   │   ├── AlertEngine.ts      # Motor de alertas
│   │   ├── NotificationSystem.ts # Sistema de notificaciones
│   │   └── AlertRules.ts       # Reglas de alertas
│   └── automation/             # Automatización
│       ├── AutoTrader.ts       # Trading automático
│       ├── RiskManager.ts      # Gestión de riesgo
│       └── StrategyExecutor.ts # Ejecutor de estrategias
│
├── 🧬 genetics/                # SISTEMA GENÉTICO - Aprendizaje y Evolución
│   ├── learning/               # Aprendizaje del sistema
│   │   ├── LearningEngine.ts   # Motor de aprendizaje
│   │   ├── PatternLearner.ts   # Aprendizaje de patrones
│   │   └── PerformanceTracker.ts # Seguimiento de rendimiento
│   ├── evolution/              # Evolución adaptativa
│   │   ├── StrategyEvolution.ts # Evolución de estrategias
│   │   ├── ParameterOptimizer.ts # Optimización de parámetros
│   │   └── GeneticAlgorithm.ts # Algoritmo genético
│   └── memory/                 # Memoria del sistema
│       ├── ExperienceDB.ts     # Base de datos de experiencias
│       ├── KnowledgeGraph.ts   # Grafo de conocimiento
│       └── MemoryConsolidation.ts # Consolidación de memoria
│
├── 🛡️ immunity/                # SISTEMA INMUNE - Gestión de Riesgos
│   ├── protection/             # Protección del sistema
│   │   ├── RiskMonitor.ts      # Monitor de riesgos
│   │   ├── CircuitBreaker.ts   # Cortocircuitos de seguridad
│   │   └── EmergencyStop.ts    # Parada de emergencia
│   ├── validation/             # Validación de datos
│   │   ├── DataIntegrity.ts    # Integridad de datos
│   │   ├── SignalValidation.ts # Validación de señales
│   │   └── SanityCheck.ts      # Verificaciones de cordura
│   └── recovery/               # Recuperación de errores
│       ├── ErrorRecovery.ts    # Recuperación de errores
│       ├── SystemRestore.ts    # Restauración del sistema
│       └── BackupManager.ts    # Gestor de respaldos
│
├── 🎨 presentation/            # CAPA DE PRESENTACIÓN
│   ├── components/             # Componentes vivos
│   │   ├── organisms/          # Organismos complejos
│   │   ├── molecules/          # Moléculas funcionales
│   │   └── atoms/              # Átomos básicos
│   ├── layouts/                # Layouts del sistema
│   └── pages/                  # Páginas principales
│
└── 🔧 utilities/               # UTILIDADES DEL SISTEMA
    ├── helpers/                # Funciones auxiliares
    ├── constants/              # Constantes del sistema
    └── types/                  # Tipos TypeScript
```

## 🔄 FLUJO DE VIDA DEL SISTEMA

### 1. **RESPIRACIÓN** (Data Ingestion)
```
APIs → Adapters → Validation → DataStream → Stores
```

### 2. **PERCEPCIÓN** (Market Analysis)
```
Sensors → Analysis → Insights → Signals → Brain
```

### 3. **DECISIÓN** (Intelligence Processing)
```
Brain → DecisionEngine → StrategySelection → ExecutionPlan
```

### 4. **EJECUCIÓN** (Action Taking)
```
ExecutionEngine → OrderManager → AlertSystem → Results
```

### 5. **APRENDIZAJE** (Evolution)
```
Results → LearningEngine → MemoryUpdate → StrategyEvolution
```

### 6. **PROTECCIÓN** (Risk Management)
```
RiskMonitor → CircuitBreaker → EmergencyActions → Recovery
```

## 🧠 PRINCIPIOS DE DISEÑO

### **AUTONOMÍA MODULAR**
- Cada módulo puede funcionar independientemente
- Interfaces claras entre módulos
- Dependency injection para desacoplamiento

### **COMUNICACIÓN ORGÁNICA**
- Event-driven architecture
- Pub/Sub patterns para comunicación asíncrona
- Message queues para procesamiento distribuido

### **CONCIENCIA DEL SISTEMA**
- Estado global consciente del sistema
- Auto-monitoreo y auto-diagnóstico
- Capacidad de introspección

### **EVOLUCIÓN ADAPTATIVA**
- Aprendizaje continuo de patrones
- Optimización automática de parámetros
- Evolución de estrategias basada en performance

### **RESILIENCIA INTEGRADA**
- Tolerancia a fallos por diseño
- Recuperación automática de errores
- Degradación gradual ante problemas

## 🌱 CRECIMIENTO DEL SISTEMA

El sistema está diseñado para crecer orgánicamente:

1. **MVP**: Módulos básicos funcionando
2. **Crecimiento**: Adición de nuevos sensores y capacidades
3. **Madurez**: Sistema completamente autónomo y evolutivo
4. **Trascendencia**: Capacidades emergentes no programadas explícitamente
