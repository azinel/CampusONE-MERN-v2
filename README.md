# 🎓 CampusONE – Smart Campus Management System

> **A unified platform for students and administrators to manage complaints, campus events, mess services, notifications, and campus activities.**

<p align="center">
  <a href="https://campusonev2.netlify.app/">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-CampusONE-2ea44f?style=for-the-badge" />
  </a>
  <a href="https://github.com/azinel/CampusONE-MERN-v2">
    <img src="https://img.shields.io/badge/📂%20Source%20Code-GitHub-181717?style=for-the-badge&logo=github" />
  </a>
  <img src="https://img.shields.io/github/actions/workflow/status/azinel/CampusONE-MERN-v2/ci.yml?branch=main&style=for-the-badge&label=CI" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/BullMQ-E53935?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

---

## 📖 Overview

**CampusONE** is a full-stack **MERN-based smart campus management platform** designed to connect students and campus administrators through a single web application.

The platform centralizes campus operations including:

- Complaint management
- Mess services and feedback
- Campus events
- Notifications
- User management
- Administrative analytics

The system uses **JWT authentication** and **role-based access control (RBAC)** to provide separate capabilities for students and administrators.

Beyond basic CRUD functionality, the backend includes **pagination, filtering, search, sorting, validation, MongoDB indexing, aggregation pipelines, Redis caching, asynchronous job processing, automated testing, and CI/CD**.

<p align="center">
  <a href="https://campusonev2.netlify.app/">
    <strong>🚀 Visit Live Demo</strong>
  </a>
</p>

---

## ✨ Key Features

### 🎓 Student Portal

- 🔐 Secure registration and JWT-based authentication
- 📢 Submit and track campus complaints
- ⏱️ Track complaint status from **Pending → In Progress → Resolved**
- 🔎 Search, filter, sort and paginate complaint data
- 🍽️ View mess menus and submit meal feedback
- 📅 View upcoming campus events
- 🔔 Receive campus notifications
- 📊 View personal activity and dashboard statistics
- 👤 Manage profile information

### 🛡️ Admin Portal

- 📋 View and manage campus complaints
- 🚦 Update complaint status, priority and resolution
- 🔎 Filter, search, sort and paginate complaints
- 👥 Manage registered users
- 📅 Manage campus events
- 🍽️ Manage and monitor mess-related information
- 🔔 Manage campus notifications
- 📊 Access aggregation-based complaint analytics
- 📈 View complaint trends and category/priority/status breakdowns

---

## 🔐 Authentication & Authorization

CampusONE uses **JWT-based authentication** with role-based authorization.

### Roles

**Student**

- Access personal dashboard
- Submit complaints
- View own complaints
- Submit mess feedback
- View events and notifications

**Admin**

- Manage campus complaints
- Manage users
- Manage events and notifications
- Update complaint status and priority
- Access administrative analytics

Protected API routes use authentication middleware and role-based authorization to prevent unauthorized access.

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      React Client    │
                         │   Vite + Tailwind    │
                         └──────────┬───────────┘
                                    │
                              REST API / JWT
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Express Server    │
                         │ Controllers / Routes │
                         │ Middleware / Auth    │
                         └───────┬───────┬──────┘
                                 │       │
                    ┌────────────┘       └─────────────┐
                    ▼                                  ▼
          ┌──────────────────┐                ┌──────────────────┐
          │     MongoDB      │                │      Redis       │
          │    Mongoose      │                │ Cache / BullMQ   │
          └──────────────────┘                └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │ Notification     │
                                              │ Worker           │
                                              │     BullMQ       │
                                              └──────────────────┘
```

---

## 🧠 Backend Engineering

The backend goes beyond basic CRUD operations and implements several production-oriented patterns.

### 📄 Pagination, Filtering & Search

The Complaint API supports:

- Pagination with configurable limits
- Status filtering
- Priority filtering
- Category filtering
- Hostel and room filtering
- Student/admin scoped queries
- Case-insensitive search
- Whitelisted sorting fields
- Deterministic pagination ordering

Example:

```http
GET /api/complaints?page=2&limit=20&status=Pending&priority=High&sort=-createdAt
```

### 🗂️ MongoDB Indexing

Complaint query patterns are supported through targeted MongoDB indexes, including indexes for:

- Student + creation date
- Status + creation date
- Category
- Priority
- Creation date
- Update date

This reduces unnecessary collection scans for common queries.

### 📊 MongoDB Aggregation Analytics

Administrative analytics use MongoDB aggregation pipelines instead of loading all complaints into Node.js.

The analytics API provides:

- Total complaints
- Resolved / unresolved counts
- Status breakdown
- Priority breakdown
- Category breakdown
- Top complaint categories
- Complaint trends over time
- Hostel breakdown
- Resolution-time statistics

The implementation uses aggregation stages such as:

```text
$match
$facet
$group
$sort
$project
$filter
$cond
$limit
```

### ⚡ Redis Caching

Redis is used selectively for expensive and read-heavy operations.

Cached operations include:

- Complaint analytics
- Complaint listing queries
- Complaint details

Cache characteristics:

- Deterministic cache keys
- Student/admin scoped keys
- TTL-based expiration
- Mutation-based invalidation
- Fail-open behavior when Redis is unavailable

Redis is treated as a performance layer rather than a source of truth.

### 🔄 Asynchronous Notifications

Complaint-related notifications are processed asynchronously using **BullMQ + Redis**.

```text
Complaint Mutation
       │
       ▼
Express API
       │
       ├──────────────► HTTP Response
       │
       ▼
Notification Queue
       │
       ▼
BullMQ Worker
       │
       ▼
In-App Notification
```

The notification system includes:

- Dedicated background worker
- Retry handling
- Exponential backoff
- Deterministic job IDs
- Database-level idempotency
- Fail-open queue behavior

This keeps notification processing out of the critical API request path.

---

## 🧪 Testing

CampusONE uses the **Node.js native test runner** instead of requiring a third-party testing framework.

```bash
npm test
```

The test suite covers:

- Authentication
- JWT-protected routes
- Complaint CRUD
- Pagination
- Filtering
- Search
- Sorting
- Authorization boundaries
- Validation
- Error handling
- Analytics aggregation
- Redis caching
- Cache invalidation
- Redis failure fallback
- Notification queueing
- Worker processing
- Retry behavior
- Notification idempotency

Current test status:

```text
54 tests passed
0 tests failed
```

---

## 🔄 Continuous Integration

CampusONE uses **GitHub Actions** for automated CI.

Every push and pull request to `main` runs:

```text
1. Checkout repository
2. Set up Node.js 22
3. Start MongoDB service
4. Install client dependencies
5. Install server dependencies
6. Run backend tests
7. Run backend syntax checks
8. Build frontend
```

The workflow fails automatically if any validation step fails.

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide React
- React Router
- TanStack Query
- React Hook Form
- Zod
- Sonner

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- Redis
- ioredis
- BullMQ

### Development & DevOps

- Git
- GitHub
- GitHub Actions
- ESLint
- Nodemon
- Node.js Native Test Runner
- REST APIs

---

## 📂 Project Structure

```text
CampusONE-MERN/
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI
│
├── client/                         # React + Vite frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Application pages
│   │   ├── layouts/                # Dashboard layouts
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/                    # Utilities and API helpers
│   │   ├── services/               # API services
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── server/                         # Express + MongoDB backend
│   ├── src/
│   │   ├── config/                 # Database / Redis / queue config
│   │   ├── controllers/            # Business logic
│   │   ├── models/                 # Mongoose models
│   │   ├── routes/                 # API routes
│   │   ├── middlewares/            # Auth & validation
│   │   ├── queues/                 # BullMQ queues
│   │   ├── workers/                # Background workers
│   │   ├── utils/                  # Utility functions
│   │   ├── app.js                  # Express application
│   │   ├── index.js                # API server entry point
│   │   └── worker.js               # Worker entry point
│   │
│   ├── tests/                      # Backend test suites
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/azinel/CampusONE-MERN-v2.git
cd CampusONE-MERN-v2
```

### 2. Install Dependencies

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `server/` directory.

```env
PORT=5001

MONGO_URI=mongodb://127.0.0.1:27017/campusone

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

REDIS_URL=redis://127.0.0.1:6379
```

> **Note:** Never commit `.env` files or secret keys to GitHub.

For reference, see `server/.env.example`.

---

## ▶️ Running the Application

### Start Backend API

From the `server/` directory:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:5001
```

Health check:

```text
http://localhost:5001/health
```

### Start Frontend

From the `client/` directory:

```bash
npm run dev
```

### Start Notification Worker

The BullMQ notification worker runs independently:

```bash
cd server
npm run worker
```

For full local functionality, ensure **MongoDB and Redis** are running.

---

## 🔌 Core API Modules

| Module | Purpose |
|---|---|
| 🔐 Authentication | Registration, login, logout and current user |
| 📢 Complaints | Create, view, search, filter, sort and manage complaints |
| 👥 Users | User and role management |
| 📅 Events | Campus event management |
| 🍽️ Mess | Menus, ratings and feedback |
| 🔔 Notifications | In-app campus notifications |
| 📊 Dashboard | Statistics and activity data |
| 📈 Analytics | Aggregation-based administrative analytics |

---

## 🗃️ Database

CampusONE uses **MongoDB** with **Mongoose** for data persistence.

The main database is:

```text
campusone
```

Core entities include:

```text
Users
Complaints
Events
Notifications
Posts
Comments
Mess Data
```

---

## 🎨 UI & UX

CampusONE provides a responsive web interface with:

- 🌙 Dark / Light mode
- 📱 Responsive layouts
- 🎨 Consistent design system
- 🧩 Reusable UI components
- 🔔 Toast notifications
- 📊 Dashboard analytics
- ♿ Accessible form and interaction patterns
- ⚡ Fast client-side data fetching with TanStack Query

---

## 🔒 Security

The application implements:

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based authorization
- Request validation
- ObjectId validation
- Environment-based secret configuration
- Student data access boundaries
- Admin-only analytics and management operations
- Centralized error handling

---

## 🧪 Development

Run the frontend, API server and notification worker separately.

**Terminal 1 — Backend**

```bash
cd server
npm run dev
```

**Terminal 2 — Frontend**

```bash
cd client
npm run dev
```

**Terminal 3 — Notification Worker**

```bash
cd server
npm run worker
```

---

## 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

### 2. Create a feature branch

```bash
git checkout -b feature/AmazingFeature
```

### 3. Commit your changes

```bash
git commit -m "Add AmazingFeature"
```

### 4. Push the branch

```bash
git push origin feature/AmazingFeature
```

### 5. Open a Pull Request

---

## 📌 Project Status

CampusONE is an actively developed full-stack campus management platform.

### Current Capabilities

- ✅ Authentication & RBAC
- ✅ Student Dashboard
- ✅ Admin Dashboard
- ✅ Complaint Management
- ✅ Pagination, Filtering, Search & Sorting
- ✅ Request Validation
- ✅ MongoDB Indexing
- ✅ Centralized Error Handling
- ✅ MongoDB Aggregation Analytics
- ✅ Redis Caching
- ✅ Cache Invalidation
- ✅ BullMQ Asynchronous Notifications
- ✅ Retry & Idempotency
- ✅ Automated Backend Testing
- ✅ GitHub Actions CI
- ✅ Frontend Production Build

---

<div align="center">

## 🎓 CampusONE

**One platform. One campus. Connected.**

Built with ❤️ using the MERN stack.

</div>
