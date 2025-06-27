const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { initCronJobs, initDailyRecords } = require('./services/cronService');
const callSyncService = require('./services/callSyncService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('📊 MongoDB Connected to online database'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (these must come BEFORE static file serving)
app.get('/api', (req, res) => {
  res.json({ message: 'CRM API Server is running!' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/email-config', require('./routes/emailConfig'));
app.use('/api/animation-config', require('./routes/animationConfig'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is healthy' });
});

// Database status endpoint
app.get('/api/db-status', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: 'mongodb',
    state: states[dbState] || 'unknown',
    message: 'Using MongoDB database',
    database: 'MongoDB'
  });
});

// Serve static files from React build (only in production)
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Handle React routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  // Development mode - just show API status
  app.get('/', (req, res) => {
    res.json({ message: 'CRM API Server is running in development mode!' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Using MongoDB database`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('📁 Serving React app from client/build folder');
  }
  
  // Initialize daily records on startup
  await initDailyRecords();
  
  // Initialize cron jobs
  initCronJobs();
  
  // Start call sync service
  callSyncService.start();
}); 