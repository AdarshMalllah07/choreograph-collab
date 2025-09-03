# Choreograph Collab - Backend

Node.js + Express + MongoDB (Mongoose) backend with JWT authentication.

## Requirements
- Node 18+
- MongoDB 6+

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment:
```bash
copy .env.example .env  # on Windows PowerShell use: cp .env.example .env
# Edit .env values as needed
```

3. Run in development:
```bash
npm run dev
```

4. Build and run:
```bash
npm run build
npm start
```

### Environment variables
- PORT: API port (default 5000)
- MONGODB_URI: Mongo connection string
- JWT_SECRET: Secret for signing JWT tokens
- CORS_ORIGIN: Allowed origins (comma-separated)

## API
Base URL: `/api`

- Auth
  - POST `/auth/signup` — body: `{ name, email, password }`
  - POST `/auth/login` — body: `{ email, password }`

- Projects (requires `Authorization: Bearer <token>`)
  - GET `/projects` — list projects for current user
  - POST `/projects` — body: `{ name }`

- Tasks (requires `Authorization: Bearer <token>`)
  - GET `/projects/:projectId/tasks`
  - POST `/projects/:projectId/tasks` — body: `{ title, description?, status?, order? }`
  - PATCH `/projects/:projectId/tasks/:taskId` — body: any of `{ title, description, status, order }`
  - DELETE `/projects/:projectId/tasks/:taskId`

Health check: GET `/health`
