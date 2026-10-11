# DevMomentum REST API

A lightweight Node.js + Express REST API that provides authentication, user profile management, personalised roadmaps, task management, progress analytics, and admin reporting for the DevMomentum placement-preparation planner.

> **Implements**: [Issue #45 — feat: Build REST API for DevMomentum](https://github.com/revatikadam0607/DevMomentum/issues/45)

---

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Endpoints](#endpoints)
  - [Health](#health)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Roadmaps](#roadmaps)
  - [Tasks](#tasks)
  - [Analytics](#analytics)
  - [Admin](#admin)
- [Authentication Flow](#authentication-flow)
- [Error Responses](#error-responses)
- [Running Tests](#running-tests)
- [Architecture](#architecture)

---

## Quick Start

```bash
# From the project root:
cd api

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env

# Start the development server (hot-reload)
npm run dev

# The API is now available at:
# http://localhost:3001
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `JWT_SECRET` | *(required)* | Secret for access tokens |
| `JWT_EXPIRES_IN` | `7d` | Access token lifetime |
| `JWT_REFRESH_SECRET` | *(required)* | Secret for refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh token lifetime |
| `CORS_ORIGIN` | `*` | Allowed frontend origin |

---

## Endpoints

All endpoints are prefixed with `/api`.

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | ❌ | Server health check |

**Response**
```json
{ "status": "ok", "service": "DevMomentum API", "version": "1.0.0", "timestamp": "..." }
```

---

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register a new user |
| POST | `/api/auth/login` | ❌ | Log in |
| POST | `/api/auth/logout` | ✅ | Log out (revoke token) |
| POST | `/api/auth/refresh` | ❌ | Refresh access token |
| POST | `/api/auth/forgot-password` | ❌ | Request password-reset link |
| POST | `/api/auth/reset-password` | ✅ | Reset password |

**Register / Login request**
```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "SecurePass1!" }
```

**Register / Login response**
```json
{
  "success": true,
  "data": {
    "user": { "uid": "...", "name": "Ada Lovelace", "email": "ada@example.com", "role": "user", ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | ✅ | Get own profile |
| PUT | `/api/users/me` | ✅ | Update name |
| PATCH | `/api/users/me/availability` | ✅ | Update study hours |

**PATCH /api/users/me/availability body**
```json
{ "weekdayHours": 3, "weekendHours": 5 }
```

---

### Roadmaps

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/roadmaps` | ✅ | List own roadmaps |
| POST | `/api/roadmaps` | ✅ | Create a roadmap |
| GET | `/api/roadmaps/:id` | ✅ | Get a roadmap |
| PUT | `/api/roadmaps/:id` | ✅ | Update a roadmap |
| POST | `/api/roadmaps/:id/regenerate` | ✅ | Regenerate roadmap schedule |
| DELETE | `/api/roadmaps/:id` | ✅ | Delete a roadmap |

**POST /api/roadmaps body**
```json
{ "title": "DSA Interview Prep — Oct 2026", "tasks": [] }
```

---

### Tasks

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tasks` | ✅ | List tasks (filterable) |
| POST | `/api/tasks` | ✅ | Create a task |
| GET | `/api/tasks/:id` | ✅ | Get a task |
| PUT | `/api/tasks/:id` | ✅ | Update a task |
| PATCH | `/api/tasks/:id/complete` | ✅ | Mark task as complete |
| PATCH | `/api/tasks/:id/reschedule` | ✅ | Reschedule a task |
| DELETE | `/api/tasks/:id` | ✅ | Delete a task |

**GET /api/tasks query parameters**

| Parameter | Values | Description |
|---|---|---|
| `category` | `DSA`, `Development`, `DSA-Sheet`, `Revision` | Filter by category |
| `completed` | `true` \| `false` | Filter by completion state |
| `roadmapId` | UUID | Filter by roadmap |

**POST /api/tasks body**
```json
{
  "title": "Implement binary search",
  "category": "DSA",
  "difficulty": "medium",
  "dueDate": "2026-10-01",
  "priority": "high",
  "roadmapId": "optional-uuid"
}
```

**PATCH /api/tasks/:id/reschedule body**
```json
{ "newDate": "2026-10-10" }
```

---

### Analytics

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/progress` | ✅ | Overall progress + streaks + XP |
| GET | `/api/analytics/statistics` | ✅ | Category breakdown + weekly/monthly |

**GET /api/analytics/progress response**
```json
{
  "success": true,
  "data": {
    "total": 42,
    "completed": 18,
    "pending": 24,
    "completionPercentage": 43,
    "currentStreak": 3,
    "longestStreak": 7,
    "xp": 360
  }
}
```

---

### Admin

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/admin/analytics` | ✅ | admin | Aggregated platform statistics |

---

## Authentication Flow

```
Client                         API
  │                             │
  ├── POST /api/auth/register ──▶
  │◀── { accessToken, refreshToken }
  │                             │
  ├── GET /api/tasks            │
  │   Authorization: Bearer <accessToken>
  │◀── 200 tasks                │
  │                             │
  │   (token expires)           │
  ├── POST /api/auth/refresh ───▶
  │   { refreshToken }          │
  │◀── { accessToken (new) }    │
  │                             │
  ├── POST /api/auth/logout ────▶
  │   Authorization: Bearer <accessToken>
  │◀── 200 logged out           │
```

---

## Error Responses

All error responses follow this shape:

```json
{
  "success": false,
  "error": "Human-readable message.",
  "errors": [ ... ]  // only present on validation failures (422)
}
```

| Status | Meaning |
|---|---|
| 400 | Bad request / business-logic error |
| 401 | Missing or invalid token |
| 403 | Authenticated but not authorised |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 422 | Validation failed |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Running Tests

```bash
cd api
npm install
npm test
```

Jest + Supertest integration tests cover:

- User registration, login, logout
- Token refresh and revocation
- Task CRUD
- Task completion and rescheduling
- Analytics endpoints
- Unauthenticated-access rejection

---

## Architecture

```
api/
├── src/
│   ├── server.js              # Entry point
│   ├── app.js                 # Express setup, middleware, routes
│   ├── controllers/           # Business logic
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── roadmap.controller.js
│   │   ├── task.controller.js
│   │   ├── analytics.controller.js
│   │   └── admin.controller.js
│   ├── routes/                # Express routers
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── roadmap.routes.js
│   │   ├── task.routes.js
│   │   ├── analytics.routes.js
│   │   └── admin.routes.js
│   ├── middleware/            # Auth, validation, error handling
│   │   ├── auth.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   ├── models/
│   │   └── store.js           # In-memory store (swap for DB in production)
│   └── utils/
│       ├── jwt.js             # Token signing & verification
│       └── respond.js         # Consistent response helpers
├── __tests__/
│   ├── auth.test.js
│   └── tasks.test.js
├── .env.example
└── package.json
```

### Design Decisions

| Decision | Rationale |
|---|---|
| In-memory store | No database dependency for a PR contribution — easily swapped for MongoDB/PostgreSQL |
| JWT access + refresh | Industry-standard stateless auth with revocation support |
| express-validator | Declarative input validation, matches issue acceptance criteria |
| Helmet + rate-limit | Security hardening out of the box |
| No framework | Stays consistent with DevMomentum's philosophy of lightweight dependencies |
