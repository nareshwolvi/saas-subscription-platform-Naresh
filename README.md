\# AI-Enabled SaaS Subscription \& Analytics Platform



A backend-focused SaaS subscription management platform built with \*\*Node.js, TypeScript, Express, PostgreSQL, Prisma, Razorpay, Redis, BullMQ, and Model Context Protocol (MCP)\*\*.



The platform supports subscription creation, payment processing, webhook handling, invoice generation, email notifications, scheduled subscription reminders, analytics, and AI-agent integration through MCP tools.



\## Features



\- \*\*Subscription Management:\*\* Create and manage customer subscriptions using Razorpay.

\- \*\*Payment Processing:\*\* Integrate Razorpay subscriptions in Test Mode.

\- \*\*Webhook Integration:\*\* Verify Razorpay webhook signatures and process payment and subscription events.

\- \*\*Idempotent Payment Handling:\*\* Avoid duplicate payment records when multiple related webhook events are received.

\- \*\*Invoice Generation:\*\* Generate PDF invoices using PDFKit and persist invoice metadata in PostgreSQL.

\- \*\*Email Notifications:\*\* Send invoice and subscription reminder emails using Nodemailer.

\- \*\*Background Jobs:\*\* Use Redis and BullMQ for queued subscription reminder processing.

\- \*\*Scheduled Reminders:\*\* Schedule subscription expiry reminders using node-cron.

\- \*\*Analytics API:\*\* Calculate subscriber counts, total revenue, and monthly revenue.

\- \*\*Redis Caching:\*\* Cache analytics results to reduce repeated database queries.

\- \*\*MCP Integration:\*\* Expose subscription analytics through MCP tools for AI assistants.



\## Technology Stack



| Component | Technology |

|---|---|

| Runtime | Node.js |

| Language | TypeScript |

| Backend | Express.js |

| Database | PostgreSQL |

| ORM | Prisma |

| Payment Gateway | Razorpay |

| Cache | Redis |

| Background Jobs | BullMQ |

| Scheduler | node-cron |

| PDF Generation | PDFKit |

| Email | Nodemailer |

| AI Integration | Model Context Protocol (MCP) |

| Validation | Zod |

| Containerization | Docker Compose |



\## Architecture Overview



```text

&#x20;                   Client / API Consumer

&#x20;                           |

&#x20;                           v

&#x20;                    Express.js API

&#x20;                           |

&#x20;         +-----------------+------------------+

&#x20;         |                 |                  |

&#x20;         v                 v                  v

&#x20;   Subscription API   Analytics API     Razorpay Webhook

&#x20;         |                 |                  |

&#x20;         v                 v                  v

&#x20;    Razorpay API       Redis Cache       Signature Check

&#x20;         |                 |                  |

&#x20;         v                 v                  v

&#x20;    PostgreSQL <------- Prisma ORM <----- Webhook Service

&#x20;         |

&#x20;         +-----------------------+

&#x20;         |                       |

&#x20;         v                       v

&#x20;   Invoice Service        Subscription Data

&#x20;         |

&#x20;         v

&#x20;     PDFKit

&#x20;         |

&#x20;         v

&#x20;   Invoice PDF

&#x20;         |

&#x20;         v

&#x20;   Nodemailer

&#x20;         |

&#x20;         v

&#x20;    Email Delivery



&#x20;      Redis + BullMQ

&#x20;            |

&#x20;            v

&#x20;     Reminder Worker

&#x20;            |

&#x20;            v

&#x20;      Email Service



&#x20;      MCP Server

&#x20;            |

&#x20;            v

&#x20;    Analytics Service

&#x20;            |

&#x20;            v

&#x20;       PostgreSQL

```



\## Prerequisites



Install the following before running the project:



\- Node.js 20 or later

\- npm

\- Docker Desktop

\- Git

\- Razorpay Test Mode account

\- SMTP test account (Ethereal Email is suitable)



\## Project Setup



\### 1. Clone the repository



```bash

git clone <YOUR\_REPOSITORY\_URL>

cd saas-subscription-platform

```



\### 2. Install dependencies



```bash

npm install

```



\### 3. Configure environment variables



Copy the example environment file:



\*\*PowerShell:\*\*



```powershell

Copy-Item .env.example .env

```



Update `.env` with your local configuration and credentials.



Never commit `.env` or expose API keys, webhook secrets, SMTP credentials, or database passwords.



\### 4. Start PostgreSQL and Redis



```bash

docker compose up -d

```



Check container status:



```bash

docker compose ps

```



The default local configuration uses:



\- PostgreSQL: `localhost:5434`

\- Redis: `localhost:6379`



\### 5. Configure Prisma



Generate the Prisma client:



```bash

npm run db:generate

```



Run database migrations:



```bash

npm run db:migrate

```



Check database connectivity:



```bash

npm run db:check

```



Open Prisma Studio:



```bash

npm run db:studio

```



\### 6. Start the API server



Development mode:



```bash

npm run dev

```



The API runs at:



`http://localhost:5000`



Health check:



```http

GET /health

```



\## Environment Variables



| Variable | Purpose |

|---|---|

| `NODE\_ENV` | Application environment |

| `PORT` | API server port |

| `DATABASE\_URL` | PostgreSQL connection string |

| `REDIS\_HOST` | Redis hostname |

| `REDIS\_PORT` | Redis port |

| `REDIS\_PASSWORD` | Redis password, if configured |

| `RAZORPAY\_KEY\_ID` | Razorpay API key ID |

| `RAZORPAY\_KEY\_SECRET` | Razorpay API key secret |

| `RAZORPAY\_WEBHOOK\_SECRET` | Webhook signature verification secret |

| `RAZORPAY\_PLAN\_STARTER\_MONTHLY` | Razorpay monthly plan ID |

| `APP\_URL` | Backend application URL |

| `FRONTEND\_URL` | Frontend application URL |

| `MAIL\_HOST` | SMTP host |

| `MAIL\_PORT` | SMTP port |

| `MAIL\_USER` | SMTP username |

| `MAIL\_PASSWORD` | SMTP password |

| `MAIL\_FROM` | Sender email address |

| `INVOICE\_STORAGE\_PATH` | Local invoice storage directory |

| `MCP\_SERVER\_NAME` | MCP server name |



Refer to `.env.example` for the configuration template.



\## API Endpoints



\### Health Check



```http

GET /health

```



Checks whether the API server is running.



\### Subscription



```http

POST /api/subscriptions

```



Creates a subscription through the subscription service and Razorpay integration.



\### Analytics



```http

GET /api/analytics

```



Returns subscription and revenue metrics, including:



\- Active subscriptions

\- Total subscriptions

\- Total revenue grouped by currency

\- Current calendar month revenue grouped by currency



Analytics responses are cached in Redis for 60 seconds.



\### Razorpay Webhook



```http

POST /api/webhooks/razorpay

```



Receives Razorpay webhook events, verifies the signature, and processes supported subscription and payment events.



The webhook endpoint must receive the raw request body for signature verification.



\## Razorpay Test Mode Setup



1\. Create a Razorpay account.

2\. Enable Test Mode.

3\. Generate API keys.

4\. Create a subscription plan in the Razorpay dashboard.

5\. Add the plan ID and API credentials to `.env`.

6\. Configure the webhook endpoint.

7\. Subscribe to the relevant events, including:

&#x20;  - `subscription.activated`

&#x20;  - `invoice.paid`

&#x20;  - `subscription.charged`



For local webhook testing, expose the API using a tunneling service such as ngrok and configure the generated HTTPS URL in Razorpay.



\*\*Important:\*\* Use Razorpay Test Mode for development and demonstrations. Do not use real payment credentials for testing.



\## Invoice and Email Processing



After a successful payment:



1\. The webhook service processes the payment event.

2\. Payment and subscription records are updated.

3\. An invoice is generated using PDFKit.

4\. Invoice metadata is stored in PostgreSQL.

5\. Nodemailer sends the invoice as an email attachment.

6\. The invoice email timestamp is recorded.



Generated invoice PDFs are stored locally under:



```text

storage/invoices/

```



For email testing, configure an Ethereal SMTP account. Ethereal provides preview links without delivering emails to real recipients.



\## Redis and BullMQ



The platform uses Redis and BullMQ to process subscription reminder jobs asynchronously.



Start the reminder worker:



```bash

npm run worker:reminders

```



Start the reminder scheduler:



```bash

npm run scheduler:reminders

```



The scheduler runs daily at 9:00 AM using the `Asia/Kolkata` timezone and queues reminders for subscriptions approaching expiry.



Run the worker and scheduler in separate terminal windows.



\## MCP Integration



The project includes an MCP server using the official Model Context Protocol SDK.



Start the MCP server:



```bash

npm run mcp:start

```



Run the MCP integration test:



```bash

npm run mcp:test

```



The server exposes these tools:



| Tool | Description |

|---|---|

| `get\_active\_subscribers` | Retrieves the active subscriber count |

| `get\_total\_revenue` | Retrieves total revenue grouped by currency |

| `get\_monthly\_revenue` | Retrieves current-month revenue |

| `get\_subscription\_analytics` | Retrieves the combined analytics metrics |



The MCP server uses standard input/output (stdio) transport and can be connected to an MCP-compatible AI client.



\## Available NPM Scripts



| Command | Description |

|---|---|

| `npm run dev` | Start development server |

| `npm run build` | Compile TypeScript |

| `npm start` | Start compiled application |

| `npm test` | Run Jest tests |

| `npm run db:migrate` | Run Prisma migrations |

| `npm run db:generate` | Generate Prisma client |

| `npm run db:studio` | Open Prisma Studio |

| `npm run db:check` | Check database connectivity |

| `npm run razorpay:check` | Verify Razorpay configuration |

| `npm run worker:reminders` | Start reminder worker |

| `npm run scheduler:reminders` | Start reminder scheduler |

| `npm run mcp:start` | Start MCP server |

| `npm run mcp:test` | Test MCP tools |



\## Database Models



The Prisma schema includes:



\- \*\*User:\*\* Customer information.

\- \*\*Plan:\*\* Subscription plan details and billing interval.

\- \*\*Subscription:\*\* Subscription lifecycle and billing period information.

\- \*\*Payment:\*\* Payment transactions and statuses.

\- \*\*Invoice:\*\* Invoice metadata and email delivery status.

\- \*\*WebhookEvent:\*\* Webhook event tracking and processing status.



\## Security and Reliability Considerations



\- Store secrets in environment variables.

\- Verify webhook signatures before processing events.

\- Use database transactions for related payment and subscription updates.

\- Enforce unique payment identifiers to prevent duplicate payment records.

\- Use idempotency safeguards when processing webhook events.

\- Cache analytics data and invalidate it after relevant payment updates.

\- Use retry and backoff configuration for BullMQ jobs.

\- Keep invoice PDFs and environment files out of version control.



For production deployment, additionally configure durable background fulfillment, robust webhook concurrency handling, persistent object storage, monitoring, structured logging, authentication and authorization, and production SMTP credentials.



\## Development Verification



Useful checks before submitting the project:



```bash

npm run build

npm run db:check

npm run razorpay:check

npm run mcp:test

```



Also verify the following manually:



\- API health endpoint responds successfully.

\- Subscription creation works in Razorpay Test Mode.

\- Webhook signatures are verified.

\- Payment and subscription records are updated correctly.

\- Invoice PDF generation works.

\- Email delivery works through the test SMTP provider.

\- Reminder jobs are queued and processed.

\- Analytics API returns expected results.

\- MCP tools return analytics data.



\## Future Improvements



\- Subscription cancellation and plan upgrades/downgrades.

\- Customer authentication and role-based access control.

\- Frontend subscription dashboard.

\- Advanced revenue and churn analytics.

\- Durable invoice and email fulfillment queues.

\- Cloud object storage for invoices.

\- Automated integration and end-to-end tests.

\- Production deployment with monitoring and CI/CD.



\## License



This project is intended for learning, demonstration, and assessment purposes. Add an appropriate license before distributing it publicly.



