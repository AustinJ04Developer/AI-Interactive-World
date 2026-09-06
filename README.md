# AI INTERACTIVE WORLD — Science Expo Platform (v2.0)

**Tagline:** *“Four Experiences. One Intelligent World — Built for School Explorers & Science Fair Judges.”*

An interactive Science Exhibition installation designed for desktop exhibition monitors (16:9 / 1080p+) with webcam, microphone, procedural Web Audio synthesizer, 3D graphics, a friendly robot mascot (**NOVA**), a real **Node.js + Express + TypeScript** backend, a **MongoDB** database, **40+ canonical unique scenarios** with fair LRU rotation, real **dynamic QR delivery**, and a public **mobile-friendly result page**.

---

## 🏗️ Architecture Overview

```
                        ┌──────────────────┐
                        │  SCHOOL STUDENT  │
                        └────────┬─────────┘
                                 │ Browser / Desktop
                        ┌────────▼─────────┐
                        │  React Frontend  │ (client/)
                        │  Game + 3D + UI  │
                        └────────┬─────────┘
                                 │ REST API (:3001)
                        ┌────────▼─────────┐
                        │  Express Backend │ (server/)
                        │ Node + TypeScript│
                        └────┬─────┬───────┘
                             │     │
                 ┌───────────┘     └────────────┐
                 │                              │
          ┌──────▼──────┐                ┌──────▼─────┐
          │   MongoDB   │                │  Gemini AI │
          │ (40+ Scen.) │                │  (Server)  │
          └─────────────┘                └────────────┘
                 │
          ┌──────▼──────────┐
          │  Secure Results │
          │  & Real QR Code │
          └──────┬──────────┘
                 │
          ┌──────▼──────────┐
          │  Student Phone  │
          │ Mobile Result   │
          │ Download/Share  │
          └─────────────────┘
```

---

## 🚀 Quick Start (Local Exhibition Setup)

### 1. Install Dependencies
```bash
# In the root directory:
npm run client   # Starts the Vite React frontend (http://localhost:5173)
npm run server   # Starts the Express MongoDB backend (http://localhost:3001)

# Or start both simultaneously:
npm run dev
```

### 2. Access the Application
- **Main Exhibition Installation:** [http://localhost:5173/](http://localhost:5173/)
- **Operator & Faculty Dashboard:** [http://localhost:5173/operator](http://localhost:5173/operator)
- **Backend API Health Check:** [http://localhost:3001/api/system/health](http://localhost:3001/api/system/health)

---

## 🔑 Subsystem & API Key Summary

| Service | Required for Full Version? | Environment Variable | Used For |
| :--- | :---: | :--- | :--- |
| **Gemini 2.5** | Optional (MOCK_AI=true by default) | `GEMINI_API_KEY` | Real-time generative dialogue, forensic reasoning & summaries. Kept strictly on server. |
| **MongoDB** | Yes (With in-memory fallback) | `MONGODB_URI` | Stores sessions, 40+ canonical scenarios, assignments, results, and QR tokens. |
| **Email (Resend)** | Optional (Local simulated logger by default) | `RESEND_API_KEY` | Dispatches personalized high-res souvenir dossiers to student emails. |
| **Storage** | Optional (Local disk storage by default) | `STORAGE_PROVIDER` | Stores print-ready souvenir posters. |
| **QR Library** | **No API Key** | None | Built-in high-speed cryptographic QR code generation. |
| **Webcam / Mic** | **No API Key** | Browser permissions | Optical hero photo capture and Web Speech voice interaction. |

---

## 🎮 The Four School-Friendly Experiences

1. **🔎 SUPER DETECTIVE ("The Mystery Lab"):**
   - Investigates a missing technology case assigned dynamically from the 10+ detective scenario pool.
   - Inspects CCTV footage, acoustic wave spectrograms, encrypted access logs, and suspect alibis.
   - Assisted by friendly AI mascot **NOVA** with visible deduction steps.
   - Identifies contradictions and accuses the culprit to earn +500 XP.

2. **🌆 CITY EXPLORER ("Smart City 2050"):**
   - 3D living metropolis navigable via **W, A, S, D** and mouse camera direction across 5 smart sectors.
   - Interacts with autonomous AI citizens (Doctor, Smart Farmer, Plasma Grid Controller, Safety Sentinel) using voice or keyboard.
   - Discovers clean energy breakthroughs and captures the hero shot at the Central Explorer Monument.

3. **🛡️ AI DEFENDER ("Protect the Core"):**
   - High-energy arcade defense canvas protecting the Quantum Core against mutating algorithmic glitches.
   - Real-time behavior telemetry tracks player targeting accuracy (%) and reaction latency (ms) with dynamic difficulty adaptation.

4. **🚀 SPACE EXPLORER ("The Last Signal"):**
   - Cinematic fullscreen space adventure aboard deep-space station *Aethelgard*.
   - High-stakes moral dilemmas chosen via mouse or spoken voice commands.
   - Multiple branching destinies and official movie poster souvenirs.

---

## 📱 Real QR & Mobile Result Page (`/results/:token`)

- Every completed mission creates an unguessable 32-character cryptographic token in MongoDB.
- Dynamic QR code opens the mobile-first result page where students can:
  - View their personalized high-res poster and score.
  - Review unlocked achievement badges.
  - Tap **DOWNLOAD IMAGE** or **SHARE WITH FRIENDS**.

---

## 🛡️ Privacy & Child Safety Commitment

- **Local Memory Processing:** Live camera feed is processed strictly inside client memory. Raw frames are never uploaded.
- **Zero Facial Recognition:** The system does not analyze identity, age, gender, emotion, or biometric credentials.
- **Auto-Purge & Expo Turnover:** Temporary session data and camera images are automatically cleared when a student finishes or when Expo Mode turnover resets (45s idle countdown).

---

## 📚 Complete Documentation Links

- [docs/SETUP.md](file:///d:/Projects/New%20folder/docs/SETUP.md) — Step-by-step setup guide.
- [docs/API_KEYS.md](file:///d:/Projects/New%20folder/docs/API_KEYS.md) — API key configuration & zero-key safe mode.
- [docs/DATABASE.md](file:///d:/Projects/New%20folder/docs/DATABASE.md) — MongoDB collections, schemas & indexes.
- [docs/DEPLOYMENT.md](file:///d:/Projects/New%20folder/docs/DEPLOYMENT.md) — Production hosting guide (Vercel + Render + MongoDB Atlas).
- [docs/EXPO_OPERATION.md](file:///d:/Projects/New%20folder/docs/EXPO_OPERATION.md) — Exhibition floor guide & operator hotkeys.
- [docs/TROUBLESHOOTING.md](file:///d:/Projects/New%20folder/docs/TROUBLESHOOTING.md) — Diagnostics, offline recovery & FAQs.
