require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const http = require('http');
const initializeSocket = require('./src/socket/socketHandler');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = http.createServer(app);
  initializeSocket(server);
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  });
}).catch(err => {
  console.error('❌ Failed to connect to database:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});