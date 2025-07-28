process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: 'es2022',
  esModuleInterop: true,
  target: 'es2020',
  moduleResolution: 'node'
});
require('ts-node/register');

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const { realWebSocketFeeds } = require('./RealWebSocketFeeds');

// Start real websocket feeds
realWebSocketFeeds.start();

const app = express();
app.use(cors());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

realWebSocketFeeds.onTick((tick) => {
  io.emit('tick', tick);
});

io.on('connection', (socket) => {
  console.log(`🟢 Cliente conectado: ${socket.id}`);
  socket.emit('connected', { message: 'Conexión establecida con el servicio realtime' });
  socket.on('disconnect', () => {
    console.log(`🔴 Cliente desconectado: ${socket.id}`);
  });
});

app.get('/stats', (req, res) => {
  const stats = realWebSocketFeeds.getConnectionStats();
  const lastTicks = realWebSocketFeeds.getLastTicks(10);
  res.json({ stats, lastTicks });
});

const PORT = process.env.REALTIME_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servicio realtime escuchando en el puerto ${PORT}`);
});
