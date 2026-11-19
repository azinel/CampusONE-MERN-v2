# 🎓 CampusONE — Smart Campus Management Platform

A full-stack campus management platform designed to centralize student services, automate administrative workflows, and improve campus operations through scalable REST APIs, optimized database queries, asynchronous processing, and real-time application experiences.

**Live Demo:** https://campusonev2.netlify.app/  
**Repository:** https://github.com/azinel/CampusONE-MERN-v2

---

## Overview

CampusONE provides a unified platform for students and administrators to manage campus activities, report complaints, discover events, access mess information, and monitor institutional operations.

Beyond its user-facing functionality, the project focuses on building reliable backend systems with:

- Efficient REST API design
- Pagination, filtering, searching, and sorting
- Request validation and centralized error handling
- MongoDB indexing and aggregation pipelines
- Redis caching and cache invalidation
- Asynchronous notification processing using BullMQ
- Automated testing and CI/CD pipelines

The goal was to build more than a CRUD application by applying practical software engineering principles to a real-world campus management problem.

## Key Engineering Highlights

| Engineering Area | Implementation |
|---|---|
| API Design | RESTful APIs with consistent response structures |
| Query Optimization | Pagination, filtering, search, sorting, MongoDB indexes |
| Validation | Centralized request validation and ObjectId validation |
| Error Handling | Centralized error middleware and standardized API errors |
| Analytics | MongoDB aggregation pipelines using `$match`, `$group`, `$facet`, `$project` and more |
| Caching | Redis caching with TTL, scoped cache keys and invalidation |
| Async Processing | BullMQ notification queues with retries and exponential backoff |
| Reliability | Idempotent notification creation and graceful failure handling |
| Testing | Node.js native test runner, assertions and mocked dependencies |
| CI/CD | GitHub Actions with automated backend tests and frontend builds |
| Deployment | Netlify, Render, MongoDB Atlas, Upstash Redis and Cloudinary |

---

## Features

### 1. Authentication & Authorization
- User registration and login.
- JWT-based authentication.
- Role-based access control for students and administrators.
- Protected routes and authorization middleware.
- Persistent authenticated application sessions.

### 2. Complaint Management System
- Students can submit and track campus complaints.
- Complaint categorization and priority management.
- Complaint status updates and resolution tracking.
- Image attachments through Cloudinary.
- Administrative complaint assignment and monitoring.
- Complaint timelines and activity tracking.

### 3. Advanced REST API Querying

Implemented reusable querying capabilities for complaint endpoints:

- **Pagination:** Page-based pagination with configurable limits and a maximum limit of 100.
- **Filtering:** Filter by status, priority, category, hostel, room number and assigned administrator.
- **Search:** Search complaint titles and descriptions.
- **Sorting:** Whitelisted sorting fields with deterministic ordering.
- **Validation:** Validate query parameters, request bodies and MongoDB ObjectIds.
- **Access Control:** Restrict sensitive filters to authorized administrators.

These improvements make API endpoints more efficient and predictable as datasets grow.

### 4. MongoDB Indexing & Query Optimization

Added indexes to support frequently executed queries:

- Student complaints ordered by creation date.
- Complaints grouped by status and creation date.
- Category and priority filtering.
- Creation and update timestamp sorting.

Indexes reduce unnecessary collection scans and improve query performance for common access patterns.

### 5. Administrative Analytics Dashboard

Implemented an analytics endpoint using MongoDB aggregation pipelines.

**Aggregation techniques used:**
- `$match` for filtering records.
- `$facet` for parallel analytics computations.
- `$group` for statistical aggregation.
- `$sort` for ranking and ordering.
- `$project` for response shaping.
- `$filter` and `$cond` for conditional calculations.
- `$limit` for top-category results.

**Analytics include:**
- Total complaints and overview metrics.
- Status and priority distributions.
- Category-wise complaint breakdown.
- Top complaint categories.
- Monthly complaint trends.
- Hostel-wise statistics.
- Average resolution time using actual resolution timestamps.

### 6. Redis Caching

Integrated Redis using `ioredis` to reduce repeated database queries.

**Implementation details:**
- Cache frequently requested complaint lists.
- Cache complaint details.
- Cache administrative analytics.
- Different TTLs for different data types.
- User-scoped cache keys to prevent cross-user data leakage.
- Normalized query parameters for deterministic cache keys.
- Cache invalidation after complaint mutations.
- Pattern-based invalidation for related cached data.
- Fail-open behavior when Redis is unavailable.
- Non-blocking connection initialization and Redis PING verification.

| Cached Data | TTL |
|---|---:|
| Complaint lists | 60 seconds |
| Complaint details | 120 seconds |
| Admin analytics | 300 seconds |

### 7. Asynchronous Notifications with BullMQ

Implemented background notification processing using BullMQ and Redis.

Instead of performing notification operations directly within request-response execution, complaint-related notification jobs are dispatched to a queue.

**Engineering details:**
- Dedicated notification queue.
- Separate worker process.
- Asynchronous job processing.
- Three retry attempts.
- Exponential backoff starting at 1 second.
- Deterministic job IDs.
- Idempotent notification creation to prevent duplicates.
- Graceful queue failure handling.

This separates notification processing from the main API request lifecycle.

### 8. Centralized Error Handling

Implemented centralized error handling for consistent API behavior.

Handles:
- Custom API errors.
- Mongoose validation errors.
- Invalid MongoDB ObjectIds.
- Duplicate key errors.
- JWT errors.
- Multer upload errors.
- Async route rejections.

Also includes request-level validation and cleanup of temporary uploaded files when requests fail.

### 9. Testing

Built an automated backend test suite using Node.js native testing tools.

**Testing stack:**
- `node:test`
- `node:assert/strict`
- Mock Redis client
- Mock notification queue
- Test setup helpers

Test coverage includes:

- Authentication.
- Complaint APIs.
- Administrative analytics.
- Redis caching.
- Error handling.
- Notification queue behavior.

**Latest reported result: 56 tests passed, 0 failures.**

### 10. CI/CD with GitHub Actions

Implemented an automated GitHub Actions workflow.

Pipeline includes:

1. Trigger on pushes and pull requests to `main`.
2. Set up Node.js 22.
3. Install dependencies using `npm ci`.
4. Start a MongoDB service container.
5. Execute backend tests.
6. Run backend syntax checks.
7. Build the React frontend.
8. Report pipeline success or failure.

This helps detect regressions before changes are merged into the main branch.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| UI Components | Radix UI, shadcn/ui, Lucide |
| State & Data Fetching | TanStack Query |
| Forms & Validation | React Hook Form, Zod |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Caching | Redis, ioredis |
| Background Jobs | BullMQ |
| Authentication | JWT |
| Image Storage | Cloudinary |
| Testing | Node.js Test Runner, Assert |
| CI/CD | GitHub Actions |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |

## System Architecture

```text
                    CampusONE Client
                     React + Vite
                          |
                          | HTTPS / REST APIs
                          v
                  Express.js API Server
                          |
             +------------+------------+
             |            |            |
             v            v            v
          MongoDB       Redis       Cloudinary
          Atlas         Cache       Image Storage
             |            |
             |            |
             |       BullMQ Queue
             |            |
             |            v
             |     Notification Worker
             |            |
             +------------+
```

The API server handles synchronous application requests, while BullMQ workers process background jobs independently.

## Project Structure

```text
CampusONE-MERN-v2/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── layouts/
│       ├── lib/
│       ├── pages/
│       ├── routes/
│       └── services/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── queues/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── workers/
│   │   ├── app.js
│   │   ├── index.js
│   │   └── worker.js
│   │
│   ├── tests/
│   ├── seed-demo.js
│   └── package.json
│
└── .github/
    └── workflows/
        └── ci.yml
```

## Local Setup

### Prerequisites

- Node.js 22
- npm
- MongoDB
- Redis

### 1. Clone the repository

```bash
git clone https://github.com/azinel/CampusONE-MERN-v2.git
cd CampusONE-MERN-v2
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create `server/.env` using `server/.env.example`.

Configure:

```env
NODE_ENV=development
PORT=5001

MONGO_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

REDIS_URL=redis://127.0.0.1:6379

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

### 3. Start the backend

```bash
npm run dev
```

### 4. Start the notification worker

In another terminal:

```bash
cd server
npm run worker
```

The worker requires a reachable Redis instance.

### 5. Configure the frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

### 6. Start the frontend

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5001`

---

## Running Tests

From the repository root:

```bash
npm --prefix server test
```

Run backend syntax checks:

```bash
npm --prefix server run check
```

Build the frontend:

```bash
cd client
npm run build
```

## Deployment

| Service | Platform |
|---|---|
| Frontend | Netlify |
| Backend API | Render |
| Database | MongoDB Atlas |
| Redis | Upstash |
| Image Storage | Cloudinary |

The API and notification worker are separate processes. The worker requires a continuously running execution environment and a reachable Redis instance.

Configure production environment variables through the hosting provider rather than committing credentials to Git.

---

## Engineering Decisions & Trade-offs

Some of the engineering decisions in CampusONE were made to improve reliability and maintainability:

- **Pagination over unbounded queries:** Limits response sizes and database work.
- **Indexes over repeated collection scans:** Supports frequently used filtering and sorting patterns.
- **Redis caching over repeated aggregation queries:** Reduces database load for frequently requested analytics.
- **Cache invalidation after mutations:** Keeps cached data from remaining stale beyond its TTL.
- **Asynchronous notification processing:** Keeps notification work outside the main request lifecycle.
- **Idempotent notification creation:** Helps prevent duplicate notifications during job retries.
- **Centralized error handling:** Makes error responses consistent and easier to maintain.
- **Automated tests and CI:** Helps detect regressions before deployment.

## Future Improvements

- Transactional outbox pattern for reliable database-to-queue event delivery.
- Route-level frontend code splitting and bundle optimization.
- Persistent backend profile updates.
- Expanded integration and load testing.
- Observability through structured logs and performance metrics.
- More granular cache performance monitoring.

---

## Author

**Aditya Kumar**  
Computer Science & Engineering Student

GitHub: https://github.com/azinel

---

*CampusONE is an engineering-focused full-stack project demonstrating practical application development, backend optimization, asynchronous processing, database design, automated testing, and deployment.*
