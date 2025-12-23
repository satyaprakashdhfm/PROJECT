# Wealthwise - Expense Management Platform

A simple MERN stack application for managing daily expenses, budgets, and financial goals.

## Project Structure

```
PROJECT/
├── backend/          # Node.js + Express + MongoDB backend
├── frontend/         # React + TypeScript frontend
├── endpoints.txt     # API documentation
└── project_description.txt
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
yarn install
```

3. Create `.env` file:
```bash
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. Initialize database:
```bash
yarn init-db
```

5. Start backend server:
```bash
yarn dev
```

Backend runs on http://localhost:3000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Start frontend development server:
```bash
yarn dev
```

Frontend runs on http://localhost:5173

## Features

### User Features
- **Authentication**: Secure signup and login
- **Dashboard**: Overview of expenses and spending patterns
- **Expense Management**: Add, view, and delete expenses
- **Budget Management**: Create category-wise budgets
- **Financial Goals**: Track progress toward savings goals
- **Export**: Download expense reports (Excel/PDF)

### Categories
- Food
- Travel
- Shopping
- Bills
- Other

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18
- TypeScript
- React Router
- Vite
- CSS-in-JS (no external UI libraries)

## API Endpoints

See `endpoints.txt` for complete API documentation.

Base URL: `http://localhost:3000/api/v1`

Key routes:
- `/auth` - Authentication
- `/expense` - Expense management
- `/budgets` - Budget management
- `/goals` - Goal management
- `/dashboard` - Dashboard statistics
- `/import` - Import expenses
- `/export` - Export reports

## Design Philosophy

This project follows a **simple and clean** approach:
- No complex UI frameworks
- Straightforward component structure
- Minimal dependencies
- Clear and concise code
- Easy to understand and maintain

## Development

Both backend and frontend support hot reload for development.

**Backend**: Uses nodemon for auto-restart
**Frontend**: Uses Vite for fast HMR

## Default Credentials

After running the init-db script, you can create a new account via the signup page.

## License

MIT
