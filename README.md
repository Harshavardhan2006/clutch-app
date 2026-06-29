# Clutch ⚡ — AI Productivity Companion

> Never miss a deadline again.

Clutch is a chat-based AI productivity companion that helps users plan, track, and complete goals before deadlines. Built for the **Vibe2Ship Hackathon 2026** — Problem Statement 1: The Last-Minute Life Saver.

## 🔗 Links

- **Live App:** https://clutch-app-500518.web.app
- **GitHub:** https://github.com/Harshavardhan2006/clutch-app
- **Project Doc:** https://docs.google.com/document/d/1A49dRo1Dm88xC6tVqxaRxN2bP3M1NizwHhRbcyauI44/edit?usp=sharing

---

## 🧠 What is Clutch?

Most productivity apps remind you. Clutch actually helps you get it done.

Tell Clutch your goal and deadline in plain language. The Gemini-powered agent autonomously breaks it into a day-by-day action plan, monitors your progress, detects when you're falling behind, and dynamically replans — all through a natural conversational interface.

---

## ✨ Key Features

- **Agentic AI** — Gemini 2.5 Flash with function calling executes real backend actions (not just chat responses)
- **Five Agent Tools** — `create_plan`, `update_progress`, `get_status`, `replan`, `list_goals`
- **Three AI Personalities** — No-nonsense, Hype Coach, Roast Mode
- **Dynamic Replanning** — Falls behind? The agent redistributes tasks automatically
- **Google Calendar Sync** — Push tasks to your calendar as events with reminders
- **Google Sign-In + Guest Mode** — Sign in with Google or jump in instantly as a guest
- **7-Day Calendar Strip** — Interactive dashboard showing task distribution
- **Drag & Drop Rescheduling** — Reschedule tasks visually with @dnd-kit
- **Streak Tracking** — Gamified consecutive-day completion tracking
- **Voice Input** — Speak your goals via Web Speech API
- **Confetti Celebrations** — Visual reward when a goal hits 100%

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express |
| AI | Gemini 2.5 Flash (function calling) |
| Database | Google Cloud Firestore |
| Auth | Google OAuth 2.0 |
| Calendar | Google Calendar API |
| Drag & Drop | @dnd-kit/core |
| Hosting | Firebase Hosting + Render |

---

## 🔑 Google Technologies Used

- **Gemini 2.5 Flash** — Agentic function calling loop
- **Google Cloud Firestore** — Database for goals, tasks, conversations, tokens
- **Firebase Hosting** — Frontend deployment on Google Cloud
- **Google OAuth 2.0** — Authentication + calendar authorization
- **Google Calendar API** — Task-to-calendar event sync

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- A `serviceAccountKey.json` from Google Cloud (Firestore access)
- Gemini API key from AI Studio
- Google OAuth credentials

### Setup

```bash
# Clone the repo
git clone https://github.com/Harshavardhan2006/clutch-app.git
cd clutch-app

# Install all dependencies
npm run install:all

# Create .env file in the root
cp .env.example .env
# Fill in your keys in .env

# Run both frontend and backend
npm run dev
```

Frontend runs at `http://localhost:5173`
Backend runs at `http://localhost:3000`

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
PORT=3000
```

---

## 📁 Project Structure

```
clutch/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Layout, ChatMessage, TaskItem
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # useUser, useVoice
│   │   ├── lib/            # API client
│   │   └── pages/          # Chat, Dashboard, GoalDetail, Login
│   └── package.json
├── server/                 # Node.js + Express backend
│   ├── functions/          # Gemini agent function definitions
│   ├── routes/             # chat, goals, auth
│   ├── services/           # gemini.js, firestore.js
│   └── index.js
├── .env.example
├── firebase.json
└── README.md
```

---

## 📄 Submission Document

Full project description including solution overview, features, tech stack, and Google technologies:
**https://docs.google.com/document/d/1A49dRo1Dm88xC6tVqxaRxN2bP3M1NizwHhRbcyauI44/view?usp=sharing**

---

## 👤 Author

**Kokkonda Harshavardhan**
SR University | kokkondaharshavardhan@gmail.com

---

*Built for Vibe2Ship Hackathon — June 2026*