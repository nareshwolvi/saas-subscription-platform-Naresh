# AI-Enabled SaaS Subscription & Analytics Platform

A backend-focused SaaS subscription management and analytics platform built using **Node.js, TypeScript, Express.js, PostgreSQL, Prisma, Razorpay, Redis, BullMQ, PDFKit, Nodemailer, and Model Context Protocol (MCP)**.

The platform manages customer subscriptions, processes payments, handles payment webhooks, generates PDF invoices, sends email notifications, schedules subscription reminders, and provides analytics through REST APIs and MCP tools.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [Free Developer Account Setup](#free-developer-account-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Subscription and Payment Workflow](#subscription-and-payment-workflow)
- [Invoice Generation and Email](#invoice-generation-and-email)
- [Background Jobs](#background-jobs)
- [Analytics and Redis Caching](#analytics-and-redis-caching)
- [MCP Server Integration](#mcp-server-integration)
- [Available NPM Scripts](#available-npm-scripts)
- [Database Models](#database-models)
- [Development Verification](#development-verification)
- [Security and Reliability](#security-and-reliability)
- [Future Improvements](#future-improvements)

---

## Features

### Subscription Management
- Create customer subscriptions through Razorpay.
- Manage subscription lifecycle and billing periods.
- Store subscription and customer information in PostgreSQL.
- Support monthly and yearly billing intervals through the data model.

### Payment Processing
- Razorpay subscription integration.
- Razorpay webhook signature verification using HMAC SHA-256.
- Webhook event persistence and processing.
- Idempotent payment record handling to prevent duplicate payment entries.
- Transaction-based database updates.

### Invoice Generation
- Generate PDF invoices using PDFKit.
- Store invoice metadata in PostgreSQL.
- Associate invoices with successful payments.
- Track invoice email delivery status.

### Email Notifications
- Send PDF invoices through Nodemailer.
- Use Ethereal Email for development and testing.
- Send subscription expiry reminders through the background worker.

### Background Processing
- Redis as the queue backend.
- BullMQ for asynchronous job processing.
- Configurable job retries and exponential backoff.
- Worker concurrency configuration.
- Scheduled subscription reminders using node-cron.

### Analytics
- Active subscriber count.
- Total subscription count.
- Total successful revenue grouped by currency.
- Current calendar month revenue grouped by currency.
- Redis caching with a 60-second TTL.
- Cache invalidation after relevant payment and subscription updates.

### MCP Integration
- MCP server using the official Model Context Protocol SDK.
- Four analytics tools exposed to MCP-compatible AI clients.
- Standard input/output (stdio) transport.
- Local MCP client integration testing.

---

## Technology Stack

| Component | Technology |
|---|---|
| Runtime | Node.js |
| Programming Language | TypeScript |
| Backend Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Payment Gateway | Razorpay |
| Cache | Redis |
| Background Jobs | BullMQ |
| Scheduler | node-cron |
| PDF Generation | PDFKit |
| Email Service | Nodemailer |
| AI Integration | Model Context Protocol |
| Validation | Zod |
| Containerization | Docker Compose |
| Development | tsx |
| Testing Framework | Jest |

---

## Architecture

```text
                    Client / API Consumer
                            |
                            v
                     Express.js API
                            |
           +----------------+----------------+
           |                |                |
           v                v                v
    Subscription API   Analytics API   Razorpay Webhook
           |                |                |
           v                v                v
      Razorpay API       Redis Cache     Signature Check
           |                |                |
           +----------------+----------------+
                            |
                            v
                       Prisma ORM
                            |
                            v
                       PostgreSQL
                            |
             +--------------+---------------+
             |                              |
             v                              v
       Invoice Service                Payment Data
             |
             v
          PDFKit
             |
             v
        Invoice PDF
             |
             v
         Nodemailer
             |
             v
        Email Delivery


       Redis + BullMQ
             |
             v
       Reminder Queue
             |
             v
       Reminder Worker
             |
             v
        Email Service


         MCP Server
             |
             v
       Analytics Tools
             |
             v
       Analytics Service
             |
             v
          PostgreSQL
```

### Architecture Design Decisions

- **Express.js:** Lightweight HTTP framework for REST API development.
- **PostgreSQL:** Relational database suitable for users, plans, subscriptions, payments, and invoices.
- **Prisma:** Type-safe database access, schema management, and migrations.
- **Razorpay:** Subscription and payment processing using Test Mode credentials.
- **Redis and BullMQ:** Asynchronous job processing without blocking API requests.
- **PDFKit:** Programmatic invoice generation.
- **Nodemailer:** SMTP-based email delivery.
- **MCP:** Exposes analytics capabilities to compatible AI applications through standardized tools.

---

## Prerequisites

Install the following:

- Node.js 20 or later
- npm
- Docker Desktop
- Git
- Razorpay developer account
- Ethereal Email test account

Verify installations:

```powershell
node --version
npm --version
docker --version
git --version
```

---

## Project Setup

### 1. Clone the Repository

```powershell
git clone https://github.com/nareshwolvi/saas-subscription-platform-Naresh.git

cd saas-subscription-platform-Naresh
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Update `.env` with your local credentials.

Never commit `.env` or expose API keys, webhook secrets, SMTP credentials, or database passwords.

### 4. Start PostgreSQL and Redis

The project uses Docker Compose to start both services.

```powershell
docker compose up -d
```

Verify containers:

```powershell
docker compose ps
```

Default local configuration:

| Service | Host | Port |
|---|---|---|
| PostgreSQL | localhost | 5434 |
| Redis | localhost | 6379 |

PostgreSQL uses port 5434 to avoid conflicts with other local PostgreSQL installations.

### 5. Generate Prisma Client

```powershell
npm run db:generate
```

The Prisma client is generated from the schema and is intentionally excluded from Git.

### 6. Run Database Migrations

```powershell
npm run db:migrate
```

Check database connectivity:

```powershell
npm run db:check
```

Open Prisma Studio:

```powershell
npm run db:studio
```

### 7. Start the API Server

Development mode:

```powershell
npm run dev
```

The application runs at:

`http://localhost:5000`

Health check:

```http
GET /health
```

---

## Environment Variables

Create a `.env` file using `.env.example`.

| Variable | Description |
|---|---|
| `NODE_ENV` | Application environment |
| `PORT` | API server port |
| `APP_URL` | Backend application URL |
| `FRONTEND_URL` | Frontend application URL |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_HOST` | Redis hostname |
| `REDIS_PORT` | Redis port |
| `REDIS_PASSWORD` | Redis password, if configured |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook verification secret |
| `RAZORPAY_PLAN_STARTER_MONTHLY` | Razorpay monthly plan ID |
| `MAIL_HOST` | SMTP host |
| `MAIL_PORT` | SMTP port |
| `MAIL_USER` | SMTP username |
| `MAIL_PASSWORD` | SMTP password |
| `MAIL_FROM` | Email sender address |
| `INVOICE_STORAGE_PATH` | Invoice PDF storage directory |
| `MCP_SERVER_NAME` | MCP server name |

Refer to `.env.example` for the complete configuration template.

---

## Free Developer Account Setup

This project uses Razorpay Test Mode and Ethereal Email for development and testing.

### 1. Razorpay Test Mode

Website: https://razorpay.com/

Steps:

1. Create a Razorpay developer account.
2. Open the Razorpay Dashboard.
3. Enable Test Mode.
4. Navigate to Account & Settings → API Keys.
5. Generate Test Mode API keys.
6. Create a subscription plan.
7. Copy the generated plan ID.
8. Configure the credentials in `.env`.

Example:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_PLAN_STARTER_MONTHLY=your_plan_id
```

The project uses a Starter Monthly plan priced at ₹499 in the configured demonstration environment.

For local webhook testing, expose your backend using ngrok:

Website: https://ngrok.com/

Example:

```powershell
ngrok http 5000
```

Configure the generated HTTPS webhook URL in the Razorpay Dashboard:

```text
https://YOUR_NGROK_DOMAIN/api/webhooks/razorpay
```

Subscribe to relevant events, including:

- `subscription.activated`
- `invoice.paid`
- `subscription.charged`

Use Test Mode credentials and test payment methods only. Never use real payment credentials for development testing.

### 2. Ethereal Email

Website: https://ethereal.email/

Ethereal provides disposable SMTP credentials for testing email delivery without sending emails to real recipients.

Steps:

1. Visit Ethereal Email.
2. Create a test email account.
3. Copy the SMTP username and password.
4. Configure the credentials in `.env`.

Example:

```env
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=your_ethereal_username
MAIL_PASSWORD=your_ethereal_password
MAIL_FROM="SaaS Subscription Platform <noreply@example.com>"
```

Ethereal provides preview URLs for emails sent through its test SMTP service.

---

## Running the Application

Start the infrastructure:

```powershell
docker compose up -d
```

Start the API:

```powershell
npm run dev
```

The API is available at:

`http://localhost:5000`

For production compilation:

```powershell
npm run build
```

Start the compiled application:

```powershell
npm start
```

---

## API Endpoints

### 1. Health Check

```http
GET /health
```

Checks whether the backend server is running.

### 2. Subscription API

```http
POST /api/subscriptions
```

Creates a subscription through the subscription service and Razorpay integration.

### 3. Analytics API

```http
GET /api/analytics
```

Returns:

- Active subscription count.
- Total subscription count.
- Total successful payment revenue grouped by currency.
- Current calendar month revenue grouped by currency.

Example PowerShell request:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:5000/api/analytics" `
  -Method Get |
  ConvertTo-Json -Depth 10
```

Analytics results are cached in Redis for 60 seconds.

### 4. Razorpay Webhook

```http
POST /api/webhooks/razorpay
```

Receives Razorpay webhook events.

The webhook controller verifies the signature using the original raw request body before processing the event.

The webhook service updates subscription and payment records and tracks event processing status.

---

## Subscription and Payment Workflow

The subscription and payment workflow follows these steps:

1. A customer requests a subscription through the REST API.
2. The subscription service retrieves the configured Razorpay plan.
3. The application creates the subscription through Razorpay.
4. Subscription details are stored in PostgreSQL.
5. Razorpay sends webhook notifications when subscription and payment events occur.
6. The webhook controller verifies the webhook signature.
7. The webhook service processes the event.
8. Payment and subscription records are updated using Prisma.
9. Duplicate payment records are avoided using unique payment identifiers and idempotent database operations.
10. Analytics cache is invalidated when relevant data changes.
11. Successful payment fulfillment generates an invoice and triggers email delivery.

### Webhook Security

The webhook signature is verified using HMAC SHA-256 and the configured webhook secret.

The raw request body is used for signature verification.

Webhook events are stored in the database to support event tracking and idempotent processing.

---

## Invoice Generation and Email

PDFKit is used to generate invoices after successful payment processing.

Invoice information includes:

- Invoice number.
- Invoice date.
- Customer information.
- Payment reference.
- Subscription plan.
- Billing period.
- Payment amount.
- Currency.
- Payment status.

Invoice metadata is stored in PostgreSQL.

Generated PDF files are stored locally:

```text
storage/
  invoices/
    generated-invoice.pdf
```

The invoice service checks for an existing invoice to avoid unnecessary duplicate invoice generation.

Nodemailer sends the generated invoice as an email attachment.

The invoice record includes an `emailSentAt` timestamp to track email delivery.

### Testing Invoice Generation

```powershell
npx tsx src/scripts/test-invoice.ts
```

### Testing Email Delivery

```powershell
npx tsx src/scripts/test-email.ts
```

Use Ethereal Email credentials to inspect the generated email preview.

Note: The invoice implementation is intended for the assignment demonstration. GST registration and tax calculations are not configured as a production tax-invoicing solution.

---

## Background Jobs

Redis and BullMQ are used to process subscription reminder jobs asynchronously.

The scheduler identifies active subscriptions approaching their expiry date and adds reminder jobs to the queue.

### 1. Start Redis

```powershell
docker compose up -d redis
```

### 2. Start the Reminder Worker

Open a separate terminal:

```powershell
npm run worker:reminders
```

The worker:

- Listens for queued reminder jobs.
- Processes reminder email tasks.
- Uses configurable concurrency.
- Retries failed jobs.
- Applies exponential backoff.
- Logs job completion and failure.

### 3. Start the Reminder Scheduler

Open another terminal:

```powershell
npm run scheduler:reminders
```

The scheduler runs daily at 9:00 AM using the `Asia/Kolkata` timezone.

It identifies active subscriptions expiring within the configured three-day reminder window and queues reminder jobs.

### 4. Test Redis Queue Connectivity

```powershell
npx tsx src/scripts/test-redis-queue.ts
```

### 5. Test the Reminder Scheduler

```powershell
npx tsx src/scripts/test-reminder-scheduler.ts
```

**Important:** The manual scheduler test may enqueue reminder emails for customers in the local database. Use test email accounts when running it.

### Background Job Architecture

```text
        node-cron Scheduler
                |
                v
     Find Expiring Subscriptions
                |
                v
          BullMQ Queue
                |
                v
              Redis
                |
                v
         Reminder Worker
                |
                v
       Reminder Email Service
                |
                v
          Ethereal SMTP
```

The API does not need to wait for background reminder processing to finish.

---

## Analytics and Redis Caching

The analytics service calculates subscription and revenue metrics using PostgreSQL and Prisma.

The following metrics are supported:

| Metric | Description |
|---|---|
| Active Subscribers | Number of active subscriptions |
| Total Subscriptions | Total subscription records |
| Total Revenue | Successful payment revenue grouped by currency |
| Monthly Revenue | Successful payment revenue for the current calendar month |

### Redis Cache

Analytics responses are cached using Redis.

Cache key:

```text
analytics:subscription-metrics
```

Cache expiration:

```text
60 seconds
```

Relevant subscription and payment updates invalidate the analytics cache.

### Important Currency Note

Payment amounts are stored in the smallest currency unit.

For INR:

```text
49900 paise = ₹499
```

Always convert amounts to the appropriate display currency when presenting financial information.

---

## MCP Server Integration

The application includes an MCP server built using the official Model Context Protocol SDK.

MCP exposes analytics functionality to compatible AI applications through standardized tools.

### MCP Tools

| Tool | Description |
|---|---|
| `get_active_subscribers` | Returns the current number of active subscribers |
| `get_total_revenue` | Returns total successful payment revenue grouped by currency |
| `get_monthly_revenue` | Returns successful payment revenue for the current calendar month |
| `get_subscription_analytics` | Returns combined subscription and revenue metrics |

### Start the MCP Server

```powershell
npm run mcp:start
```

The server uses standard input/output (stdio) transport.

### Test MCP Integration

```powershell
npm run mcp:test
```

The test client:

1. Starts the MCP server as a separate process.
2. Establishes an MCP connection.
3. Discovers available tools.
4. Calls each analytics tool.
5. Prints the returned results.

### Connecting to an MCP-Compatible AI Client

The MCP server can be configured in a compatible AI client, such as Claude Desktop.

General configuration steps:

1. Install the project dependencies.
2. Ensure PostgreSQL and Redis are running.
3. Configure the project environment variables.
4. Locate the MCP client's server configuration file.
5. Add a stdio server entry that launches the project's MCP server.
6. Use absolute Windows paths for the project and executable where required.
7. Restart the AI client.
8. Verify that the four analytics tools are available.

For Windows, the server can be launched using the Node.js executable and the locally installed TypeScript loader.

Example command:

```powershell
node --import tsx src/mcp/server.ts
```

Run this command from the project directory.

When configuring an AI client, ensure the process starts with the project directory as its working directory so that it can resolve the locally installed dependencies and `.env` file.

The MCP server reads analytics from the same PostgreSQL database used by the REST API.

---

## Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Start compiled application |
| `npm test` | Run Jest tests |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:check` | Check PostgreSQL connectivity |
| `npm run razorpay:check` | Verify Razorpay configuration |
| `npm run worker:reminders` | Start reminder worker |
| `npm run scheduler:reminders` | Start reminder scheduler |
| `npm run mcp:start` | Start MCP server |
| `npm run mcp:test` | Test MCP integration |

---

## Database Models

The Prisma schema includes the following models:

### User
Stores customer information.

### Plan
Stores subscription plan details, pricing, and billing intervals.

### Subscription
Stores customer subscriptions, lifecycle status, and billing period information.

### Payment
Stores payment transaction details, currency, amount, and payment status.

### Invoice
Stores invoice metadata, payment references, file information, and email delivery tracking.

### WebhookEvent
Stores incoming webhook event details, processing status, and error information.

### Database Migrations

Database migrations are maintained under:

```text
prisma/
  migrations/
  schema.prisma
```

Run migrations using:

```powershell
npm run db:migrate
```

---

## Development Verification

Before submitting the project, run these verification commands:

### 1. TypeScript Build

```powershell
npm run build
```

### 2. PostgreSQL Connectivity

```powershell
npm run db:check
```

### 3. Razorpay API Connectivity

```powershell
npm run razorpay:check
```

### 4. MCP Integration

```powershell
npm run mcp:test
```

### 5. API Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health"
```

### 6. Analytics API

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/analytics" |
    ConvertTo-Json -Depth 10
```

### Manual Verification Checklist

- [ ] PostgreSQL and Redis start successfully.
- [ ] Database migrations complete successfully.
- [ ] API health endpoint responds successfully.
- [ ] Razorpay Test Mode connection works.
- [ ] Subscription creation works.
- [ ] Webhook signatures are verified.
- [ ] Payment records are updated correctly.
- [ ] Duplicate payment records are prevented.
- [ ] Invoice PDF generation works.
- [ ] Email preview is available through Ethereal.
- [ ] Reminder jobs are queued and processed.
- [ ] Analytics API returns expected results.
- [ ] Redis caching works.
- [ ] All four MCP tools return analytics data.

---

## Security and Reliability Considerations

The implementation includes:

- Environment-based secret configuration.
- Razorpay webhook signature verification.
- Database transactions for related payment and subscription updates.
- Unique payment identifiers for duplicate prevention.
- Webhook event tracking.
- Redis-based caching.
- BullMQ job retries and exponential backoff.
- Local invoice storage excluded from version control.
- `.env` excluded from version control.

### Additional Production Considerations

Before deploying to production, the following improvements should be implemented:

- Durable asynchronous invoice and email fulfillment.
- Stronger webhook concurrency control and event claiming.
- Robust email idempotency and retry handling.
- Authentication and role-based authorization.
- Persistent object storage for generated invoices.
- Structured logging and monitoring.
- Automated integration and end-to-end tests.
- Database backup and recovery procedures.
- Production-grade SMTP configuration.
- Rate limiting and API security hardening.

A successful payment must remain recorded even if invoice generation or email delivery fails. These workflows should be independently retryable.

---

## Future Improvements

Potential enhancements include:

- Subscription cancellation and plan upgrades/downgrades.
- Customer authentication and role-based access control.
- Frontend subscription management dashboard.
- Advanced revenue, churn, and retention analytics.
- Durable invoice and email fulfillment queues.
- Cloud object storage for invoices.
- Automated integration and end-to-end testing.
- Production deployment with CI/CD and monitoring.
- Additional MCP tools for subscription and customer operations.

---

## Repository

**GitHub:**  
https://github.com/nareshwolvi/saas-subscription-platform-Naresh

## License

This project is developed for learning, demonstration, and technical assessment purposes. Add an appropriate open-source license before distributing it publicly.
