# MPloyChek Intern Challenge

MPloyChek is a full-stack background verification dashboard built with Angular, Angular Material, Express, MongoDB, JWT authentication, and Socket.IO.

The application includes a polished authentication screen, demo login access, role-based dashboards, verification records, profile status tracking, user administration, audit logs, and simulated API delay handling.

## Features

- JWT login with access and refresh tokens
- One-click demo login for Admin and General User roles
- Role-based routing and protected API access
- Admin user management
- Verification status updates
- Audit log tracking for important actions
- Record dashboard with loading skeletons and simulated delay
- User profile with verification progress
- Clean, responsive, professional UI
- Docker Compose setup for MongoDB, backend, and frontend

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Angular 21, Angular Material, SCSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Realtime | Socket.IO |
| DevOps | Docker, Docker Compose, Nginx |

## Project Structure

```text
mploychek-intern-challenge/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   `-- server.ts
|   |-- Dockerfile
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   `-- app/
|   |-- proxy.conf.json
|   |-- Dockerfile
|   |-- nginx.conf
|   `-- package.json
|-- docker-compose.yml
`-- README.md
```

## Demo Credentials

Use these accounts after the seed data is created automatically on backend startup.

| Role | User ID | Password |
| --- | --- | --- |
| Admin | `USR001` | `password123` |
| General User | `USR002` | `password123` |

The login page also includes one-click demo buttons for both roles.

## Run With Docker

From the project root:

```bash
docker compose up --build
```

Then open:

```text
http://localhost:4200
```

Docker starts:

- MongoDB on `localhost:27017`
- Backend API on `localhost:3000`
- Frontend on `localhost:4200`

## Run Locally

### 1. Start MongoDB

Make sure MongoDB is running locally on:

```text
mongodb://localhost:27017/mploychek
```

Or start only MongoDB with Docker:

```bash
docker compose up mongo
```

### 2. Configure Backend Environment

Create `backend/.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/mploychek
JWT_SECRET=mploychek_super_secret_key_2026
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=mploychek_refresh_secret_2026
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Start Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

Seed data is inserted automatically if the users collection is empty.

### 4. Start Frontend

In a second terminal:

```bash
cd frontend
npm install
npm start
```

The frontend uses `frontend/proxy.conf.json` so `/api` requests are proxied to the backend during development.

Open the Angular URL shown in the terminal, usually:

```text
http://localhost:4200
```

If port `4200` is already in use, Angular will ask to use another port. The proxy still works.

## Useful Scripts

### Backend

```bash
npm run dev      # Start backend in development mode
npm run build    # Compile TypeScript
npm start        # Run compiled backend
```

### Frontend

```bash
npm start        # Start Angular dev server with API proxy
npm run build    # Build production frontend
npm test         # Run frontend tests
```

## API Overview

Base URL:

```text
http://localhost:3000/api
```

When using the Angular dev server, call the API through the frontend origin:

```text
/api
```

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Login and receive access/refresh tokens |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | Logout response |

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users/me` | Authenticated | Get current user profile |
| `GET` | `/api/users` | Admin | Get all users |
| `POST` | `/api/users` | Admin | Create user |
| `PUT` | `/api/users/:userId` | Admin | Update user |
| `DELETE` | `/api/users/:userId` | Admin | Deactivate user |

### Records

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/records` | Authenticated | Get visible records |
| `GET` | `/api/records?delay=1000` | Authenticated | Get records with simulated delay |
| `GET` | `/api/records/:recordId` | Authenticated | Get one record |
| `PUT` | `/api/records/:recordId/status` | Admin | Update record status |
| `GET` | `/api/records/audit/logs` | Admin | Get audit logs |

### Health Check

```text
GET /api/health
```

## Roles

### Admin

- View all users
- Create users
- Deactivate users
- Update verification status
- View all verification records
- View audit logs

### General User

- View own profile
- View own verification records
- Track own verification status

## Verification Status Values

```text
Pending
InReview
Verified
Flagged
```

## Development Notes

- Frontend API calls use `/api`.
- Local Angular development requires `proxy.conf.json` to forward `/api` to `http://localhost:3000`.
- Backend seeds demo users and records automatically on first run.
- Passwords are hashed with bcrypt before storage.
- Protected backend routes require a bearer token.

## Build Verification

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm run build
```
