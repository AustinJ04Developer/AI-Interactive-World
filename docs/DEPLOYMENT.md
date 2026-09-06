# PRODUCTION HOSTING & DEPLOYMENT GUIDE

This guide details how to deploy AI INTERACTIVE WORLD to cloud infrastructure.

---

## 🌐 Recommended Hosting Architecture

| Tier | Recommended Cloud Provider | Configuration |
| :--- | :--- | :--- |
| **Frontend** | Vercel / Netlify / Cloudflare Pages | Root directory: `client/`, Build command: `npm run build`, Output: `dist/` |
| **Backend** | Render / Railway / Fly.io | Root directory: `server/`, Build: `npm run build`, Start: `npm start` |
| **Database** | MongoDB Atlas (M0 Free Tier or Dedicated) | Connection URI in `MONGODB_URI` |
| **Storage** | Cloudinary / AWS S3 / Cloudflare R2 | Storage credentials in backend environment |

---

## 🚀 Step 1: Deploying MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user (e.g. `expo_admin`) and allow connections from your server IP (or `0.0.0.0/0` for serverless hosting).
3. Copy the connection string:
   ```
   MONGODB_URI="mongodb+srv://expo_admin:<PASSWORD>@cluster0.mongodb.net/ai_interactive_world?retryWrites=true&w=majority"
   ```

---

## 🚀 Step 2: Deploying the Backend on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Link your GitHub repository.
3. Configure the service:
   - **Name:** `ai-interactive-world-server` (or your choice)
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Add Environment Variables under the **Environment** tab:
   - `PORT=3001`
   - `MONGODB_URI=<your MongoDB Atlas connection string>`
   - `FRONTEND_URL=https://<your-site-name>.netlify.app`
   - `APP_BASE_URL=https://<your-site-name>.netlify.app`
   - `MOCK_AI=false`
   - `GEMINI_API_KEY=<your Gemini API key>`
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_SECURE=false`
   - `SMTP_USER=<your Gmail address>`
   - `SMTP_PASS=<your 16-character Google App Password>`
   - `SMTP_FROM=AI Interactive World <<your Gmail address>>`
5. Click **Create Web Service**.
6. Once deployed, note down your Render server URL:
   `https://ai-interactive-world-server.onrender.com`
7. Test the health check endpoint:
   `https://ai-interactive-world-server.onrender.com/api/system/health`

---

## 🚀 Step 3: Deploying the Frontend on Netlify
1. Log in to [Netlify](https://app.netlify.com/) and click **Add new site** → **Import an existing project**.
2. Authorize and choose your GitHub repository.
3. Netlify will auto-detect settings from [`netlify.toml`](file:///d:/Projects/New%20folder/netlify.toml):
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `client/dist`
4. Click **Add environment variables** and enter:
   - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api`
   - `VITE_SERVER_URL=https://<your-render-service>.onrender.com`
   - `VITE_APP_TITLE=AI Interactive World — Science Exhibition 2026`
   - `VITE_EXHIBITION_NAME=Science Exhibition 2026`
5. Click **Deploy site**.
6. Once deployed, note down your Netlify URL (e.g. `https://ai-interactive-world-2026.netlify.app`).

---

## 🔗 Step 4: Final Link (CORS & QR URLs)
1. Go back to your Render Web Service dashboard → **Environment**.
2. Ensure `FRONTEND_URL` and `APP_BASE_URL` match your exact Netlify domain:
   - `FRONTEND_URL=https://ai-interactive-world-2026.netlify.app`
   - `APP_BASE_URL=https://ai-interactive-world-2026.netlify.app`
3. Click **Save Changes** (Render will re-deploy in ~30 seconds).

---

## 📲 Step 4: Testing Mobile QR Flow
1. Open the deployed application on a desktop computer.
2. Complete any of the four experiences.
3. Observe the generated QR code.
4. Scan the QR code using an iPhone or Android smartphone camera.
5. Verify the mobile result page loads at `https://your-app-domain.vercel.app/results/<token>`.
6. Test **DOWNLOAD SOUVENIR** and **SHARE WITH FRIENDS**.
