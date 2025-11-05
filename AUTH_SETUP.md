# Authentication Setup Guide

This document describes the end-to-end email/password authentication system implemented for the Excel Analytics Platform.

## Overview

The authentication system uses:
- **Backend**: Node.js + Express + TypeORM + MySQL
- **Frontend**: Next.js 14 + React Context API
- **Security**: JWT tokens, bcrypt password hashing
- **Database**: MySQL 8.0 (via Docker Compose)

## Architecture

### Backend Components

1. **Database** (`docker-compose.yml`)
   - MySQL 8.0 container
   - Database: `excel_analytics`
   - User: `analytics_user` / Password: `analytics_password`

2. **TypeORM Configuration** (`backend/src/config/data-source.js`)
   - MySQL connection setup
   - Auto-synchronization in development
   - Entity and migration management

3. **User Entity** (`backend/src/entities/User.js`)
   - Fields: id, name, email, password, createdAt, updatedAt
   - Password hashing with bcrypt (salt rounds: 10)
   - JWT token generation
   - Email validation

4. **Authentication Middleware** (`backend/src/middleware/auth.js`)
   - JWT token verification
   - Protects routes from unauthorized access
   - Attaches user to request object

5. **Auth Routes** (`backend/src/routes/auth.js`)
   - `POST /api/auth/signup` - Register new user
   - `POST /api/auth/login` - Login with email/password
   - `GET /api/auth/me` - Get current user (protected)
   - `POST /api/auth/verify` - Verify JWT token (protected)

6. **Protected Routes**
   - `POST /api/upload` - File upload (requires authentication)
   - `POST /api/analyze` - File analysis (requires authentication)

### Frontend Components

1. **Auth Context** (`frontend/src/contexts/AuthContext.tsx`)
   - Global authentication state management
   - Token persistence in localStorage
   - Login/signup/logout functions
   - Auto-verification on page load

2. **Sign In Page** (`frontend/src/app/signin/page.tsx`)
   - Email/password login form
   - Error handling
   - Redirect to home on success
   - Link to sign up page

3. **Sign Up Page** (`frontend/src/app/signup/page.tsx`)
   - Registration form (name, email, password, confirm password)
   - Client-side validation
   - Error handling
   - Redirect to home on success
   - Link to sign in page

4. **Protected Home Page** (`frontend/src/app/page.tsx`)
   - Redirects to `/signin` if not authenticated
   - Shows navigation bar with user info
   - Sign out functionality
   - Protected file upload/analysis features

5. **File Upload Component** (`frontend/src/components/FileUpload.tsx`)
   - Includes JWT token in API requests
   - Authorization header: `Bearer {token}`

## Setup Instructions

### 1. Start MySQL Database

```bash
# From project root
docker compose up -d

# Verify MySQL is running
docker compose ps
```

### 2. Configure Backend Environment

```bash
# Create .env file in backend directory
cd backend
cp .env.example .env

# Edit .env and set:
# - JWT_SECRET (use a strong random string in production)
# - E2B_API_KEY (optional, for advanced analytics)
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Start Development Servers

```bash
# From project root, run both servers:
npm run dev

# Or run separately:

# Terminal 1 - Backend (http://localhost:3001)
cd backend
npm run dev

# Terminal 2 - Frontend (http://localhost:3000)
cd frontend
npm run dev
```

## Testing the Authentication

### 1. Sign Up
1. Navigate to http://localhost:3000
2. You'll be redirected to `/signin`
3. Click "Sign Up" link
4. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
5. Click "Sign Up"
6. You'll be automatically logged in and redirected to home

### 2. File Upload (Protected)
1. After signing in, you should see:
   - Navigation bar with your name
   - Sign Out button
   - File upload area
2. Upload an Excel file to test protected functionality

### 3. Sign Out
1. Click "Sign Out" button in navigation
2. You'll be redirected to `/signin`
3. Try accessing http://localhost:3000 - you'll be redirected back to signin

### 4. Sign In
1. Navigate to http://localhost:3000/signin
2. Enter email: test@example.com
3. Enter password: password123
4. Click "Sign In"
5. You'll be redirected to home page

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login

### Protected Endpoints (Require Authorization Header)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify` - Verify token
- `POST /api/upload` - Upload file
- `POST /api/analyze` - Analyze file

### Authorization Header Format
```
Authorization: Bearer <jwt_token>
```

## Security Features

1. **Password Security**
   - Passwords hashed with bcrypt (10 salt rounds)
   - Never stored in plain text
   - Password field excluded from queries by default

2. **JWT Tokens**
   - Signed with secret key (HS256)
   - 7-day expiration (configurable)
   - Stored in localStorage (frontend)
   - Verified on every protected request

3. **Input Validation**
   - Email format validation
   - Password minimum length (6 characters)
   - Request sanitization with express-validator

4. **Database Security**
   - Unique email constraint
   - Prepared statements (SQL injection protection)
   - TypeORM parameterized queries

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Error Handling

### Common Errors

1. **"Invalid credentials"** - Wrong email or password
2. **"User already exists with this email"** - Email already registered
3. **"Not authorized to access this route"** - Missing or invalid token
4. **"Token verification failed"** - Expired or malformed token

## Environment Variables

### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=analytics_user
DB_PASSWORD=analytics_password
DB_NAME=excel_analytics

# Authentication
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Optional
E2B_API_KEY=your_e2b_api_key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Production Considerations

1. **JWT_SECRET**: Use a strong random string (minimum 32 characters)
2. **Database**: Use managed MySQL service (AWS RDS, Google Cloud SQL, etc.)
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure allowed origins specifically
5. **Rate Limiting**: Add rate limiting to auth endpoints
6. **Password Policy**: Enforce stronger password requirements
7. **Token Storage**: Consider using httpOnly cookies instead of localStorage
8. **Refresh Tokens**: Implement refresh token rotation

## Troubleshooting

### Database Connection Failed
- Ensure MySQL container is running: `docker compose ps`
- Check database credentials in `.env`
- Verify network connectivity

### Token Verification Failed
- Check JWT_SECRET matches between signup and login
- Verify token hasn't expired
- Clear localStorage and sign in again

### Frontend Can't Connect to Backend
- Verify NEXT_PUBLIC_API_URL in `.env.local`
- Check backend is running on port 3001
- Look for CORS errors in browser console

## File Structure

```
experiment/
├── docker-compose.yml                 # MySQL container
├── backend/
│   ├── .env                          # Environment variables
│   ├── src/
│   │   ├── index.js                  # Server entry + TypeORM init
│   │   ├── config/
│   │   │   └── data-source.js        # TypeORM configuration
│   │   ├── entities/
│   │   │   └── User.js               # User entity + helpers
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT verification middleware
│   │   └── routes/
│   │       ├── auth.js               # Auth endpoints
│   │       ├── upload.js             # Protected upload
│   │       └── analyze.js            # Protected analysis
└── frontend/
    ├── .env.local                    # Frontend config
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx            # Root layout + AuthProvider
    │   │   ├── page.tsx              # Protected home page
    │   │   ├── signin/
    │   │   │   └── page.tsx          # Sign in page
    │   │   └── signup/
    │   │       └── page.tsx          # Sign up page
    │   ├── contexts/
    │   │   └── AuthContext.tsx       # Auth state management
    │   └── components/
    │       └── FileUpload.tsx        # Protected file upload
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify all environment variables are set
3. Check browser and server console logs
4. Ensure database is running and accessible
