require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const uploadRouter = require('./routes/upload');
const jobsRouter = require('./routes/jobs');
const aiRouter = require('./routes/ai');
const { startWorker } = require('./workers/insightsWorker');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', uploadRouter);
app.use('/api', jobsRouter);
app.use('/api', aiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB and start server
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Start the BullMQ worker
    startWorker();
    console.log('✅ BullMQ worker started');

    app.listen(PORT, () => {
      console.log(`✅ Backend API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
