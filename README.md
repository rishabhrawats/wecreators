# Instagram Automation MVP - Part 1

Production-ready NestJS backend service that receives and verifies Meta (Instagram) webhooks, normalizes incoming events, stores them in Postgres, and enqueues each event for async processing using BullMQ.

## Stack

- Node.js + TypeScript + NestJS (Express)
- Prisma + Postgres
- Redis + BullMQ
- Docker + docker-compose
- Environment validation via `zod`
- Logging via `pino` + request IDs
- ESLint + Prettier + Jest

## Quick Start (Docker)

1. Copy environment config:

```bash
cp .env.example .env
```

2. Start services:

```bash
docker compose up --build
```

3. API will be available at:

- `http://localhost:3000/webhooks/meta`

## Local (without Docker)

1. Install dependencies:

```bash
npm ci
```

2. Set environment values in `.env` (use `.env.example` as template).

3. Run Prisma migrations:

```bash
npm run prisma:generate
npm run prisma:deploy
```

4. Run app:

```bash
npm run start:dev
```

## Webhook Endpoints

### 1) Meta verification endpoint

- `GET /webhooks/meta`
- Query params required:
  - `hub.mode`
  - `hub.verify_token`
  - `hub.challenge`
- Returns `200` with `hub.challenge` only if mode is `subscribe` and token matches `VERIFY_TOKEN`.
- Returns `403` otherwise.

### 2) Meta receiver endpoint

- `POST /webhooks/meta`
- Verifies `X-Hub-Signature-256` header (`sha256=<hex>`) against **raw request body bytes** with `APP_SECRET`.
- Invalid signature => `401`.
- Valid signature => normalize payload to internal events, persist each unique event, enqueue each inserted event ID.
- Duplicate events are ignored gracefully via unique constraint on `(source, externalEventId)`.

## Queue

- Queue name: `incoming-events`
- Job payload: `{ incomingEventId: string }`
- Worker stub logs the incoming event ID.

## Scripts

- `npm run build` - Build project
- `npm run start:dev` - Start in watch mode
- `npm run lint` - Lint source
- `npm run test` - Run unit tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:deploy` - Apply migrations
- `npm run sample:signature` - Generate X-Hub-Signature-256 for sample payload

## Local test with sample payload

Sample payload is at `samples/meta-webhook-sample.json`.

1) Generate signature:

```bash
APP_SECRET=change-me-meta-app-secret npm run sample:signature
```

2) Use returned signature in curl:

```bash
curl -i -X POST http://localhost:3000/webhooks/meta \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=<paste-signature>" \
  --data-binary @samples/meta-webhook-sample.json
```

3) Verify endpoint test:

```bash
curl -i "http://localhost:3000/webhooks/meta?hub.mode=subscribe&hub.verify_token=change-me-verify-token&hub.challenge=12345"
```
