const app = require('./app');
const db = require('./db/connection');
const scheduler = require('./services/scheduler');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Initialize Oracle connection pool
    await db.initialize();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      
      // Start scheduler
      scheduler.startScheduler();
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down...');
  await db.close();
  process.exit(0);
});

start();
