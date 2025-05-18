const amqp = require('amqplib');
const notificationService = require('./notification.service');

class QueueService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queueName = 'notifications';
  }

  async connect() {
    try {
      const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
      this.connection = conn;
      const ch = await conn.createChannel();
      this.channel = ch;
      await ch.assertQueue(this.queueName, { durable: true });
      
      ch.consume(this.queueName, async (msg) => {
        if (msg) {
          try {
            const notification = JSON.parse(msg.content.toString());
            await notificationService.sendNotification(notification);
            ch.ack(msg);
          } catch (error) {
            console.error('Error processing notification:', error);
            ch.nack(msg, false, true);
          }
        }
      });
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  async publishNotification(notification) {
    if (!this.channel) {
      throw new Error('Queue channel not initialized');
    }
    this.channel.sendToQueue(
      this.queueName,
      Buffer.from(JSON.stringify(notification)),
      { persistent: true }
    );
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

module.exports = new QueueService(); 