# Notification Service

A robust notification service that supports multiple notification channels including email, SMS, and in-app notifications. The service uses a message queue for reliable delivery and includes retry mechanisms for failed notifications.

## Features

- Multiple notification channels (Email, SMS, In-app)
- Asynchronous processing using RabbitMQ
- Automatic retry mechanism for failed notifications
- RESTful API endpoints
- MongoDB for notification storage

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- RabbitMQ
- SMTP server (for email notifications)
- Twilio account (for SMS notifications)

## Installation

1. Clone the repository.

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory by copying `example.env` and filling in your credentials:
```bash
cp example.env .env
```

4. Update the `.env` file with your actual configuration:
   - MongoDB connection string
   - RabbitMQ connection URL
   - Twilio Account SID, Auth Token, and Phone Number
   - SMTP Host, Port, User (your email), and Pass (your App Password if using Gmail)

## Running the Service

1. Start your MongoDB and RabbitMQ services.

2. Start the service in development mode with hot-reload:
```bash
npm run dev
```

   Alternatively, start the service in production mode:
```bash
npm start
```

## API Endpoints

### Send Notification

Sends a new notification.

`POST /api/notifications`

**Request Body Example:**
```json
{
  "userId": "user123",
  "type": "EMAIL",
  "title": "Welcome",
  "message": "Welcome to our platform!",
  "to": "user@example.com",
  "subject": "Welcome Email",
  "metadata": { "campaignId": "xyz" }
}
```

*Note: The `to` and `subject` fields are required for EMAIL notifications. The `to` field is required for SMS notifications.* `metadata` is optional.

### Get User Notifications

Retrieves all notifications for a specific user.

`GET /api/users/{userId}/notifications`

**Example:**
```
GET /api/users/user123/notifications
```

## Architecture

The service follows a layered architecture with the following components:

- **API Layer**: Handles incoming HTTP requests and sends responses.
- **Service Layer**: Contains the core business logic for creating, sending, and managing notifications.
- **Queue Layer**: Uses RabbitMQ for asynchronous processing of notification tasks, improving performance and reliability.
- **Data Layer**: Interacts with MongoDB for storing and retrieving notification data.

## Error Handling and Retries

The service includes built-in error handling. If sending a notification fails, it will be automatically retried up to 3 times. Failed notifications and their errors are logged.

## Testing

Run tests using:
```bash
npm test
```

## License

MIT 