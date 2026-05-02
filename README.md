# ⚡ TaskFlow — Team Task Manager

A full-stack team task management app with role-based access control (Admin/Member), built with React, Node.js, Express, and MongoDB.

## 🚀 Live Demo
> **[Live URL on Railway →](https://your-app.railway.app)**

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, React Router v6 |
| Styling | Vanilla CSS (dark mode, glassmorphism) |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcrypt |
| Deployment | Railway |

## ✨ Features

- 🔐 **Authentication** — Signup & Login with JWT
- 👥 **Role-Based Access** — Admin vs Member permissions
- 📁 **Project Management** — Create, update, delete projects; manage members
- ✅ **Task Management** — Kanban board (Todo / In Progress / Done)
- 📊 **Dashboard** — Stats, completion rate, overdue task tracking
- 🛡 **Admin Panel** — User management, role assignment
- ⚠️ **Overdue Detection** — Visual alerts for past-due tasks

## 🔒 RBAC Matrix

| Action | Admin | Member |
|---|---|---|
| Create/Delete projects | ✅ | ❌ |
| Add/Remove members | ✅ | ❌ |
| Create/Delete tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks) |
| Manage users | ✅ | ❌ |
| View assigned tasks | ✅ | ✅ |

## 📡 REST API

### Auth
```
POST /api/auth/register   — Register (first user auto-Admin)
POST /api/auth/login      — Login, returns JWT
GET  /api/auth/me         — Get current user
```

### Projects
```
GET    /api/projects          — List projects
POST   /api/projects          — Create project [Admin]
GET    /api/projects/:id      — Get project details
PUT    /api/projects/:id      — Update project [Admin]
DELETE /api/projects/:id      — Delete project + tasks [Admin]
POST   /api/projects/:id/members         — Add member [Admin]
DELETE /api/projects/:id/members/:userId — Remove member [Admin]
```

### Tasks
```
GET    /api/tasks         — List tasks (filterable)
POST   /api/tasks         — Create task [Admin]
GET    /api/tasks/:id     — Get task
PUT    /api/tasks/:id     — Update task (Admin full, Member: status only)
DELETE /api/tasks/:id     — Delete task [Admin]
```

### Users (Admin only)
```
GET    /api/users           — List all users
PUT    /api/users/:id/role  — Change user role
DELETE /api/users/:id       — Delete user
GET    /api/dashboard/stats — Dashboard statistics
```

## 🏃 Run Locally

### Backend
```bash
cd backend
npm install
# Create .env with MONGODB_URI, JWT_SECRET, PORT
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

> Frontend runs on `http://localhost:5173`, proxied to backend at `http://localhost:5000`

## 🌐 Deploy on Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set environment variables:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — Any random secret string
   - `NODE_ENV=production`
4. Build command: `npm run build`
5. Start command: `node backend/server.js`

## 📁 Project Structure

```
├── backend/
│   ├── controllers/   # Business logic
│   ├── middleware/    # Auth + RBAC
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API endpoints
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/       # Axios client
│       ├── context/   # AuthContext
│       ├── components/# Layout, reusable UI
│       └── pages/     # Dashboard, Projects, Tasks, Users
├── railway.json
└── README.md
```

---
Built by [Abhishek](https://github.com/abhishekpgrm) · TaskFlow 2024
