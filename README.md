# 🎓 CampusONE – Smart Campus Management System

> **A unified platform for students and administrators to manage complaints, campus events, mess services, notifications, and campus activities.**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## 📖 Overview

**CampusONE** is a full-stack **MERN-based smart campus management platform** designed to connect students and campus administrators through a single web application.
<p align="center">
  <a href="https://campusonev2.netlify.app/">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-CampusONE-2ea44f?style=for-the-badge" />
  </a>
  <a href="https://github.com/azinel/CampusONE-MERN-v2">
    <img src="https://img.shields.io/badge/📂%20Source%20Code-GitHub-181717?style=for-the-badge&logo=github" />
  </a>
</p>
The platform provides centralized management for campus complaints, mess feedback, events, notifications, user management, and administrative analytics.

The system uses **role-based access control (RBAC)** to provide different capabilities to students and administrators.

---

## ✨ Key Features

### 🎓 Student Portal

- 🔐 Secure registration and JWT-based authentication
- 📢 Submit and track campus complaints
- ⏱️ Track complaint status from **Pending → In Progress → Resolved**
- 🍽️ View mess menus and submit meal feedback
- 📅 View upcoming campus events
- 🔔 Receive campus notifications
- 📊 View personal activity and dashboard statistics
- 👤 Manage profile information

### 🛡️ Admin Portal

- 📋 View and manage campus complaints
- 🚦 Update complaint status and priority
- 👥 Manage registered users
- 📅 Manage campus events
- 🍽️ Manage and monitor mess-related information
- 🔔 Manage campus notifications
- 📊 View campus statistics and analytics
- 🔎 Monitor complaints by category, priority, and status

---

## 🔐 Authentication & Authorization

CampusONE uses **JWT-based authentication** with role-based authorization.

### Roles

**Student**
- Access personal dashboard
- Submit complaints
- View personal complaints
- Submit mess feedback
- View events and notifications

**Admin**
- Manage complaints across the campus
- Manage users
- Manage events and notifications
- Access administrative analytics

Protected API routes use authentication middleware and role-based authorization to prevent unauthorized access.

---

## 🏗️ System Architecture

```text
┌──────────────────────────┐
│        React Client      │
│       Vite + Tailwind    │
└────────────┬─────────────┘
             │ REST API
             ▼
┌──────────────────────────┐
│      Express Server      │
│   Controllers + Routes   │
│ Middleware + JWT Auth    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│         MongoDB          │
│       Mongoose ODM       │
└──────────────────────────┘
```

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
- JWT Authentication
- bcrypt
- Multer
- Cloudinary

### Development

- Git & GitHub
- ESLint
- Nodemon
- REST APIs

---

## 📂 Project Structure

```text
CampusONE-MERN/
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
│   │   ├── controllers/            # Business logic
│   │   ├── models/                 # Mongoose models
│   │   ├── routes/                 # API routes
│   │   ├── middlewares/            # Auth & validation
│   │   ├── utils/                  # Utility functions
│   │   └── index.js                # Server entry point
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
```

> **Note:** Never commit `.env` files or secret keys to GitHub.

---

## ▶️ Running the Application

### Start Backend

From the `server/` directory:

```bash
npm run dev
```

The API will run on:

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

The Vite development server will provide the local frontend URL.

---

## 🔌 Core API Modules

CampusONE exposes REST APIs for the major campus operations.

| Module | Purpose |
|---|---|
| 🔐 Authentication | Registration, login, logout, current user |
| 📢 Complaints | Create, view, update and track complaints |
| 👥 Users | User and role management |
| 📅 Events | Campus event management |
| 🍽️ Mess | Menus, ratings and feedback |
| 🔔 Notifications | Campus notifications |
| 📊 Dashboard | Statistics and activity data |

---

## 🗃️ Database

CampusONE uses **MongoDB** with **Mongoose** for data persistence.

The main database is:

```text
campusone
```

Example entities include:

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

The application implements several security mechanisms:

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based authorization
- Request validation
- Environment-based secret configuration
- Restricted administrative operations
- Secure HTTP-only authentication patterns where applicable

---

## 🧪 Development

Run the frontend and backend separately during development.

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

CampusONE is actively being developed as a full-stack campus management platform.

Current modules include:

- ✅ Authentication & RBAC
- ✅ Student Dashboard
- ✅ Admin Dashboard
- ✅ Complaint Management
- ✅ Mess Management
- ✅ Events
- ✅ Notifications
- ✅ User Management
- ✅ Dashboard Analytics

---

<div align="center">

## 🎓 CampusONE

**One platform. One campus. Connected.**

Built with ❤️ using the MERN stack.

</div>
