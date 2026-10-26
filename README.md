# Student Management System (S5 Micro Project)

A full-stack web application for school and student management built with React, Node.js/Express, and MySQL.

## Features

- **Role-Based Access Control**:
  - **Admin**: Manage students, teachers, parents, classes, fees, and announcements.
  - **Teacher**: Mark student attendance, input/manage subject marks.
  - **Student**: View personalized dashboard, subjects, attendance, and exam results.
  - **Parent**: Monitor student progress, attendance records, and announcements.
- **Modern UI**: Built with React, Tailwind CSS, Lucide Icons, and React Router.
- **RESTful API**: Node.js & Express server with JWT authentication and MySQL integration.

## Project Structure

```
├── client/              # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/  # Navbar, Sidebar, ProtectedRoute
│   │   ├── context/     # AuthContext (state management)
│   │   ├── pages/       # Admin, Teacher, Student, and Parent views
│   │   └── utils/       # Navigation and route helpers
├── server/              # Express backend & MySQL database
│   ├── config/          # Database configuration
│   ├── controllers/     # Route logic for auth, admin, teacher, etc.
│   ├── database/        # MySQL schema scripts
│   ├── middleware/      # JWT auth middleware
│   ├── routes/          # API route definitions
│   └── scripts/         # Database initialization scripts
└── package.json         # Root scripts to run both client & server
```

## Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- MySQL Server running locally (e.g. via XAMPP or MySQL Service)

### 2. Environment Configuration
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=student_management_db
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Database Setup
Make sure MySQL is running, then initialize the database tables:
```bash
npm run init-db
```

### 4. Install Dependencies
```bash
# Root dependencies (concurrently)
npm install

# Client dependencies
cd client && npm install

# Server dependencies
cd ../server && npm install
```

### 5. Running the Application
From the root directory:
```bash
npm run dev
```
- Client runs at: `http://localhost:5173`
- Backend API runs at: `http://localhost:5000`
