# Notification Service - Intern Assignment

This project is a notification service built as part of an intern assignment.

## Objective

The main goal here was to create a system that can send different kinds of notifications to users.

## What's Implemented (Assignment Requirements)

I've focused on getting the core requirements from the assignment in place:

### 1. API Endpoints

*   **Send a Notification (`POST /api/notifications`)**
    *   This endpoint lets you trigger various types of notifications. Check out the [API Endpoints](#api-endpoints) section below for more on how to use it.

*   **Get User Notifications (`GET /api/users/{userId}/notifications`)**
    *   We can use this to fetch all the notifications saved for a specific user. Details are in the [API Endpoints](#api-endpoints) section.

### 2. Notification Types

The service is set up to handle sending notifications through a few different channels:

*   **Email:** Uses Nodemailer, and we can set up our SMTP details.
*   **SMS:** Integrates with the Twilio API for sending text messages.
*   **In-app:** There's a basic setup here, ready to be connected to something like WebSockets for real-time alerts.

## Bonus Features I Added

To go a bit beyond the basics, I included these features:

*   **Message Queue:** Using RabbitMQ. This helps handle sending notifications in the background, making the API faster and more reliable.
*   **Retries:** If sending a notification fails, the service will automatically try again up to 3 times. It also logs the errors for failed attempts.

## What's in This Repository (Deliverables)

This repo contains everything needed for the assignment:

*   The complete source code for the notification service.
*   This README file, which explains how to set things up and what assumptions I made.

## Getting Started (Setup Instructions)

Here's how to get this running on your machine:

1.  Grab the code by cloning this Git repository.

2.  Go into the project folder using your terminal.

3.  Install the needed packages:
    ```bash
    npm install
    ```

4.  Make a copy of the example environment file:
    ```bash
    cp example.env .env
    ```

5.  Open the new `.env` file and fill in your actual connection details for MongoDB, RabbitMQ, Twilio, and your email provider (SMTP). The `example.env` has notes to help you.

6.  Make sure MongoDB and RabbitMQ servers are up and running.

## How to Run

*   For development (with automatic restarts when you save changes):
    ```bash
    npm run dev
    ```

*   For a production-like setup:
    ```bash
    npm start
    ```

The service will be accessible at the port set in `.env` file (3000).

## API Endpoints (More Detail)

### Send Notification

`POST /api/notifications`

Use this to send a notification. Just send a POST request with the details in the body.

**Request Body Looks Like This:**

```json
{
  "userId": "string",         
  "type": "string",          
  "title": "string",          
  "message": "string",        
  "to": "string",             
  "subject": "string",        
  "metadata": { "any": "any" }
}
```

### Get User Notifications

`GET /api/users/{userId}/notifications`

To get a list of notifications for a user, make a GET request to this endpoint, replacing `{userId}` with the actual user's ID.

## Project Structure

The code is organized into layers:

*   **API Layer**: Handles incoming web requests.
*   **Service Layer**: Where the main notification logic lives (creating, sending, etc.).
*   **Queue Layer**: Deals with putting notifications onto the RabbitMQ queue and processing them.
*   **Data Layer**: Handles talking to the MongoDB database.

## Handling Errors and Retries

I've included error handling for when notifications fail to send. They'll be automatically retried a few times (up to 3). Any errors are logged, and the notification status in the database is updated.

## Assumptions I Made

Just a few things I assumed while building this:

*   You'll have RabbitMQ and MongoDB set up and running where the application can reach them.
*   All the necessary connection details and API keys will be provided correctly in the `.env` file.
*   If you're using Gmail for email, you'll use an App Password for security (you need 2-Step Verification on your Google Account for this).
*   The in-app notification part is just a starting point; you'd need more work to make it fully real-time.
*   There's some basic checking of the data you send to the API, but for a real system, you'd probably want more robust validation.
