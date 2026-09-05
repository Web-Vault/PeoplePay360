# PeoplePay360 — HR & Payroll Management Platform

**PeoplePay360** is an end-to-end enterprise HR and Payroll management platform for Indian organizations. It unifies employee records, contracts, attendance, time off, salary structures, payroll calculation, payslip generation, and AI-backed payroll auditing into one secure SaaS platform.

> Current implementation: **Phases 1–3** (Project Setup, Database Models + Seed Data, Authentication + JWT + RBAC). Modules such as Employee CRUD, payroll computation, and the AI audit engine are scheduled for Phases 4+.

---

## 🏗️ Tech Stack

| Layer      | Technologies                                                                 |
|------------|------------------------------------------------------------------------------|
| Frontend   | **React 18**, **Vite**, **Tailwind CSS**, **React Router v6**, **Axios**, **Lucide React**, **Recharts** (pre-installed for Phase 4 dashboard) |
| Backend    | **Node.js**, **Express**, **MongoDB**, **Mongoose ODM**                      |
| Security   | **JWT** (jsonwebtoken), **bcryptjs** (password hashing), **Helmet**, **CORS**, **express-rate-limit**, **express-validator** |
| Arch       | Modular: `routes → controllers → services → models`                         |

---

## 📁 Folder Structure

```
peoplepay360/
├── client/                          # React + Vite frontend
│   ├── src/
│   │   ├── components/common/       # Button, Input, Card
│   │   ├── layouts/                 # AppLayout (sidebar + header + role nav)
│   │   ├── pages/                   # Login, Unauthorized, PlaceholderPage
│   │   ├── routes/                  # AppRoutes, ProtectedRoute
│   │   ├── services/                # api.js (axios), authService.js
│   │   ├── context/AuthContext.jsx  # JWT session provider
│   │   ├── hooks/                   # (reserved for Phase 4+)
│   │   ├── utils/                   # constants.js, helpers.js
│   │   ├── constants/               # (reserved)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── server/                          # Node + Express backend
│   ├── config/db.js                 # Mongoose connection
│   ├── controllers/authController.js
│   ├── middleware/                  # authMiddleware, roleMiddleware, errorMiddleware
│   ├── models/                      # 14 Mongoose schemas
│   ├── routes/authRoutes.js
│   ├── services/authService.js
│   ├── validators/authValidator.js  # express-validator
│   ├── seed/seed.js                 # Indian demo data (npm run seed)
│   ├── utils/                       # (reserved)
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
│
└── README.md
```

---

## 🔧 Installation

### 1. Prerequisites

- **Node.js** ≥ 18
- **MongoDB** ≥ 6 (local instance running on default port **27017**, or update `MONGO_URI`)

### 2. Clone / Navigate

```bash
cd peoplepay360
```

### 3. Install dependencies

**Server**
```bash
cd server
npm install
```

**Client**
```bash
cd ../client
npm install
```

### 4. MongoDB Setup

Start your local MongoDB instance, e.g.:
```bash
# Using mongod
mongod --dbpath <your_data_folder>

# Or using MongoDB as a Windows service — ensure it's started.
```

Default connection string (see `.env.example`):
```
MONGO_URI=mongodb://localhost:27017/peoplepay360
```

### 5. Environment variables

Copy `.env.example` → `.env` and tweak values if needed. The repo already ships starter `.env` files with development defaults:

**server/.env.example**
```
MONGO_URI=mongodb://localhost:27017/peoplepay360
JWT_SECRET=replace_with_secure_secret
JWT_EXPIRES_IN=1d
PORT=5000
CLIENT_URL=http://localhost:5173
```

**client/.env.example**
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🌱 Seed Command

Creates 14 collections with **realistic Indian demo data** (INR salaries, Indian addresses, IFSC codes, 5 departments, 16 employees, contracts, attendance for 30 days, leave types / allocations / requests, 2 salary structures, 9 salary rules, demo payrun, payslips and payroll audits, plus 5 users with bcrypt-hashed passwords):

```bash
cd server
npm run seed
```

---

## ▶️ Run Commands

**Backend** (runs on `http://localhost:5000`)
```bash
cd server
npm run dev
```

**Frontend** (runs on `http://localhost:5173`)
```bash
cd client
npm run dev
```

Open **http://localhost:5173** to access PeoplePay360.

---

## 🔑 Demo Credentials

Every account uses the same secure development password:

```
Password: Admin@123
```

| Role              | Email                              | Role Key          | Access                                                                                                  |
|-------------------|------------------------------------|-------------------|---------------------------------------------------------------------------------------------------------|
| 🛡️ Admin          | `admin@peoplepay360.com`           | `admin`           | Everything — Dashboard, Employees, Contracts, Attendance, Time Off, Payroll, Salary Structures/Rules, Reports |
| 💼 HR Manager     | `hr@peoplepay360.com`              | `hr_manager`      | Dashboard, Employees, Contracts, Attendance, Time Off                                                 |
| 💵 Payroll User   | `payroll@peoplepay360.com`         | `payroll_user`    | Dashboard, Employees, Contracts, Attendance, Time Off, Payroll                                         |
| 💰 Payroll Manager| `payrollmanager@peoplepay360.com`  | `payroll_manager` | Dashboard, Employees, Contracts, Attendance, Time Off, Payroll, Salary Structures/Rules, Reports       |
| 👤 Employee       | `employee@peoplepay360.com`        | `employee`        | Dashboard, My Profile, My Attendance, My Time Off, My Payslips, Explain My Salary                      |

---

## 🔐 Authentication Flow

1. User submits **Email + Password** to `POST /api/auth/login`.
2. Server validates input with `express-validator` (required fields, email format, password ≥ 8 chars).
3. Rate limit: max **5 login attempts per 15 minutes** per IP (`express-rate-limit`).
4. User is looked up by email, `bcrypt.compare()` verifies the password hash.
5. `isActive` flag is checked (inactive → **401**).
6. A JWT is signed with payload `{ userId, role }` using `JWT_SECRET`, expires per `JWT_EXPIRES_IN`.
7. `lastLogin` is updated.
8. Response returns `{ token, user }` (never `passwordHash`).
9. Frontend stores `{token, user}` in `localStorage` under key `auth`.
10. On every subsequent request, **axios interceptor** attaches `Authorization: Bearer <token>`.
11. On app mount, `AuthContext` validates the stored session by calling `GET /api/auth/me`.
12. Any **401** response clears the local session and redirects to `/login`.

---

## 🛡️ RBAC Roles

| Role               | Code                 | Typical Responsibilities                                                        |
|--------------------|----------------------|---------------------------------------------------------------------------------|
| Admin              | `admin`              | System configuration, cross-module access, user management                     |
| HR Manager         | `hr_manager`         | Hiring, employee records, contracts, attendance, time off approvals            |
| Payroll User       | `payroll_user`       | Runs payroll, reviews inputs, generates pay runs                                |
| Payroll Manager    | `payroll_manager`    | Approves payroll, configures salary structures & rules, reports                 |
| Employee           | `employee`           | Self-service: profile, attendance, leave, payslips, explain salary             |

Role-based access is enforced **both** on the frontend (ProtectedRoute) and the backend (`authorizeRoles(...)` middleware). Never rely solely on frontend guards.

---

## ✅ Current Implementation Status

### Phase 1 — Project Setup
- ✅ `/client` React + Vite + Tailwind + Router + Axios + Lucide + Recharts scaffolding
- ✅ `/server` Node + Express + MongoDB + Mongoose + JWT + bcryptjs + security packages
- ✅ Clean folder structure: `routes → controllers → services → models`
- ✅ Environment files + `.env.example` references

### Phase 2 — Database Models + Seed
- ✅ All 14 Mongoose schemas (`users`, `departments`, `employees`, `contracts`, `workingSchedules`, `attendance`, `timeOffTypes`, `timeOffAllocations`, `timeOffRequests`, `salaryStructures`, `salaryRules`, `payruns`, `payslips`, `payrollAudits`)
- ✅ `ObjectId` references across collections; no duplicated employee snapshots except in `Payslip.employeeSnapshot` (intentional)
- ✅ All required indexes (unique compounds on attendance, allocations, payslips; email / employeeCode etc.)
- ✅ Seed script: Indian demo data, INR salaries, 5 departments, 16 employees, contracts, attendance, leaves, 2 structures, 9 rules, sample payrun/payslips/audits, 5 demo users with bcrypt hashes

### Phase 3 — Authentication + JWT + RBAC
- ✅ `POST /api/auth/login` with validation, rate limiting
- ✅ `GET /api/auth/me` (JWT protected)
- ✅ `authenticate` middleware (Bearer token → JWT → user lookup → isActive check)
- ✅ `authorizeRoles(...roles)` middleware (returns 403)
- ✅ Centralized error middleware, standard responses: `{success, message, data}` / `{success, message, errors}`
- ✅ Frontend `AuthContext`, `ProtectedRoute`, `/unauthorized` page
- ✅ Split-screen enterprise Login page (show/hide password, loading state, inline + backend validation)
- ✅ Role-based sidebar navigation (5 distinct menus)
- ✅ Placeholder pages for all Phase 4 modules
- ✅ Logout clears session
- ✅ Helmet, CORS, login rate limiting, JWT expiry, no `passwordHash` in responses

---

## 🚧 Next Phase Roadmap (Phase 4+)

These are intentionally **not implemented** yet, per scope:

| Phase/Module          | Planned Capabilities                                                                          |
|-----------------------|-----------------------------------------------------------------------------------------------|
| Employees CRUD        | Full roster management, profiles, document upload, onboarding                                |
| Contracts CRUD        | Contract lifecycle, revisions, approval workflows, expiry reminders                          |
| Attendance CRUD       | Check in/check out, regularisation, reports, imports                                         |
| Time Off              | Policy engine, approvals, carry-forward, comp off accruals                                   |
| Salary Engine         | Calculation engine for Salary Rules, `contract_basic`, `percentage`, `formula` evaluators    |
| Payroll Engine        | Pay run creation, compute, validate, pay, payslip PDF                                        |
| Explain My Salary     | LLM-backed natural language payslip explainer                                                |
| What-if Simulator     | Interactive salary impact simulator (promotions, bonuses, HRA change, tax)                   |
| Dashboard             | Recharts-based executive HR & Payroll KPIs                                                   |
| AI Audit Engine       | Payroll audit types: missing_contract, expired_contract, salary_anomaly, duplicate_payslip, missing_bank_details, missing_checkout, excessive_overtime, calculation_error, missing_salary_structure, leave_balance_issue → auditScore + criticalIssues + warningIssues |
| Reports               | Compliance reports (PF, PT, ESI, TDS), Form 16, salary register, cost center                 |

---

## 📚 API Response Format

**Success (2xx)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": { "id": "...", "name": "...", "email": "...", "role": "admin", "employeeId": null }
  }
}
```

**Error (4xx / 5xx)**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": []
}
```

### Status Codes Used
- `200` OK
- `201` Created
- `400` Validation error
- `401` Unauthenticated / invalid credentials / inactive / missing JWT
- `403` Forbidden (insufficient role)
- `404` Not Found
- `409` Conflict (duplicate key / resource already exists)
- `500` Internal Server Error

---

## 🧪 Testing Checklist (Manual Verification)

After setup:
1. MongoDB connects successfully on backend start
2. `npm run seed` runs without errors (14 collections populated)
3. Admin login ✅ → dashboard
4. HR login ✅ → dashboard
5. Payroll user login ✅ → dashboard
6. Payroll manager login ✅ → dashboard
7. Employee login ✅ → dashboard
8. Invalid email → validation error (400)
9. Invalid password length → validation error (400)
10. Empty email → validation error (400)
11. Empty password → validation error (400)
12. Wrong password → 401
13. Inactive user → 401
14. Missing JWT on `/me` → 401
15. Tampered JWT → 401
16. Employee hitting `/salary-structures` → 403 → `/unauthorized`
17. `/api/auth/me` returns current user without passwordHash
18. Logout clears `localStorage.auth` and redirects to `/login`

---

© 2024 PeoplePay360
