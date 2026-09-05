import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { setupSockets } from './sockets/negotiationSocket';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

setupSockets(io);

server.listen(PORT, () => {
  console.log(`🚀 🌱 AgriLink Backend Server running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
});
