require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const setupSocket = require('./socket/socket');

// Routes
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);

// Validate environment variables
const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];
requiredEnv.forEach(name => {
  if (!process.env[name]) {
    console.error(`❌ CRITICAL ERROR: ${name} is missing from environment variables!`);
    process.exit(1);
  }
});

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://medassist-ai-helper.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean).map(origin => origin.replace(/\/$/, ''));

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Clean origin (remove trailing slash if present)
    const cleanOrigin = origin.replace(/\/$/, '');
    
    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Socket.io setup
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
});
setupSocket(io);

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight
app.use(express.json());

// Connect DB
let dbError = null;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connected');
    dbError = null;
  })
  .catch((err) => {
    console.error('❌ Connection Failed:', err);
    dbError = err.message;
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: '🏥 MedAssist AI API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    error: dbError
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the other process or change PORT in .env`);
    process.exit(1);
  } else if (err.code === 'EACCES') {
    console.error(`❌ Port ${PORT} requires elevated privileges.`);
    process.exit(1);
  } else {
    throw err;
  }
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
