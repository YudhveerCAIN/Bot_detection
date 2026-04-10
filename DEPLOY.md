# Production Deployment Guide

This folder contains the three deployable units of the **AI Behavioral Bot Detection** system.

---

## Architecture Overview

```
┌─────────────────────┐        POST /collect        ┌──────────────────────┐
│   target-site       │ ─────────────────────────── │     backend           │
│   (Netlify)         │                             │     (Render)          │
└─────────────────────┘                             │  FastAPI + RandomForest│
                                                    │  MongoDB Atlas         │
┌─────────────────────┐        GET /analytics/*     └──────────────────────┘
│   dashboard         │ ────────────────────────────────────────────────────
│   (Netlify)         │
└─────────────────────┘
```

---

## Step 1 — Deploy the Backend to Render

### Prerequisites
- A [Render](https://render.com) account
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free tier works fine)
  - Whitelist `0.0.0.0/0` in Network Access so Render can connect

### Steps

1. Push the `production/backend/` folder to a GitHub repo (or a subfolder of your repo)
2. In Render → **New Web Service** → connect your GitHub repo
3. Set these settings:
   - **Root Directory**: `production/backend` (if it's a subfolder)
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add these **Environment Variables** in Render dashboard:

| Key | Value |
|-----|-------|
| `MONGO_URL` | Your MongoDB Atlas connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `ALLOWED_ORIGINS` | Comma-separated Netlify URLs once known, e.g. `https://your-dashboard.netlify.app,https://your-target-site.netlify.app` |

5. Click **Deploy** — Render will install dependencies and start the API
6. Note the public URL (e.g. `https://bot-detection-api.onrender.com`)

> **Health check**: Render will ping `GET /health` to verify the service is alive.

---

## Step 2 — Deploy the Target Site to Netlify

1. Push `production/target-site/` to GitHub
2. In Netlify → **Add new site** → **Import from Git**
3. Set **Build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_BOT_API_URL` | `https://your-render-url.onrender.com/collect` |

5. Deploy — the tracker will now send behavioral data to your live backend

---

## Step 3 — Deploy the Dashboard to Netlify

1. Push `production/dashboard/` to GitHub
2. In Netlify → **Add new site** → **Import from Git**
3. Set **Build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://your-render-url.onrender.com` |

5. Deploy — the dashboard will show live bot detections from the backend

---

## Step 4 — Update CORS on Render

Once both Netlify sites are deployed, go back to Render → Environment Variables and update:

```
ALLOWED_ORIGINS = https://your-dashboard.netlify.app,https://your-target-site.netlify.app
```

Then trigger a redeploy on Render.

---

## Environment Variables Summary

### Backend (Render)
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | ✅ Yes | MongoDB Atlas connection string |
| `ALLOWED_ORIGINS` | ✅ Yes | Comma-separated Netlify URLs |

### Dashboard (Netlify)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | ✅ Yes | Render backend base URL (no trailing slash) |

### Target Site (Netlify)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BOT_API_URL` | ✅ Yes | Full URL to `/collect` endpoint |

---

## Notes

- **Model**: `model_v2.pkl` is included in the backend folder. It is ~1.2MB and is loaded at startup.
- **MongoDB**: All session events and predictions are stored in MongoDB Atlas under the `bot_tracking` database.
- **Free tier limits**: Render free tier spins down after 15 min of inactivity. First request after idle will take ~30s. Upgrade to a paid plan for always-on availability.
