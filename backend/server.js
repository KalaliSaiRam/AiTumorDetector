const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');
const config = require('./src/config/config');

const prisma = new PrismaClient();

const PORT = config.port;

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`\n🚀 MRI Detection Backend running on port ${PORT}`);
      console.log(`   Environment : ${config.nodeEnv}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   API Base    : http://localhost:${PORT}/api`);
      console.log(`   AI Service  : ${config.ai.serviceUrl}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// ─── Graceful Shutdown ─────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  await prisma.$disconnect();
  console.log('✅ Database disconnected. Goodbye.');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
