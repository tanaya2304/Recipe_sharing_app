# 🍳 TasteLog - Recipe Sharing Platform

A full-stack recipe sharing platform with user authentication, social features, and real-time analytics.

## 📁 Project Structure

```
tastelog/
├── frontend/          # Frontend (HTML, CSS, JavaScript)
├── backend/           # Backend API (Node.js + Express + PostgreSQL)
└── README.md          # This file
```

## 🚀 Quick Start on Localhost

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Setup Environment Variables

Create `backend/.env`:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 3. Run Both Servers

**Terminal 1 - Backend (port 5000):**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend (port 3000):**
```bash
cd frontend
npm start
```

### 4. Access the App

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

## 📦 What's Included?

### Frontend Features
- ✅ User authentication (signup/login)
- ✅ Recipe browsing & searching
- ✅ Recipe creation & editing
- ✅ Like, comment, rate recipes
- ✅ Save favorite recipes
- ✅ User dashboard with analytics
- ✅ Dark/light mode toggle
- ✅ Responsive design

### Backend Features
- ✅ REST API with Express.js
- ✅ PostgreSQL database with 11 tables
- ✅ JWT authentication
- ✅ 6 database triggers (auto-points, badges, notifications)
- ✅ Demo data seeding
- ✅ CORS enabled

## 🗄️ Database Tables

1. **users** - User accounts
2. **recipes** - All recipes
3. **recipe_likes** - Like system
4. **recipe_comments** - Comments
5. **recipe_ratings** - 5-star ratings
6. **recipe_views** - View tracking
7. **recipe_favorites** - Saved recipes
8. **user_follows** - Follow system
9. **badges** - Achievement badges
10. **user_badges** - User-earned badges
11. **notifications** - Notification system

## 🔑 Demo Login

```
Email: gordon@demo.com
Password: demo123
```

## 📖 Documentation

- **Frontend:** See `frontend/README.md`
- **Backend:** See `backend/README.md`

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- http-server for development

**Backend:**
- Node.js + Express.js
- PostgreSQL (Neon/Replit Database)
- JWT Authentication
- bcrypt for password hashing

## 🌐 API Endpoints

All API endpoints are prefixed with `/api`:

- `/api/users/*` - User operations
- `/api/recipes/*` - Recipe CRUD & interactions
- `/api/notifications/*` - Notification system

See `backend/README.md` for complete API documentation.

## 📝 License

MIT License - Feel free to use this project for learning or building your own recipe platform!

---

**Built with ❤️ by TasteLog Team**
