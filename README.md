# ⏱️ Speed Solver Social

**Your ultimate speedcubing companion.** Time your solves, learn algorithms, track your stats, and battle friends — all in one place.

🌐 **Live Site:** [speedsolversocial.in](https://speedsolversocial.in)

---

## ✨ Features

### 🕐 Timer
- Supports multiple cube types: 3x3, 2x2, 4x4, 5x5, and more
- Auto-generated scrambles with a 2D cube preview
- Space bar / touch to start and stop
- Penalty support: `+2` and `DNF`
- Multiple sessions per cube type
- Batch averages: Ao5, Ao12, Ao25, Ao50, Ao100, Ao200, Ao500, Ao1000
- Sync solves to the cloud

### 📊 Solves & Averages
- View your full solve history with times, scrambles, and penalties
- Delete individual solves
- See your statistical averages across batch sizes
- Track your personal bests

### 🧠 Algorithm Trainer (Learn)
- Browse algorithms by cube type and category (OLL, PLL, etc.)
- Timer for each individual algorithm to track your recognition and execution speed
- Random mode to drill across all algs
- Personal best tracking per algorithm

### ⚔️ Battle Mode
- Real-time 1v1 speed battles using Socket.IO
- Send and receive challenge invites
- Both players receive the same scramble for a fair race
- Live opponent status and countdown
- Penalty options before submitting your result
- Win/loss result screen

### 📈 Improve
- Get personalized solve critiques and coaching
- Reach out via Discord, Instagram, or Email directly from the app

### 👤 Public Profile
- Shareable profile page via a unique link (`/:shareLink`)
- Showcase your records to the community

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Real-time | Socket.IO Client |
| HTTP | Axios |
| Cube Logic | `react-rubiks-cube-utils` |
| CSV Parsing | PapaParse |
| SEO | React Helmet Async |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/cubey.git
cd cubey

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_BACKEND_URL=https://your-backend-url.com
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/          # Shared UI components
│   ├── DashboardLayout.jsx
│   ├── ChallengePopup.jsx   # Real-time battle challenge overlay
│   ├── RequireAuth.jsx
│   ├── SEO.jsx
│   ├── ThemeToggle.jsx
│   └── ui/              # Primitive UI components (Badge, Card, etc.)
├── context/
│   └── SocketContext.jsx    # Socket.IO connection & context
├── hooks/               # Custom React hooks
├── pages/
│   ├── LandingPage.jsx
│   ├── Signin.jsx
│   ├── Signup.jsx
│   ├── ResetPassword.jsx
│   ├── PublicProfile.jsx
│   └── dashboard/
│       ├── Timer.jsx        # Main solve timer
│       ├── Solves.jsx       # Solve history
│       ├── Averages.jsx     # Stats & averages
│       ├── Learn.jsx        # Algorithm trainer
│       ├── Improve.jsx      # Coaching & contact
│       └── BattleRoom.jsx   # Real-time 1v1 battles
├── utils/
│   ├── api.js           # Axios instance
│   ├── algId.js         # Algorithm database
│   └── Cube2D.jsx       # 2D cube state visualizer
├── App.jsx
└── main.jsx
```

---

## 🌐 Deployment

The frontend is deployed on **Vercel**. The `vercel.json` config handles SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

The backend API is hosted separately on **Render** (`api-cubey.onrender.com`).

---

## 📬 Contact

Have feedback or want a solve critique? Reach out:

- **Discord:** [Siddharth](https://discord.com/users/771914664836726795)
- **Email:** siddharthraj532@gmail.com
- **Instagram:** [@siddharthraj](https://instagram.com)
