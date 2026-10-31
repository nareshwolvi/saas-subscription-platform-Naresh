AI-Enabled SaaS Subscription \& Analytics Platform

A backend-focused SaaS subscription management and analytics platform built using Node.js, TypeScript, Express.js, PostgreSQL, Prisma, Razorpay, Redis, BullMQ, PDFKit, Nodemailer, and Model Context Protocol (MCP).

The platform manages customer subscriptions, processes payments, handles payment webhooks, generates PDF invoices, sends email notifications, schedules subscription reminders, and provides analytics through REST APIs and MCP tools.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Table of Contents

•	Features

•	Technology Stack

•	Architecture

•	Prerequisites

•	Project Setup

•	Environment Variables

•	Free Developer Account Setup

•	Running the Application

•	API Endpoints

•	Subscription and Payment Workflow

•	Invoice Generation and Email

•	Background Jobs

•	Analytics and Redis Caching

•	MCP Server Integration

•	Available NPM Scripts

•	Database Models

•	Development Verification

•	Security and Reliability

•	Future Improvements

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Features

Subscription Management

•	Create customer subscriptions through Razorpay.

•	Manage subscription lifecycle and billing periods.

•	Store subscription and customer information in PostgreSQL.

•	Support monthly and yearly billing intervals through the data model.

Payment Processing

•	Razorpay subscription integration.

•	Razorpay webhook signature verification using HMAC SHA-256.

•	Webhook event persistence and processing.

•	Idempotent payment record handling to prevent duplicate payment entries.

•	Transaction-based database updates.

Invoice Generation

•	Generate PDF invoices using PDFKit.

•	Store invoice metadata in PostgreSQL.

•	Associate invoices with successful payments.

•	Track invoice email delivery status.

Email Notifications

•	Send PDF invoices through Nodemailer.

•	Use Ethereal Email for development and testing.

•	Send subscription expiry reminders through the background worker.

Background Processing

•	Redis as the queue backend.

•	BullMQ for asynchronous job processing.

•	Configurable job retries and exponential backoff.

•	Worker concurrency configuration.

•	Scheduled subscription reminders using node-cron.

Analytics

•	Active subscriber count.

•	Total subscription count.

•	Total successful revenue grouped by currency.

•	Current calendar month revenue grouped by currency.

•	Redis caching with a 60-second TTL.

•	Cache invalidation after relevant payment and subscription updates.

MCP Integration

•	MCP server using the official Model Context Protocol SDK.

•	Four analytics tools exposed to MCP-compatible AI clients.

•	Standard input/output (stdio) transport.

•	Local MCP client integration testing.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Technology Stack

Component	Technology

Runtime	Node.js

Programming Language	TypeScript

Backend Framework	Express.js

Database	PostgreSQL

ORM	Prisma

Payment Gateway	Razorpay

Cache	Redis

Background Jobs	BullMQ

Scheduler	node-cron

PDF Generation	PDFKit

Email Service	Nodemailer

AI Integration	Model Context Protocol

Validation	Zod

Containerization	Docker Compose

Development	tsx

Testing Framework	Jest

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Architecture

&#x20;                   Client / API Consumer

&#x20;                           |

&#x20;                           v

&#x20;                    Express.js API

&#x20;                           |

&#x20;          +----------------+----------------+

&#x20;          |                |                |

&#x20;          v                v                v

&#x20;   Subscription API   Analytics API   Razorpay Webhook

&#x20;          |                |                |

&#x20;          v                v                v

&#x20;     Razorpay API       Redis Cache     Signature Check

&#x20;          |                |                |

&#x20;          +----------------+----------------+

&#x20;                           |

&#x20;                           v

&#x20;                      Prisma ORM

&#x20;                           |

&#x20;                           v

&#x20;                      PostgreSQL

&#x20;                           |

&#x20;            +--------------+---------------+

&#x20;            |                              |

&#x20;            v                              v

&#x20;      Invoice Service                Payment Data

&#x20;            |

&#x20;            v

&#x20;         PDFKit

&#x20;            |

&#x20;            v

&#x20;       Invoice PDF

&#x20;            |

&#x20;            v

&#x20;        Nodemailer

&#x20;            |

&#x20;            v

&#x20;       Email Delivery





&#x20;      Redis + BullMQ

&#x20;            |

&#x20;            v

&#x20;      Reminder Queue

&#x20;            |

&#x20;            v

&#x20;      Reminder Worker

&#x20;            |

&#x20;            v

&#x20;       Email Service





&#x20;        MCP Server

&#x20;            |

&#x20;            v

&#x20;      Analytics Tools

&#x20;            |

&#x20;            v

&#x20;      Analytics Service

&#x20;            |

&#x20;            v

&#x20;         PostgreSQL

Architecture Design Decisions

•	Express.js: Lightweight HTTP framework for REST API development.

•	PostgreSQL: Relational database suitable for users, plans, subscriptions, payments, and invoices.

•	Prisma: Type-safe database access, schema management, and migrations.

•	Razorpay: Subscription and payment processing using Test Mode credentials.

•	Redis and BullMQ: Asynchronous job processing without blocking API requests.

•	PDFKit: Programmatic invoice generation.

•	Nodemailer: SMTP-based email delivery.

•	MCP: Exposes analytics capabilities to compatible AI applications through standardized tools.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Prerequisites

Install the following:

•	Node.js 20 or later

•	npm

•	Docker Desktop

•	Git

•	Razorpay developer account

•	Ethereal Email test account

Verify installations:

node --version

npm --version

docker --version

git --version

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Project Setup

1\. Clone the Repository

git clone https://github.com/nareshwolvi/saas-subscription-platform-Naresh.git



cd saas-subscription-platform-Naresh

2\. Install Dependencies

npm install

3\. Configure Environment Variables

Copy the example environment file:

Copy-Item .env.example .env

Update .env with your local credentials.

Never commit .env or expose API keys, webhook secrets, SMTP credentials, or database passwords.

4\. Start PostgreSQL and Redis

The project uses Docker Compose to start both services.

docker compose up -d

Verify containers:

docker compose ps

Default local configuration:

Service	Host	Port

PostgreSQL	localhost	5434

Redis	localhost	6379

PostgreSQL uses port 5434 to avoid conflicts with other local PostgreSQL installations.

5\. Generate Prisma Client

npm run db:generate

The Prisma client is generated from the schema and is intentionally excluded from Git.

6\. Run Database Migrations

npm run db:migrate

Check database connectivity:

npm run db:check

Open Prisma Studio:

npm run db:studio

7\. Start the API Server

Development mode:

npm run dev

The application runs at:

http://localhost:5000

Health check:

GET /health

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Environment Variables

Create a .env file using .env.example.

Variable	Description

NODE\_ENV	Application environment

PORT	API server port

APP\_URL	Backend application URL

FRONTEND\_URL	Frontend application URL

DATABASE\_URL	PostgreSQL connection string

REDIS\_HOST	Redis hostname

REDIS\_PORT	Redis port

REDIS\_PASSWORD	Redis password, if configured

RAZORPAY\_KEY\_ID	Razorpay API key ID

RAZORPAY\_KEY\_SECRET	Razorpay API key secret

RAZORPAY\_WEBHOOK\_SECRET	Razorpay webhook verification secret

RAZORPAY\_PLAN\_STARTER\_MONTHLY	Razorpay monthly plan ID

MAIL\_HOST	SMTP host

MAIL\_PORT	SMTP port

MAIL\_USER	SMTP username

MAIL\_PASSWORD	SMTP password

MAIL\_FROM	Email sender address

INVOICE\_STORAGE\_PATH	Invoice PDF storage directory

MCP\_SERVER\_NAME	MCP server name

Refer to .env.example for the complete configuration template.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Free Developer Account Setup

This project uses Razorpay Test Mode and Ethereal Email for development and testing.

1\. Razorpay Test Mode

Website: https://razorpay.com/

Steps:

1\.	Create a Razorpay developer account.

2\.	Open the Razorpay Dashboard.

3\.	Enable Test Mode.

4\.	Navigate to Account \& Settings → API Keys.

5\.	Generate Test Mode API keys.

6\.	Create a subscription plan.

7\.	Copy the generated plan ID.

8\.	Configure the credentials in .env.

Example:

RAZORPAY\_KEY\_ID=rzp\_test\_your\_key\_id

RAZORPAY\_KEY\_SECRET=your\_test\_key\_secret

RAZORPAY\_WEBHOOK\_SECRET=your\_webhook\_secret

RAZORPAY\_PLAN\_STARTER\_MONTHLY=your\_plan\_id

The project uses a Starter Monthly plan priced at ₹499 in the configured demonstration environment.

For local webhook testing, expose your backend using ngrok:

Website: https://ngrok.com/

Example:

ngrok http 5000

Configure the generated HTTPS webhook URL in the Razorpay Dashboard:

https://YOUR\_NGROK\_DOMAIN/api/webhooks/razorpay

Subscribe to relevant events, including:

•	subscription.activated

•	invoice.paid

•	subscription.charged

Use Test Mode credentials and test payment methods only. Never use real payment credentials for development testing.

2\. Ethereal Email

Website: https://ethereal.email/

Ethereal provides disposable SMTP credentials for testing email delivery without sending emails to real recipients.

Steps:

1\.	Visit Ethereal Email.

2\.	Create a test email account.

3\.	Copy the SMTP username and password.

4\.	Configure the credentials in .env.

Example:

MAIL\_HOST=smtp.ethereal.email

MAIL\_PORT=587

MAIL\_USER=your\_ethereal\_username

MAIL\_PASSWORD=your\_ethereal\_password

MAIL\_FROM="SaaS Subscription Platform <noreply@example.com>"

Ethereal provides preview URLs for emails sent through its test SMTP service.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Running the Application

Start the infrastructure:

docker compose up -d

Start the API:

npm run dev

The API is available at:

http://localhost:5000

For production compilation:

npm run build

Start the compiled application:

npm start

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

API Endpoints

1\. Health Check

GET /health

Checks whether the backend server is running.

2\. Subscription API

POST /api/subscriptions

Creates a subscription through the subscription service and Razorpay integration.

3\. Analytics API

GET /api/analytics

Returns:

•	Active subscription count.

•	Total subscription count.

•	Total successful payment revenue grouped by currency.

•	Current calendar month revenue grouped by currency.

Example PowerShell request:

Invoke-RestMethod `

&#x20; -Uri "http://localhost:5000/api/analytics" `

&#x20; -Method Get |

&#x20; ConvertTo-Json -Depth 10

Analytics results are cached in Redis for 60 seconds.

4\. Razorpay Webhook

POST /api/webhooks/razorpay

Receives Razorpay webhook events.

The webhook controller verifies the signature using the original raw request body before processing the event.

The webhook service updates subscription and payment records and tracks event processing status.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Subscription and Payment Workflow

The subscription and payment workflow follows these steps:

1\.	A customer requests a subscription through the REST API.

2\.	The subscription service retrieves the configured Razorpay plan.

3\.	The application creates the subscription through Razorpay.

4\.	Subscription details are stored in PostgreSQL.

5\.	Razorpay sends webhook notifications when subscription and payment events occur.

6\.	The webhook controller verifies the webhook signature.

7\.	The webhook service processes the event.

8\.	Payment and subscription records are updated using Prisma.

9\.	Duplicate payment records are avoided using unique payment identifiers and idempotent database operations.

10\.	Analytics cache is invalidated when relevant data changes.

11\.	Successful payment fulfillment generates an invoice and triggers email delivery.

Webhook Security

The webhook signature is verified using HMAC SHA-256 and the configured webhook secret.

The raw request body is used for signature verification.

Webhook events are stored in the database to support event tracking and idempotent processing.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Invoice Generation and Email

PDFKit is used to generate invoices after successful payment processing.

Invoice information includes:

•	Invoice number.

•	Invoice date.

•	Customer information.

•	Payment reference.

•	Subscription plan.

•	Billing period.

•	Payment amount.

•	Currency.

•	Payment status.

Invoice metadata is stored in PostgreSQL.

Generated PDF files are stored locally:

storage/

&#x20; invoices/

&#x20;   generated-invoice.pdf

The invoice service checks for an existing invoice to avoid unnecessary duplicate invoice generation.

Nodemailer sends the generated invoice as an email attachment.

The invoice record includes an emailSentAt timestamp to track email delivery.

Testing Invoice Generation

npx tsx src/scripts/test-invoice.ts

Testing Email Delivery

npx tsx src/scripts/test-email.ts

Use Ethereal Email credentials to inspect the generated email preview.

Note: The invoice implementation is intended for the assignment demonstration. GST registration and tax calculations are not configured as a production tax-invoicing solution.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Background Jobs

Redis and BullMQ are used to process subscription reminder jobs asynchronously.

The scheduler identifies active subscriptions approaching their expiry date and adds reminder jobs to the queue.

1\. Start Redis

docker compose up -d redis

2\. Start the Reminder Worker

Open a separate terminal:

npm run worker:reminders

The worker:

•	Listens for queued reminder jobs.

•	Processes reminder email tasks.

•	Uses configurable concurrency.

•	Retries failed jobs.

•	Applies exponential backoff.

•	Logs job completion and failure.

3\. Start the Reminder Scheduler

Open another terminal:

npm run scheduler:reminders

The scheduler runs daily at 9:00 AM using the Asia/Kolkata timezone.

It identifies active subscriptions expiring within the configured three-day reminder window and queues reminder jobs.

4\. Test Redis Queue Connectivity

npx tsx src/scripts/test-redis-queue.ts

5\. Test the Reminder Scheduler

npx tsx src/scripts/test-reminder-scheduler.ts

Important: The manual scheduler test may enqueue reminder emails for customers in the local database. Use test email accounts when running it.

Background Job Architecture

&#x20;       node-cron Scheduler

&#x20;               |

&#x20;               v

&#x20;    Find Expiring Subscriptions

&#x20;               |

&#x20;               v

&#x20;         BullMQ Queue

&#x20;               |

&#x20;               v

&#x20;             Redis

&#x20;               |

&#x20;               v

&#x20;        Reminder Worker

&#x20;               |

&#x20;               v

&#x20;      Reminder Email Service

&#x20;               |

&#x20;               v

&#x20;         Ethereal SMTP

The API does not need to wait for background reminder processing to finish.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Analytics and Redis Caching

The analytics service calculates subscription and revenue metrics using PostgreSQL and Prisma.

The following metrics are supported:

Metric	Description

Active Subscribers	Number of active subscriptions

Total Subscriptions	Total subscription records

Total Revenue	Successful payment revenue grouped by currency

Monthly Revenue	Successful payment revenue for the current calendar month

Redis Cache

Analytics responses are cached using Redis.

Cache key:

analytics:subscription-metrics

Cache expiration:

60 seconds

Relevant subscription and payment updates invalidate the analytics cache.

Important Currency Note

Payment amounts are stored in the smallest currency unit.

For INR:

49900 paise = ₹499

Always convert amounts to the appropriate display currency when presenting financial information.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

MCP Server Integration

The application includes an MCP server built using the official Model Context Protocol SDK.

MCP exposes analytics functionality to compatible AI applications through standardized tools.

MCP Tools

Tool	Description

get\_active\_subscribers	Returns the current number of active subscribers

get\_total\_revenue	Returns total successful payment revenue grouped by currency

get\_monthly\_revenue	Returns successful payment revenue for the current calendar month

get\_subscription\_analytics	Returns combined subscription and revenue metrics

Start the MCP Server

npm run mcp:start

The server uses standard input/output (stdio) transport.

Test MCP Integration

npm run mcp:test

The test client:

1\.	Starts the MCP server as a separate process.

2\.	Establishes an MCP connection.

3\.	Discovers available tools.

4\.	Calls each analytics tool.

5\.	Prints the returned results.

Connecting to an MCP-Compatible AI Client

The MCP server can be configured in a compatible AI client, such as Claude Desktop.

General configuration steps:

1\.	Install the project dependencies.

2\.	Ensure PostgreSQL and Redis are running.

3\.	Configure the project environment variables.

4\.	Locate the MCP client's server configuration file.

5\.	Add a stdio server entry that launches the project's MCP server.

6\.	Use absolute Windows paths for the project and executable where required.

7\.	Restart the AI client.

8\.	Verify that the four analytics tools are available.

For Windows, the server can be launched using the Node.js executable and the locally installed TypeScript loader.

Example command:

node --import tsx src/mcp/server.ts

Run this command from the project directory.

When configuring an AI client, ensure the process starts with the project directory as its working directory so that it can resolve the locally installed dependencies and .env file.

The MCP server reads analytics from the same PostgreSQL database used by the REST API.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Available NPM Scripts

Command	Description

npm run dev	Start development server

npm run build	Compile TypeScript

npm start	Start compiled application

npm test	Run Jest tests

npm run db:migrate	Run Prisma migrations

npm run db:generate	Generate Prisma client

npm run db:studio	Open Prisma Studio

npm run db:check	Check PostgreSQL connectivity

npm run razorpay:check	Verify Razorpay configuration

npm run worker:reminders	Start reminder worker

npm run scheduler:reminders	Start reminder scheduler

npm run mcp:start	Start MCP server

npm run mcp:test	Test MCP integration

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Database Models

The Prisma schema includes the following models:

User

Stores customer information.

Plan

Stores subscription plan details, pricing, and billing intervals.

Subscription

Stores customer subscriptions, lifecycle status, and billing period information.

Payment

Stores payment transaction details, currency, amount, and payment status.

Invoice

Stores invoice metadata, payment references, file information, and email delivery tracking.

WebhookEvent

Stores incoming webhook event details, processing status, and error information.

Database Migrations

Database migrations are maintained under:

prisma/

&#x20; migrations/

&#x20; schema.prisma

Run migrations using:

npm run db:migrate

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Development Verification

Before submitting the project, run these verification commands:

1\. TypeScript Build

npm run build

2\. PostgreSQL Connectivity

npm run db:check

3\. Razorpay API Connectivity

npm run razorpay:check

4\. MCP Integration

npm run mcp:test

5\. API Health Check

Invoke-RestMethod -Uri "http://localhost:5000/health"

6\. Analytics API

Invoke-RestMethod -Uri "http://localhost:5000/api/analytics" |

&#x20;   ConvertTo-Json -Depth 10

Manual Verification Checklist

•	PostgreSQL and Redis start successfully.

•	Database migrations complete successfully.

•	API health endpoint responds successfully.

•	Razorpay Test Mode connection works.

•	Subscription creation works.

•	Webhook signatures are verified.

•	Payment records are updated correctly.

•	Duplicate payment records are prevented.

•	Invoice PDF generation works.

•	Email preview is available through Ethereal.

•	Reminder jobs are queued and processed.

•	Analytics API returns expected results.

•	Redis caching works.

•	All four MCP tools return analytics data.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Security and Reliability Considerations

The implementation includes:

•	Environment-based secret configuration.

•	Razorpay webhook signature verification.

•	Database transactions for related payment and subscription updates.

•	Unique payment identifiers for duplicate prevention.

•	Webhook event tracking.

•	Redis-based caching.

•	BullMQ job retries and exponential backoff.

•	Local invoice storage excluded from version control.

•	.env excluded from version control.

Additional Production Considerations

Before deploying to production, the following improvements should be implemented:

•	Durable asynchronous invoice and email fulfillment.

•	Stronger webhook concurrency control and event claiming.

•	Robust email idempotency and retry handling.

•	Authentication and role-based authorization.

•	Persistent object storage for generated invoices.

•	Structured logging and monitoring.

•	Automated integration and end-to-end tests.

•	Database backup and recovery procedures.

•	Production-grade SMTP configuration.

•	Rate limiting and API security hardening.

A successful payment must remain recorded even if invoice generation or email delivery fails. These workflows should be independently retryable.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Future Improvements

Potential enhancements include:

•	Subscription cancellation and plan upgrades/downgrades.

•	Customer authentication and role-based access control.

•	Frontend subscription management dashboard.

•	Advanced revenue, churn, and retention analytics.

•	Durable invoice and email fulfillment queues.

•	Cloud object storage for invoices.

•	Automated integration and end-to-end testing.

•	Production deployment with CI/CD and monitoring.

•	Additional MCP tools for subscription and customer operations.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Repository

GitHub:

https://github.com/nareshwolvi/saas-subscription-platform-Naresh

License

This project is developed for learning, demonstration, and technical assessment purposes. Add an appropriate open-source license before distributing it publicly.





