# 🛡️ SentinelBot AI — Passive Behavioral Bot Detection & Real-Time Mitigation System

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Machine Learning](https://img.shields.io/badge/Scikit--Learn-Random%20Forest-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **An end-to-end, enterprise-grade AI security platform that identifies and blocks automated bots, scrapers, and credential stuffers in real-time by analyzing passive micro-behavioral telemetry (mouse kinematics, trajectory entropy, scroll dynamics, and keystroke timing) without imposing frustrating CAPTCHAs on human users.**

---

## 🌟 Executive Summary

Traditional bot detection mechanisms (e.g., reCAPTCHA, Cloudflare turnstiles, IP rate-limiting) degrade user experience, fail against headless browser automation (Puppeteer, Playwright, Selenium with `stealth` plugins), and can be bypassed by AI CAPTCHA solvers.

**SentinelBot AI** operates **100% passively** in the background. It continuously collects raw interaction events from user sessions, calculates **10 high-dimensional mathematical features** across sliding time windows, and evaluates them using a pre-trained **Random Forest Classifier**. If anomalous bot dynamics are detected, the system immediately returns a blocking directive to terminate the suspicious session on the target site while streaming live telemetry to a Security Operations Center (SOC) dashboard.

---

## 📐 System Architecture

```
                                  +---------------------------------------+
                                  |    Target Website (e.g., NovaMart)    |
                                  |  - Non-Intrusive Tracker (tracker.js) |
                                  +-------------------+-------------------+
                                                      |
                                                      | ⚡ POST /collect
                                                      |    (Every 3s Batch)
                                                      v
                                  +---------------------------------------+
                                  |         FastAPI REST Backend          |
                                  |  - In-Memory Buffer (Sliding Window)  |
                                  |  - Feature Extractor Engine           |
                                  |  - Hot-Reloadable Scikit-Learn Model  |
                                  +---------+-------------------+---------+
                                            |                   |
                     💾 Session & Logs      |                   | 📊 Live Telemetry / API
                     MongoDB Atlas / Local  |                   |
                                            v                   v
                                 +--------------------+  +--------------------+
                                 |  MongoDB Database  |  |    SOC Dashboard   |
                                 |  - `sessions`      |  |  (React + Recharts |
                                 |  - `predictions`   |  |   + Tailwind CSS)  |
                                 +--------------------+  +--------------------+
```

---

## ✨ Key Features

- **🕵️ Passive Telemetry Tracker (`tracker.js`)**
  - Zero-dependency, lightweight JavaScript snippet (~3.5 KB).
  - Throttled mouse movement listener (50ms interval) preventing performance drops.
  - Monitors mouse coordinates, velocity, click rates, scroll depth, and inter-keystroke intervals.
  - Enforces client-side session termination dynamically when `prediction == "BOT"`.

- **🧠 Real-Time Inference & Hot-Reloading Backend (`FastAPI`)**
  - **Sliding Window Buffer**: Processes recent event history (default: 20-second rolling window).
  - **Tiered Minimum Thresholding**: Flags high-risk bots early (>=12 critical events @ 95% confidence) and verifies standard traffic (>=35 events @ 75% confidence).
  - **Live Model Hot-Reload**: Automatically reloads `model_v2.pkl` upon disk modifications without restarting the server.

- **📊 Modern Security Operations Center (SOC) Dashboard (`React + Vite + Recharts`)**
  - **Real-Time Interception Feed**: Live updating session stream (polling every 3s).
  - **Threat Level Indicator**: Dynamic status banner switching from `STABLE` to `ELEVATED` when bot traffic rate exceeds 15%.
  - **Forensics Deep-Dive Modal**: Interactive breakdown showing exact mathematical feature values extracted for any audited session.
  - **CSV Telemetry Exporter**: One-click export of complete session behavioral parameters for offline threat hunting.

- **🤖 Automated Attack Simulation Suite (`sandbox/`)**
  - Pre-built automated attack scripts built with **Puppeteer (Node.js)** and **Selenium (Python)**.
  - Simulates 4 common threat vectors:
    1. **Scraper Bot**: Rapid DOM traversals & non-human mouse teleports.
    2. **Sniper Bot**: Ultra-fast programmatic button clicking.
    3. **Cart Manipulation Bot**: High-frequency automated shopping cart modifications.
    4. **Credential Stuffer**: Fixed inter-keystroke timing and linear movement paths.

---

## 🧮 Machine Learning & Feature Engineering

The detection engine relies on **10 core behavioral parameters** extracted from raw timestamped event streams:

| Feature Name | Type | Description | Mathematical Significance |
| :--- | :--- | :--- | :--- |
| `mouse_direction_entropy` | Kinematics | Shannon Entropy of mouse vector movement across 16 angular direction bins | **High in humans** (curved, natural paths); **Zero/Low in bots** (perfect straight lines). |
| `avg_mouse_speed` | Velocity | Average cursor velocity in pixels per second ($\text{px/s}$) | Humans have moderate velocity with acceleration/deceleration curves. |
| `mouse_speed_std` | Acceleration | Standard deviation of cursor speed | Bots exhibit uniform speed ($\sigma \approx 0$); humans accelerate and decelerate. |
| `key_delay_std` | Timing | Standard deviation of delays between consecutive keydown events ($\text{ms}$) | Synthetic key typers have rigid delays; human typing varies organically. |
| `avg_key_delay` | Timing | Mean inter-keystroke delay ($\text{ms}$) | Captures fast macro scripts vs human motor response limits. |
| `click_rate` | Frequency | Total mouse clicks divided by total active session duration ($\text{clicks/s}$) | Detects rapid clicker scripts and automated submit loops. |
| `event_rate` | Frequency | Total events logged per second ($\text{events/s}$) | Quantifies interaction intensity. |
| `mouse_event_count` | Activity | Total raw `mousemove` events recorded | Differentiates active browsing from headless background scripts. |
| `scroll_count` | Interaction | Total `scroll` events recorded | Evaluates vertical page consumption. |
| `total_events` | Volume | Total cumulative telemetry payload length | Used for tiered model confidence thresholds. |

---

## 📂 Project Structure

```
Bot_detection/
├── backend/                             # Python FastAPI Service & Model Engine
│   ├── main.py                          # REST API Endpoints, MongoDB Connection & CORS
│   ├── feature_extractor.py             # Feature Math (Entropy, Velocity, Kinematics)
│   ├── model_v2.pkl                     # Pre-Trained Random Forest Classifier (~1.2 MB)
│   ├── render.yaml                      # Render Cloud Deployment Spec
│   └── requirements.txt                 # Backend Dependencies
│
├── dashboard/                           # React SOC Admin Dashboard
│   ├── src/
│   │   ├── App.jsx                      # Main UI Layout, Live Feed & Deep-Dive Modal
│   │   ├── api.js                       # Axios Client Instance
│   │   └── index.css                    # Tailwind CSS Custom Styling & Animations
│   ├── package.json                     # Frontend Node Dependencies
│   └── tailwind.config.js               # Dark-mode Theme Configuration
│
├── target-site/                         # NovaMart E-Commerce Demo Site
│   ├── index.html                       # Modern Shopping Store Frontend
│   ├── tracker.js                       # Lightweight Event Collector & Block Enforcer
│   └── netlify.toml                     # Netlify Deployment Configuration
│
├── sandbox/                             # Attack Simulator & Testing Suite
│   ├── run_all_bots.py                  # Automated Test Runner & Verification Suite
│   ├── bot-scripts/
│   │   ├── puppeteer/                   # Node.js Scrapers & Sniper Bots
│   │   └── selenium/                    # Python Credential Stuffing Scripts
│   └── bot.html                         # Isolated Test Page
│
├── start_all.bat                        # One-Click Local Environment Launcher
└── DEPLOY.md                            # Complete Cloud Deployment Manual
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ & **npm**
- **Python** 3.9+
- **MongoDB** (Local instance running on `mongodb://localhost:27017` or MongoDB Atlas URI)

### Option A: One-Click Windows Launch ⚡

Double-click `start_all.bat` or execute in PowerShell:
```cmd
.\start_all.bat
```
This script automatically spins up:
- 🟢 **Backend API**: `http://localhost:8000`
- 🔵 **Target Site (NovaMart)**: `http://localhost:3000`
- 🟣 **SOC Dashboard**: `http://localhost:5173`

---

### Option B: Manual Step-by-Step Setup

#### 1️⃣ Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 2️⃣ Target Site Setup
```bash
cd target-site
npm install
npm run dev -- --port 3000
```

#### 3️⃣ SOC Dashboard Setup
```bash
cd dashboard
npm install
npm run dev -- --port 5173
```

---

## 🧪 Testing & Bot Simulation

Validate the detection engine by running automated attacks against the target site:

```bash
cd sandbox
python run_all_bots.py
```

### Expected Execution Output:

```text
🧠 BOT TEST SUITE STARTED
   Backend: http://localhost:8000

🚀 Running: Scraper Bot
Session   : sess_k9x2m4a1
Bot Name  : Scraper Bot
Prob      : 0.9840
Tier      : standard
Events    : 48
Verdict   : BOT 🤖

======================================================================
🤖 BOT DETECTION REPORT SUMMARY
======================================================================
```

---

## 📡 API Reference Matrix

### Telemetry Collection & Prediction
| Endpoint | Method | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `/collect` | `POST` | `{ site_id, session_id, events: [...] }` | Receives raw events, computes features, returns `BOT` or `HUMAN` verdict. |
| `/health` | `GET` | *None* | Health check ping for load balancers / cloud platform health monitors. |

### Security Operations Analytics
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/analytics/overview` | `GET` | Returns aggregated metrics (`total_sessions`, `bots`, `humans`, `bot_rate`). |
| `/analytics/recent-detections` | `GET` | Returns the 20 most recently classified sessions with extracted features. |
| `/analytics/sites` | `GET` | Returns session distribution per monitored website ID. |
| `/analytics/bot-probabilities` | `GET` | Returns probability histogram bucket counts (0-20%, 20-40%, etc.). |
| `/analytics/live-sessions` | `GET` | Lists currently active in-memory session buffers. |

### Forensics & Debugging
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/debug/session/{session_id}` | `GET` | Returns raw mathematical values for all 10 model features for a specific session ID. |
| `/debug/latest` | `GET` | Fetches the single most recent prediction entry from MongoDB. |
| `/admin/reload-model` | `POST` | Forces an instantaneous reload of `model_v2.pkl` from disk. |

---

## 🌐 Production Deployment

Refer to [`DEPLOY.md`](file:///c:/Users/yudhv/OneDrive/Desktop/COLLEGE/Bot_detection/DEPLOY.md) for full step-by-step instructions.

- **Backend**: Deploy to **Render / Railway / AWS EC2** via Docker or Python runtime.
  - Set `MONGO_URL` and `ALLOWED_ORIGINS`.
- **Target Site & Dashboard**: Deploy to **Netlify / Vercel**.
  - Set `VITE_BOT_API_URL` and `VITE_API_BASE_URL`.

---

## 🛠️ Built With

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [NumPy](https://numpy.org/), [Pandas](https://pandas.pydata.org/), [Scikit-Learn](https://scikit-learn.org/), [PyMongo](https://pymongo.readthedocs.io/)
- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [Recharts](https://recharts.org/)
- **Automation Testing**: [Puppeteer](https://pptr.dev/), [Selenium](https://www.selenium.dev/)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
