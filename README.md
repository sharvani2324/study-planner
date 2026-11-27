#  STUDY PLANNER

> *"Plan Smart. Study Better. Achieve More."*

A modern, highly animated, student-focused full-stack web application built on the **MERN Stack** (MongoDB, Express.js, React.js, Node.js, and REST APIs). Designed as an all-in-one academic productivity platform for computer science students to organize their schedules, track milestone completion, visualize real-time progress, and clear academic doubts using an AI study coach.

---

##  Key Highlights

- **Full-Stack MERN Architecture:** Real MongoDB database integration, Express REST backend, and dynamic React frontend.
- **The 8 Core Subjects Supported:**
  1.  **DAA** — Design and Analysis of Algorithms
  2.  **BACKEND** — Node.js, Express, REST APIs & Database Design
  3.  **PYTHON** — Python Programming, Functions, OOP & Advanced Concepts
  4.  **MATHS** — Discrete & Engineering Mathematics, Matrices, Probability
  5.  **DBMS** — Database Management Systems, Normalization, SQL & Transactions
  6.  **WebDevelopment** — HTML, CSS, JavaScript, React & Web APIs
  7.  **ACS** — Advanced Communication Skills, Formal Writing & Debates
  8.  **PandS** — Probability & Statistics, Distributions & Hypothesis Testing
- **AI Smart Companion Suite:**
  -  **Focus Mode:** Pomodoro & custom focus timer linked to study plans, recording duration, confidence ratings & focus history.
  -  **AI Quizzes:** Instant question generation per subject & topic with immediate grading, explanations & XP awards.
  -  **AI Flashcards:** 3D animated flip cards with spaced repetition and difficult card tracking.
  -  **Identified Weak Areas:** Automatic detection of struggling topics with 1-click quiz practice and focus scheduling.
  -  **Monthly Analysis:** Month-by-month trends, daily completion heatmap & subject distribution.
  -  **Exam Countdown:** Days-remaining trackers with preparation roadmaps and urgency indicators.
  -  **Gamification & Daily Missions:** Leveling system, XP rewards, study streaks, and achievement badges.
  -  **Smart Recovery Plan:** AI reassessment for overdue tasks to rebalance your study load without burnout.
- **Complete CRUD Operations:** Create, Read, Update, Status toggle, and Delete study plans directly in MongoDB.
- **Real-Time Dynamic Analytics:** Overall completion percentages and subject-wise progress bars dynamically computed from MongoDB data across all 8 subjects.
- **Interactive Multi-View Calendar:** Day view, Week view, and Month view with timeline plotting.
- ** AI Doubt Assistant:** Integrated backend endpoint (`/api/ai/chat`) providing step-by-step algorithms, exam preparation roadmaps, practice problems, code snippets, and study plan advice across all 8 subjects.
- **Celebratory Animations:** Task completion transitions, confetti effects, smooth card entrances, and typing indicators.

---

##  Architecture & Project Structure

```text
study planner hackathon/
├── server/
│   ├── config/
│   │   └── db.js                 # Mongoose connection & DB lifecycle
│   ├── models/
│   │   ├── User.js               # Student schema with bcrypt hashing
│   │   └── StudyPlan.js          # Study plan schema (strictly 5 core subjects)
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification middleware
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Me, Profile update
│   │   ├── planController.js     # CRUD & dynamic MongoDB progress calculations
│   │   └── aiController.js       # AI Doubt Assistant with academic knowledge engine
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── planRoutes.js         # /api/study-plans
│   │   └── aiRoutes.js           # /api/ai
│   ├── .env                      # Server configuration & MongoDB URI
│   ├── package.json
│   └── server.js                 # Express server entry point
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js            # Frontend REST API client
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context & persistent tokens
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Sticky top bar with notifications & actions
│   │   │   ├── Sidebar.jsx       # Responsive desktop/mobile navigation sidebar
│   │   │   ├── DashboardCard.jsx # Animated metric statistics cards
│   │   │   ├── StudyPlanCard.jsx # Interactive study plan card with confetti toggle
│   │   │   ├── StudyPlanModal.jsx# Create & Edit modal (strictly the 5 subjects)
│   │   │   ├── NotificationPanel.jsx # Smart notifications dropdown
│   │   │   ├── Toast.jsx         # Animated toast alert feedback
│   │   │   └── LoadingSpinner.jsx# Animated loading state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Hero section, feature cards & subject showcase
│   │   │   ├── LoginPage.jsx     # Login with quick 1-click demo button
│   │   │   ├── RegisterPage.jsx  # Student registration
│   │   │   ├── DashboardPage.jsx # Greeting, dynamic metrics & today's study plans
│   │   │   ├── StudyPlansPage.jsx# Search, subject & status filter tabs, CRUD
│   │   │   ├── SchedulePage.jsx  # Day, Week, and Month calendar views
│   │   │   ├── ProgressPage.jsx  # Overall gauge & 5 subject-wise progress bars
│   │   │   ├── AIChatPage.jsx    # AI Doubt Assistant with subject selector & prompts
│   │   │   └── ProfilePage.jsx   # Student details, achievements & target hours
│   │   ├── index.css             # Vanilla CSS design system & keyframe animations
│   │   ├── App.jsx               # Root application router & view coordinator
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js            # Vite config with /api proxy
│   └── package.json
│
├── run-dev.js                    # Concurrent server + client launcher
├── verify.js                     # End-to-end verification test suite
└── package.json
```

---

##  Quick Start Guide

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally on `127.0.0.1:27017` (or provide a remote MongoDB URI in `server/.env`)

### Option 1: Run Concurrently (Recommended)
From the project root:
```bash
npm run dev
```
This automatically starts both the backend API server and the Vite React frontend.

### Option 2: Run Separately

**Terminal 1 — Backend:**
```bash
cd server
npm start
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173 or http://localhost:5174
```

---

##  Demo Login (1-Click Ready)

On the Login screen, click **"Quick Demo Student Login"** to immediately sign in as:
- **Email:** `sharvani@test.com`
- **Password:** `password123`

You can also register any new student account using the **Register** form.

---

##  REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register new student with hashed password | ❌ |
| `POST` | `/api/auth/login` | Authenticate student & receive JWT | ❌ |
| `GET` | `/api/auth/me` | Fetch currently logged-in student profile | ✅ |
| `PUT` | `/api/auth/profile` | Update student profile & study target | ✅ |
| `GET` | `/api/study-plans` | Get user study plans (supports subject/status/search query) | ✅ |
| `POST` | `/api/study-plans` | Create a new study plan in MongoDB | ✅ |
| `GET` | `/api/study-plans/progress` | Dynamically calculate overall & 5 subject-wise progress | ✅ |
| `GET` | `/api/study-plans/:id` | Get details of a single study plan | ✅ |
| `PUT` | `/api/study-plans/:id` | Edit/update an existing study plan | ✅ |
| `PUT` | `/api/study-plans/:id/status`| Toggle status (`Pending` ⟷ `Completed`) | ✅ |
| `DELETE` | `/api/study-plans/:id` | Delete study plan from MongoDB | ✅ |
| `POST` | `/api/ai/chat` | AI Doubt Assistant query with academic engine | ✅ |
| `GET` | `/api/health` | Backend service health check | ❌ |

---

##  Automated Verification

Run the built-in end-to-end verification script anytime:
```bash
node verify.js
```
This performs a full roundtrip test:
1. Backend health check
2. User authentication with JWT
3. Study plan creation across all 5 subjects
4. Reading and filtering plans
5. Updating status (`Pending` ➔ `Completed`)
6. Dynamic MongoDB progress calculations
7. AI Doubt Assistant queries
8. Frontend client availability check

---

##  Design Philosophy
- **Light Theme by Default:** Crisp, airy, focused atmosphere.
- **Subject-Specific Accents:**
  -  **DAA:** Vibrant Sky Blue
  -  **Backend:** Emerald Green
  -  **Python:** Warm Amber Gold
  -  **Maths:** Coral Orange
  -  **DBMS:** Soft Purple
- **Micro-Interactions:** Hover lift, confetti completion celebrations, animated counters, smooth dropdown transitions, and typing bubble indicators.
