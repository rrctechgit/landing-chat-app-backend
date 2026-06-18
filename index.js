require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const setupWebSocket = require('./src/websocket');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
setupWebSocket(server, app);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket  on ws://localhost:${PORT}/ws`);
});
