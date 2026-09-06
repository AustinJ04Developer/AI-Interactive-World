# API KEYS & SECURITY GUIDE

This document explains every external key used by AI INTERACTIVE WORLD, where it is configured, and how to operate in **Zero-Cost Safe Mode**.

---

## 🔒 Golden Security Rule
**NO API KEYS ARE EVER STORED OR ACCESSED IN THE FRONTEND.**
Client applications never communicate directly with Gemini, Resend, or MongoDB. All credentials exist strictly server-side in `server/.env` or container environment variables.

---

## 📋 API Key Overview

### 1. Google Gemini API (Optional)
- **Environment Variable:** `GEMINI_API_KEY` (in `server/.env`)
- **Used For:** Dynamic forensic deductions in Detective, real-time NPC conversational dialogue in Smart City, and personalized commendation summaries in souvenirs.
- **Provider:** Google AI Studio ([https://aistudio.google.com/](https://aistudio.google.com/)).
- **Model Used:** `gemini-2.5-flash`.
- **Zero-Cost Local Fallback:** When `MOCK_AI=true` or when `GEMINI_API_KEY` is not supplied, the backend seamlessly uses its built-in, highly responsive neural simulation engine.

### 2. MongoDB Database Connection
- **Environment Variable:** `MONGODB_URI` (in `server/.env`)
- **Used For:** Storing visitor sessions, canonical scenarios, assignment histories (preventing duplicate scenarios), results, QR access tokens, and email delivery records.
- **Provider Options:**
  - Local MongoDB daemon: `mongodb://localhost:27017/ai_interactive_world`
  - MongoDB Atlas Cloud: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai_interactive_world`
- **Zero-Crash Fallback:** If MongoDB is offline, the backend activates a resilient in-memory datastore so student experiences never fail.

### 3. Email Delivery: Nodemailer SMTP or Resend (Optional)
- **Environment Variables:** `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` (in `server/.env`)
- **Used For:** Sending students their personalized high-resolution experience poster and achievements to their email address.
- **Provider Options:**
  - **Nodemailer (Recommended - Zero Domain Needed):** Works with any standard Gmail address using a 16-character Google App Password (`https://myaccount.google.com/apppasswords`), Outlook, or custom SMTP server.
  - **Resend API:** Supported via `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
- **Fallback:** When neither SMTP nor Resend credentials are supplied, the backend logs simulated dispatches to the server console and the student is encouraged to scan the dynamic QR code on their phone.

### 4. Cloud Object Storage (Optional)
- **Environment Variable:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Used For:** Hosting print-ready poster images in production.
- **Fallback:** Default `STORAGE_PROVIDER=local` saves posters to the `server/uploads/` directory and serves them directly.

---

## 🛠️ Minimum Development Setup (Zero Cost, Zero Dependencies)

To develop or demonstrate the application locally with **no paid API keys and no local database services installed**:
```bash
PORT=3001
FRONTEND_URL="http://localhost:5173"
APP_BASE_URL="http://localhost:5173"
MOCK_AI=true
GEMINI_API_KEY=""
RESEND_API_KEY=""
STORAGE_PROVIDER="local"
```
The entire application will run at 100% functionality.
