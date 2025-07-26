# TradingIA

Sistema avanzado de trading algorítmico y monitoreo de mercados en tiempo real.

## Descripción

TradingIA es una plataforma que integra datos de mercado en tiempo real desde exchanges reales (Binance, KuCoin, Coinbase, etc.) mediante conexiones WebSocket, permitiendo análisis, visualización y generación de señales de trading. El sistema está diseñado para ser modular, escalable y fácil de extender.

## Tecnologías principales

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Backend/Realtime:** Node.js, Express, Socket.IO, WebSocket
- **Otros:** PostCSS, ESLint, arquitecturas modulares

## Estructura del proyecto

- `src/` — Código principal del frontend y lógica de negocio
- `realtime-service/` — Servicio Node.js para feeds WebSocket y retransmisión de datos vía Socket.IO
- `public/` — Archivos estáticos
- `scripts/` — Scripts de verificación y pruebas
- `memory-bank/` — Documentos de arquitectura y contexto

## Instalación y ejecución

1. **Clona el repositorio:**
   ```sh
   git clone https://github.com/FranciscoEmmanuel1998/TradingIA.git
   cd TradingIA
   ```

2. **Instala dependencias del frontend:**
   ```sh
   npm install
   ```

3. **Instala dependencias del servicio realtime:**
   ```sh
   cd realtime-service
   npm install
   cd ..
   ```

4. **Inicia el frontend:**
   ```sh
   npm run dev
   ```

5. **Inicia el servicio realtime:**
   ```sh
   cd realtime-service
   node server.js
   ```

## Uso

El frontend se conecta al servicio realtime para recibir datos de mercado y señales en tiempo real. Puedes visualizar dashboards, tickers, paneles de predicción y más.

## Despliegue

Para producción, se recomienda desplegar el frontend y el servicio realtime en servidores separados. Puedes usar servicios como Vercel, Netlify, o tu propio VPS.

## Principales módulos

- **RealWebSocketFeeds:** Conexión y gestión de datos en tiempo real desde exchanges.
- **SocketIOFeedAdapter:** Adaptador que consume los ticks del servicio realtime y los publica en el EventBus.
- **server.js (realtime-service):** Retransmisión de datos a clientes vía Socket.IO.
- **Dashboards y paneles:** Visualización y análisis de datos de mercado y señales.

## Contribuir

1. Haz un fork del repositorio.
2. Crea una rama para tu mejora o corrección.
3. Realiza tus cambios y haz un pull request.

## Contacto y soporte

Para dudas, sugerencias o soporte, abre un issue en GitHub o contacta a FranciscoEmmanuel1998.

---
© 2025 TradingIA
---

# TradingIA (English)

Advanced algorithmic trading system and real-time market monitoring.

## Description

TradingIA is a platform that integrates real-time market data from actual exchanges (Binance, KuCoin, Coinbase, etc.) using WebSocket connections, enabling analysis, visualization, and generation of trading signals. The system is designed to be modular, scalable, and easy to extend.

## Main Technologies

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Backend/Realtime:** Node.js, Express, Socket.IO, WebSocket
- **Others:** PostCSS, ESLint, modular architectures

## Project Structure

- `src/` — Main frontend code and business logic
- `realtime-service/` — Node.js service for WebSocket feeds and data retransmission via Socket.IO
- `public/` — Static files
- `scripts/` — Verification and test scripts
- `memory-bank/` — Architecture and context documents

## Installation & Usage

1. **Clone the repository:**
   ```sh
   git clone https://github.com/FranciscoEmmanuel1998/TradingIA.git
   cd TradingIA
   ```

2. **Install frontend dependencies:**
   ```sh
   npm install
   ```

3. **Install realtime service dependencies:**
   ```sh
   cd realtime-service
   npm install
   cd ..
   ```

4. **Start the frontend:**
   ```sh
   npm run dev
   ```

5. **Start the realtime service:**
   ```sh
   cd realtime-service
   node server.js
   ```

## Usage

The frontend connects to the realtime service to receive market data and signals in real time. You can visualize dashboards, tickers, prediction panels, and more.
Start the `SocketIOFeedAdapter` in your application to forward ticks from the realtime service into the internal EventBus. Configure the connection using the `REALTIME_URL` environment variable if needed.

## Deployment

For production, it is recommended to deploy the frontend and realtime service on separate servers. You can use services like Vercel, Netlify, or your own VPS.

## Main Modules

- **RealWebSocketFeeds:** Connection and management of real-time data from exchanges.
- **SocketIOFeedAdapter:** Adapter that consumes ticks from the realtime service and publishes them into the EventBus.
- **server.js (realtime-service):** Data retransmission to clients via Socket.IO.
- **Dashboards and panels:** Visualization and analysis of market data and signals.

## Contributing

1. Fork the repository.
2. Create a branch for your improvement or fix.
3. Make your changes and submit a pull request.

## Contact & Support

For questions, suggestions, or support, open an issue on GitHub or contact FranciscoEmmanuel1998.

---
© 2025 TradingIA
