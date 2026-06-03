# Soft Berry — Content Idea Generator

A full web app with persistent sidebar history. Every generation is saved automatically and accessible from any device.

---

## Deploy to Render (Free — Recommended)

Render is the simplest free host for Node.js apps. Sessions persist as long as the app is running.

### Step 1 — Push to GitHub
1. Create a free account at github.com
2. Create a new repository called `softberry-ideas`
3. Upload all these files:
   - `server.js`
   - `package.json`
   - `public/index.html`

### Step 2 — Deploy on Render
1. Go to render.com and create a free account
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Set these values:
   - **Name:** softberry-ideas
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Deploy**

Render gives you a URL like: `https://softberry-ideas.onrender.com`

Share that link with your team. Everyone who opens it shares the same session history.

---

## Deploy to Railway (Alternative — also free)

1. Go to railway.app
2. Click **Deploy from GitHub**
3. Connect your repo
4. Railway auto-detects Node.js and deploys

---

## Run Locally (for testing)

```bash
npm install
npm start
```
Then open http://localhost:3000

---

## Important Notes

- Sessions are stored in `db.json` on the server
- On Render free tier, the server sleeps after 15 min of inactivity — first load after sleep takes ~30 seconds
- To avoid this, upgrade to Render Starter ($7/month) which keeps it always awake
- All team members share the same history (it's one shared database)

---

## File Structure

```
softberry-app/
├── server.js          ← Backend (Express)
├── package.json       ← Dependencies
├── db.json            ← Auto-created, stores all sessions
└── public/
    └── index.html     ← Frontend (full app)
```
