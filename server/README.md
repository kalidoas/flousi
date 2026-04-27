# Flousi Server

Express + Prisma + PostgreSQL backend for Flousi with JWT cookie auth, losses, goals, analytics, and Railway deployment.

## Local setup

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

```bash
copy .env.example .env
```

3. Generate Prisma client and run migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start the server

```bash
npm run dev
```

5. Run tests

```bash
npm test
```

## Production env vars

Set these in Railway:

- `NODE_ENV=production`
- `PORT=4000` (Railway usually injects this, but keep `PORT` supported)
- `CLIENT_ORIGIN=https://<your-vercel-app>.vercel.app`
- `DATABASE_URL=<your Neon PostgreSQL connection string>`
- `JWT_SECRET=<long-random-secret>`
- `JWT_EXPIRES_IN=7d`
- `COOKIE_NAME=flousi_token`
- `TRUST_PROXY=true`

## Railway deployment

1. Create a Railway project and connect the `server` folder/repo.
2. Add the environment variables above.
3. Point `DATABASE_URL` to your Neon PostgreSQL connection string.
4. Run Prisma migrations once in Railway (or during deploy):

```bash
npm run prisma:deploy
```

5. Start command:

```bash
npm start
```

6. Verify the health endpoint:

```bash
/api/health
```

## Neon database setup

1. Create a Neon project and copy the pooled PostgreSQL connection string.
2. Paste it into `DATABASE_URL` in Railway.
3. Make sure SSL is enabled in the connection string.

## API reference

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me` (protected)

### Budget

- `GET /api/budget` (protected)
- `PUT /api/budget` (protected)

### Losses

- `GET /api/losses?period=day|week|month|all` (protected)
- `POST /api/losses` (protected)
- `PUT /api/losses/:id` (protected)
- `DELETE /api/losses/:id` (protected)

### Analytics

- `GET /api/analytics/by-category?period=day|week|month|all` (protected)
- `GET /api/analytics/by-day?period=day|week|month|all` (protected)

### Goals

- `GET /api/goals` (protected)
- `POST /api/goals` (protected)
- `PUT /api/goals/:id` (protected)
- `DELETE /api/goals/:id` (protected)
- `POST /api/goals/:id/contribute` (protected)
- `GET /api/goals/:id/impact` (protected)
- `PUT /api/goals/:id/achieve` (protected)


## Request examples

### Register

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Yassine"
}
```

### Login

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Update budget

```json
{
  "monthlyIncome": 12000
}
```

