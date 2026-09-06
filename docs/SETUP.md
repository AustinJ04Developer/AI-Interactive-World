# SETUP GUIDE — AI INTERACTIVE WORLD

Follow these instructions to set up, run, and test AI INTERACTIVE WORLD locally or on exhibition hardware.

---

## 1. Prerequisites
- **Node.js**: v18+ (Node v20 or v22+ recommended).
- **Package Manager**: npm (bundled with Node).
- **Webcam & Microphone** (Optional: the system features synthetic explorer avatar generation and keyboard fallbacks).
- **MongoDB** (Optional: if MongoDB is not running locally, the server activates a resilient in-memory datastore fallback).

---

## 2. Directory Layout
The application is organized into two clean, independent tiers:
```
AI-Interactive-World/
├── client/              # React 19 + Vite frontend
│   ├── src/             # 3D worlds, experiences, NOVA mascot, UI
│   ├── public/
│   └── package.json
├── server/              # Node.js + Express backend
│   ├── src/             # MongoDB models, fair scenario rotation, AI, QR, email
│   └── package.json
├── docs/                # Comprehensive documentation
├── .env.example         # Environment template
└── package.json         # Root workspace scripts
```

---

## 3. Installation

From the project root:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ..
```

---

## 4. Environment Configuration
Copy `.env.example` to `.env` (or configure in `server/.env`):
```bash
# Server port
PORT=3001

# Allowed frontend for CORS
FRONTEND_URL="http://localhost:5173"

# Public App Base URL (Used for QR code links)
APP_BASE_URL="http://localhost:5173"

# MongoDB connection string
MONGODB_URI="mongodb://localhost:27017/ai_interactive_world"

# AI Provider (Set to true to use built-in neural simulation with zero API cost)
MOCK_AI=true
GEMINI_API_KEY=""

# Email Provider (Optional: leave blank for local console simulator)
RESEND_API_KEY=""
```

---

## 5. Seeding the 40+ Canonical Scenarios
To populate MongoDB with the 40+ canonical scenarios across all 4 portals:
```bash
cd server
npm run seed
```

---

## 6. Running the System

### Option A: Simultaneous Development (Recommended)
From the root directory:
```bash
npm run dev
```
This boots both the backend on `http://localhost:3001` and the frontend on `http://localhost:5173`.

### Option B: Running Separately
Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`**.
