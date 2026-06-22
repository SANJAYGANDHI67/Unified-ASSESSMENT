# Unified Assessment Platform

A complete full-stack assessment system with Admin, Instructor, and Student roles.

## Tech Stack

### Backend
- Node.js
- Express
- MySQL
- mysql2/promise
- bcrypt
- jsonwebtoken
- dotenv

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

## Database Setup

1. Create MySQL database:
```sql
mysql -u root -p < database/schema.sql
```

2. Update `backend/.env` with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=unified_assessment_final
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
```

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example` and update values

4. Start server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

Server runs on `http://localhost:5000`

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## Project Structure

```
backend/
 ├─ config/db.js
 ├─ middleware/auth.middleware.js
 ├─ controllers/
 │   ├─ auth.controller.js
 │   ├─ assessment.controller.js
 │   ├─ submission.controller.js
 │   └─ admin.controller.js
 ├─ services/
 │   ├─ assessment.service.js
 │   ├─ submission.service.js
 │   └─ admin.service.js
 ├─ routes/
 │   ├─ auth.routes.js
 │   ├─ assessment.routes.js
 │   ├─ submission.routes.js
 │   └─ admin.routes.js
 └─ server.js

frontend/
 ├─ src/
 │  ├─ lib/api.js
 │  ├─ components/
 │  │   ├─ StatCard.jsx
 │  │   └─ ProtectedRoute.jsx
 │  ├─ pages/
 │  │   ├─ auth/Login.jsx
 │  │   ├─ student/
 │  │   ├─ instructor/
 │  │   └─ admin/
 │  ├─ App.jsx
 │  └─ main.jsx
```

## Features

### Student
- View published assessments
- Attempt assessments
- Submit answers
- View submissions

### Instructor
- Create and edit assessments
- Add questions (MCQ and Text)
- Publish assessments
- View analytics
- Review AI questions (UI only)

### Admin
- User management with pagination
- System statistics
- System logs (UI only)
- Settings (UI only)

## Notes

- AI question generation is not yet implemented (UI only)
- System logging is not yet implemented (UI only)
- All authentication uses JWT tokens
- Role-based access control enforced on all routes

