# Smart Link Hub Generator

A dynamic link aggregation platform that intelligently adapts content based on user-defined rules and contextual parameters. Built for creators, educators, freelancers, and organizations who need to share multiple links through a single, smart URL.

## 🎯 Features

### Core Functionality
- **Smart Link Management**: Add, delete, and manage multiple links through an intuitive dashboard
- **Dynamic Rule Engine**: Configure time-based and device-based rules to optimize link display
- **Analytics Dashboard**: Track clicks, unique visitors, and CTR for all your links
- **Public Hub URLs**: Each hub gets a unique shareable URL (`/hub/:slug`)
- **Modern UI**: Clean black & green theme with responsive design

### Technical Highlights
- RESTful API with Express.js backend
- SQLite database with better-sqlite3
- React + TypeScript frontend with Vite
- Framer Motion animations
- Real-time analytics tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Advitiya
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Set up environment variables**

Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=./database.sqlite
```

5. **Start the backend server**
```bash
cd backend
npm start
```

The backend will run on `http://localhost:3001`

6. **Start the frontend development server**
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5174`

## 📚 API Documentation

### Authentication
**Note**: Currently running in demo mode with localStorage-based auth.

#### POST `/api/auth/signup`
Create a new user account.
```json
Request: { "email": "user@example.com" }
Response: { "success": true, "user": { "id": 1, "email": "user@example.com" } }
```

#### POST `/api/auth/login`
Login to existing account.
```json
Request: { "email": "user@example.com" }
Response: { "success": true, "user": { "id": 1, "email": "user@example.com" } }
```

### Link Management

#### GET `/api/links`
Retrieve all links for the current hub.
```json
Response: [
  {
    "id": 1,
    "hub_id": 1,
    "title": "My Portfolio",
    "url": "https://example.com",
    "clicks": 42,
    "position": 0,
    "is_active": 1
  }
]
```

#### POST `/api/links`
Create a new link.
```json
Request: { "title": "GitHub", "url": "https://github.com/username" }
Response: { "id": 2, "title": "GitHub", "url": "https://github.com/username", "clicks": 0 }
```

#### DELETE `/api/links/:id`
Delete a link by ID.
```json
Response: { "success": true }
```

### Analytics

#### GET `/api/stats`
Get hub statistics.
```json
Response: {
  "totalClicks": "156",
  "uniqueVisitors": "42",
  "ctr": "4.8%"
}
```

#### POST `/api/analytics`
Record an analytics event.
```json
Request: { "link_id": 1, "event_type": "click" }
Response: { "success": true }
```

### Public Hub

#### GET `/api/hub/:slug`
Get public hub view with rule-optimized links.
```json
Response: {
  "id": 1,
  "slug": "demo-hub",
  "title": "Demo Hub",
  "description": "My smart link hub",
  "links": [...]
}
```

## 🏗️ Project Structure

```
Advitiya/
├── backend/
│   ├── routes/
│   │   └── api.js          # API route handlers
│   ├── db.js               # Database wrapper
│   ├── rulesEngine.js      # Smart rule evaluation
│   ├── index.js            # Express server
│   ├── schema.sql          # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   ├── Hero.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   └── supabaseClient.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
└── README.md
```

## 🗄️ Database Schema

### Tables
- **users**: User accounts
- **hubs**: Link hub configurations
- **links**: Individual links within hubs
- **rules**: Smart display rules
- **analytics**: Click and visit tracking

See `backend/schema.sql` for complete schema.

## 🎨 Tech Stack

### Backend
- **Express.js** - Web framework
- **better-sqlite3** - Fast SQLite database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Tailwind CSS** - Styling

## 🔧 Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production

**Backend**:
```bash
cd backend
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
npm run preview
```

## 🚢 Deployment

### Backend (Render/Railway/Heroku)
1. Create new web service
2. Set environment variables
3. Deploy from Git repository
4. Note the deployment URL

### Frontend (Vercel/Netlify)
1. Connect Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

### Environment Variables
Update frontend API base URL to point to deployed backend.

## 📊 Rule Engine

The rule engine supports:
- **Time-based rules**: Show/hide links based on time of day
- **Device-based rules**: Different links for mobile vs desktop
- **Performance rules**: Auto-promote frequently clicked links

Rules are evaluated in priority order and applied to the public hub view.

## 🔒 Security

- Input validation on all API endpoints
- Error handling middleware
- CORS configuration
- SQL injection prevention via parameterized queries

## 🤝 Contributing

This is a hackathon project for IIT Ropar's Advitiya event.

## 📝 License

MIT

## 👥 Authors

- Your Name - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- IIT Ropar Advitiya Team
- Problem statement designers
