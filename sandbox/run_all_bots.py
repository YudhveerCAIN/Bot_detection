"""
run_all_bots_v2.py
-----------------
Runs bots, syncs with dashboard backend, and prints clean report
"""

import subprocess
import time
import requests
import json
from datetime import datetime, timezone

# ═══ CONFIGURATION ═══
# When bots target the deployed Netlify site, the tracker sends data to Render.
# Switch to "http://127.0.0.1:8000" if testing against localhost.
API_BASE = "https://bot-detection-nilz.onrender.com"
WAIT_SEC = 6  # Give Render a few extra seconds to process (cold start can be slow)

PUPPETEER_DIR = r"bot-scripts\puppeteer"
SELENIUM_DIR  = r"bot-scripts\selenium"

BOTS = [
    {
        "name": "Scraper Bot",
        "type": "node",
        "script": "scraper_bot.js",
        "cwd": PUPPETEER_DIR,
    },
    {
        "name": "Sniper Bot",
        "type": "node",
        "script": "sniper_bot.js",
        "cwd": PUPPETEER_DIR,
    },
    {
        "name": "Cart Manipulation Bot",
        "type": "node",
        "script": "cart_bot.js",
        "cwd": PUPPETEER_DIR,
    },
    {
        "name": "Credential Stuffer",
        "type": "python",
        "script": "credential_stuffer.py",
        "cwd": SELENIUM_DIR,
    },
]

# -------------------------------
# Fetch predictions from backend
# -------------------------------
def get_predictions(since_ts):
    try:
        r = requests.get(f"{API_BASE}/analytics/recent-detections", timeout=15)
        data = r.json()

        results = []
        for d in data:
            ts_str = d.get("updated_at")
            if not ts_str:
                continue

            ts = datetime.fromisoformat(ts_str.replace("Z", ""))
            if ts.replace(tzinfo=None) > since_ts.replace(tzinfo=None):
                results.append(d)

        return results

    except Exception as e:
        print("API ERROR:", e)
        return []

# -------------------------------
# Run a bot
# -------------------------------
def run_bot(bot):
    cmd = ["node", bot["script"]] if bot["type"] == "node" else ["python", bot["script"]]

    print(f"\n🚀 Running: {bot['name']}")
    start_time = datetime.utcnow()

    result = subprocess.run(
        cmd,
        cwd=bot["cwd"],
        capture_output=True,
        text=True,
        timeout=60
    )

    print(result.stdout or "No output")

    if result.stderr:
        # Filter out noisy Chrome DevTools/deprecation lines
        err_lines = [l for l in result.stderr.splitlines()
                     if "DevTools" not in l and "DEPRECATED_ENDPOINT" not in l
                     and "DeprecationWarning" not in l]
        if err_lines:
            print("⚠️ Error:", "\n".join(err_lines[:5]))

    time.sleep(WAIT_SEC)
    return start_time

# -------------------------------
# Pretty Report
# -------------------------------
def print_report(results):
    print("\n" + "="*70)
    print("🤖 BOT DETECTION REPORT")
    print("="*70)

    for r in results:
        prob = r.get("bot_probability", 0)
        verdict = "BOT 🤖" if r.get("prediction") == 1 else "HUMAN 👤"

        print(f"""
Session   : {r.get('session_id')}
Bot Name  : {r.get('bot_name')}
Prob      : {prob:.4f}
Tier      : {r.get('confidence_tier')}
Events    : {r.get('event_count')}
Verdict   : {verdict}
        """)

# -------------------------------
# MAIN
# -------------------------------
if __name__ == "__main__":
    print("\n🧠 BOT TEST SUITE STARTED")
    print(f"   Backend: {API_BASE}\n")

    summary = []

    for bot in BOTS:
        start = run_bot(bot)

        preds = get_predictions(start)

        if preds:
            for p in preds:
                p["bot_name"] = bot["name"]
                summary.append(p)
        else:
            summary.append({
                "bot_name": bot["name"],
                "session_id": "N/A",
                "bot_probability": 0,
                "prediction": -1,
                "event_count": 0,
                "confidence_tier": "No Data"
            })

    print_report(summary)

    print("\n📦 JSON OUTPUT:\n")
    print(json.dumps(summary, indent=2, default=str))