const mongoose = require('mongoose');
const { NotificationType, NotificationStatus } = require('../types/notification.types');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  retryCount: {
    type: Number,
    default: 0
  },
  error: {
    type: String
  },
  to: {
    type: String
  },
  subject: {
    type: String
  }
}, {
  timestamps: true
});

const NotificationModel = mongoose.model('Notification', notificationSchema);

module.exports = NotificationModel; 