const express = require('express');
const notificationService = require('../services/notification.service');
const queueService = require('../services/queue.service');
const { NotificationType } = require('../types/notification.types');

const router = express.Router();

router.post('/notifications', async (req, res) => {
  try {
    const { userId, type, title, message, metadata, to, subject } = req.body;

    const notification = await notificationService.createNotification({
      userId,
      type,
      title,
      message,
      metadata,
      ...(type === NotificationType.EMAIL && { to, subject }),
      ...(type === NotificationType.SMS && { to })
    });

    await queueService.publishNotification(notification);

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

router.get('/users/:userId/notifications', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await notificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router; 