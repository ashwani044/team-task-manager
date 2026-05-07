# TaskFlow — Team Task Manager

A full-stack team task management application with a Kanban-style task board, role-based access control, and project-based organisation. Built with React + Vite on the frontend and Node.js + Express + PostgreSQL on the backend.

Live Project Link - https://hearty-celebration-production.up.railway.app/

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Database Setup](#1-database-setup)
  - [2. Server Setup](#2-server-setup)
  - [3. Client Setup](#3-client-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Roles & Permissions](#roles--permissions)
- [Database Schema](#database-schema)

---

## Features

- **Authentication** — JWT-based signup and login with password hashing via bcrypt
- **Role-based access control** — `Admin` and `Member` roles with enforced route-level permissions
- **Project management** — Admins can create, update, delete projects and add members
- **Kanban Task Board** — Tasks organised into three columns: **To Do**, **In Progress**, and **Done**
- **Task management** — Create tasks with a title, description, due date, status, and assignee
- **Protected routes** — All pages behind authentication; unauthenticated users redirected to `/auth`
- **Responsive SPA** — Client-side routing via React Router

---

## Tech Stack

**Frontend**
- React 19 + Vite 8
- React Router DOM v7
- Axios

**Backend**
- Node.js + Express 5
- PostgreSQL (via `pg`)
- JSON Web Tokens (`jsonwebtoken`)
- bcryptjs
- express-validator
- dotenv, cors

---

## Project Structure

```
team-task-manager/
├── client/                     # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   └── TaskBoard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Express backend
    ├── config/
    │   ├── db.js
    │   └── createTables.js
    ├── controllers/
    │   ├── authController.js
    │   ├── projectController.js
    │   └── taskController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── roleMiddleware.js
    │   └── validate.js
    ├── routes/
    │   ├── auth.js
    │   ├── projects.js
    │   └── tasks.js
    ├── .env
    ├── index.js
    └── package.json
```

---

## Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** v9+

---

## Getting Started

### 1. Database Setup

Create a PostgreSQL database and user:

```sql
CREATE USER taskadmin WITH PASSWORD 'password123';
CREATE DATABASE teamtaskmanager OWNER taskadmin;
```

Then run the table creation script (after configuring the server `.env`):

```bash
cd server
npm run createTables
```

### 2. Server Setup

```bash
cd server
npm install
```

Copy the example environment file and fill in your values (see [Environment Variables](#environment-variables)):

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev        # uses nodemon for hot-reload
# or
npm start          # plain node
```

The API will be available at `http://localhost:5000`.

### 3. Client Setup

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/teamtaskmanager
JWT_SECRET=your_super_secret_key_change_this_in_production
```

> **Important:** Never commit your `.env` file. Change `JWT_SECRET` to a long, random string before deploying.

---

## API Reference

All protected routes require an `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Endpoint   | Auth | Body                                      | Description        |
|--------|------------|------|-------------------------------------------|--------------------|
| POST   | `/signup`  | No   | `name`, `email`, `password`, `role?`      | Register a user    |
| POST   | `/login`   | No   | `email`, `password`                       | Login, returns JWT |

### Projects — `/api/projects`

| Method | Endpoint           | Auth  | Role  | Description               |
|--------|--------------------|-------|-------|---------------------------|
| GET    | `/`                | Yes   | Any   | List all projects         |
| POST   | `/`                | Yes   | Admin | Create a project          |
| PUT    | `/:id`             | Yes   | Admin | Update a project          |
| DELETE | `/:id`             | Yes   | Admin | Delete a project          |
| POST   | `/:id/members`     | Yes   | Admin | Add a member to a project |

### Tasks — `/api/tasks`

| Method | Endpoint | Auth  | Role       | Description     |
|--------|----------|-------|------------|-----------------|
| GET    | `/`      | Yes   | Any        | List tasks      |
| POST   | `/`      | Yes   | Any        | Create a task   |
| PUT    | `/:id`   | Yes   | Any        | Update a task   |
| DELETE | `/:id`   | Yes   | Admin      | Delete a task   |

---

## Roles & Permissions

| Action                        | Admin | Member |
|-------------------------------|:-----:|:------:|
| View dashboard & projects     | ✅    | ✅     |
| View task board               | ✅    | ✅     |
| Create & update tasks         | ✅    | ✅     |
| Delete tasks                  | ✅    | ❌     |
| Create / update / delete projects | ✅ | ❌   |
| Add members to projects       | ✅    | ❌     |

---

## Database Schema

```
users
  id           SERIAL PRIMARY KEY
  name         VARCHAR(100)
  email        VARCHAR(100) UNIQUE
  password     VARCHAR(255)
  role         VARCHAR(20)  DEFAULT 'Member'  -- 'Admin' | 'Member'
  created_at   TIMESTAMP

projects
  id           SERIAL PRIMARY KEY
  name         VARCHAR(100)
  description  TEXT
  created_by   INTEGER → users(id)
  created_at   TIMESTAMP

project_members
  project_id   INTEGER → projects(id)
  user_id      INTEGER → users(id)
  PRIMARY KEY (project_id, user_id)

tasks
  id           SERIAL PRIMARY KEY
  title        VARCHAR(150)
  description  TEXT
  status       VARCHAR(20)  DEFAULT 'todo'  -- 'todo' | 'in-progress' | 'done'
  due_date     DATE
  assigned_to  INTEGER → users(id)
  project_id   INTEGER → projects(id)
  created_at   TIMESTAMP
```