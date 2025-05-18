const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { NotificationType, NotificationStatus } = require('../types/notification.types');
const NotificationModel = require('../models/notification.model');

class NotificationService {
  constructor() {
    this.initializeServices();
  }

  initializeServices() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const smtpConfig = {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          tls: {
            rejectUnauthorized: true,
            minVersion: 'TLSv1.2'
          },
          debug: true,
          logger: true
        };

        console.log('Initializing SMTP with config:', {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.auth.user,
          tls: smtpConfig.tls
        });

        this.emailTransporter = nodemailer.createTransport(smtpConfig);

        this.testSmtpConnection();
      } catch (error) {
        console.error('Failed to initialize email service:', error);
      }
    } else {
      console.warn('Email service not initialized: Missing SMTP credentials');
    }

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        console.log('SMS service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize SMS service:', error);
      }
    } else {
      console.warn('SMS service not initialized: Missing Twilio credentials');
    }
  }

  async testSmtpConnection() {
    try {
      const info = await this.emailTransporter.verify();
      console.log('SMTP Connection Test Result:', info);
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('SMTP Connection Test Failed:', error);
      console.error('Please check:');
      console.error('1. Your App Password is correct and has no spaces');
      console.error('2. 2-Step Verification is enabled on your Google Account');
      console.error('3. Your Gmail account is not blocked');
      console.error('4. You are using the correct port (587 for Gmail)');
      console.error('Full error details:', error);
    }
  }

  async createNotification(notification) {
    const newNotification = new NotificationModel(notification);
    await newNotification.save();
    return this.toNotification(newNotification);
  }

  async getUserNotifications(userId) {
    const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map(this.toNotification);
  }

  async sendNotification(notification) {
    try {
      switch (notification.type) {
        case NotificationType.EMAIL:
          await this.sendEmail(notification);
          break;
        case NotificationType.SMS:
          await this.sendSMS(notification);
          break;
        case NotificationType.IN_APP:
          await this.sendInApp(notification);
          break;
        default:
          throw new Error(`Unsupported notification type: ${notification.type}`);
      }

      await NotificationModel.findByIdAndUpdate(notification.id, {
        status: NotificationStatus.SENT,
        updatedAt: new Date()
      });
    } catch (error) {
      await this.handleNotificationError(notification, error);
      throw error;
    }
  }

  async sendEmail(notification) {
    if (!this.emailTransporter) {
      throw new Error('Email service not configured. Please set SMTP credentials in .env file.');
    }

    const { to, subject, message } = notification;
    await this.emailTransporter.sendMail({
      to,
      subject,
      text: message
    });
  }

  async sendSMS(notification) {
    if (!this.twilioClient) {
      throw new Error('SMS service not configured. Please set Twilio credentials in .env file.');
    }

    const { to, message } = notification;
    await this.twilioClient.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
  }

  async sendInApp(notification) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async handleNotificationError(notification, error) {
    const retryCount = (notification.retryCount || 0) + 1;
    const maxRetries = 3;

    await NotificationModel.findByIdAndUpdate(notification.id, {
      status: retryCount >= maxRetries ? NotificationStatus.FAILED : NotificationStatus.PENDING,
      retryCount,
      error: error.message,
      updatedAt: new Date()
    });
  }

  toNotification(doc) {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      title: doc.title,
      message: doc.message,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      retryCount: doc.retryCount,
      error: doc.error,
      metadata: doc.metadata,
      to: doc.to,
      subject: doc.subject
    };
  }
}

module.exports = new NotificationService(); 