const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const notificationRoutes = require('./routes/notification.routes');
const queueService = require('./services/queue.service');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', notificationRoutes);

async function startServer() {
  try {
    const requiredEnvVars = [
      'MONGODB_URI',
      'RABBITMQ_URL',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER'
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await queueService.connect();
    console.log('Connected to RabbitMQ');

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGTERM', async () => {
  await queueService.close();
  await mongoose.connection.close();
  process.exit(0);
}); 