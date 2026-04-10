// ===============================
// Backend API URL (pulled from .env!)
// ===============================
const API_URL = import.meta.env.VITE_BOT_API_URL || "http://localhost:8000/collect";

// ===============================
// Detect Site ID (Multi-Site Support)
// ===============================
const SITE_ID = "sandbox-demo-domain";

// ===============================
// Persistent Session ID
// ===============================
let sessionId = localStorage.getItem("bot_session_id");

if (!sessionId) {
  sessionId = "sess_" + Math.random().toString(36).substring(2, 10);
  localStorage.setItem("bot_session_id", sessionId);
}

console.log("Session:", sessionId);
console.log("Site Tracking Active via .ENV URL:", API_URL);

// ===============================
// Event Buffer
// ===============================
let events = [];
let isBlocked = false;

function logEvent(event) {
  if (!isBlocked) {
    events.push(event);
  }
}

// ===============================
// Mouse Move (THROTTLED)
// ===============================
let lastMouseTime = 0;

document.addEventListener("mousemove", (e) => {
  const now = Date.now();
  if (now - lastMouseTime > 50) {
    lastMouseTime = now;
    logEvent({ type: "mousemove", x: e.clientX, y: e.clientY, timestamp: now });
  }
});

// ===============================
// Click Tracking
// ===============================
document.addEventListener("click", (e) => {
  logEvent({ type: "click", x: e.clientX, y: e.clientY, timestamp: Date.now() });
});

// ===============================
// Scroll Tracking
// ===============================
let lastScrollTime = 0;
window.addEventListener("scroll", () => {
  const now = Date.now();
  if (now - lastScrollTime > 100) {
    lastScrollTime = now;
    logEvent({ type: "scroll", scrollY: window.scrollY, timestamp: now });
  }
});

// ===============================
// Keyboard Timing
// ===============================
let lastKeyTime = null;
document.addEventListener("keydown", () => {
  const now = Date.now();
  let delay = null;
  if (lastKeyTime !== null) {
    delay = now - lastKeyTime;
  }
  lastKeyTime = now;
  logEvent({ type: "keydown", keyDelay: delay, timestamp: now });
});

// ===============================
// Send Data Every 3 Seconds
// ===============================
setInterval(() => {
  if (events.length === 0 || isBlocked) return;

  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      site_id: SITE_ID,
      session_id: sessionId,
      events: events
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("AI Model Response:", data);
    
    if (data.prediction === "BOT") {
      console.warn("Bot detected. Blocking session.");
      isBlocked = true;
      document.body.innerHTML =
        "<div style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#450a0a;color:white;font-family:sans-serif;'> <h1 style='font-size:3em;color:#f87171;'>BLOCK ENFORCED</h1> <p>Unnatural behavioral heuristics detected. Your session has been terminated by the AI.</p> </div>";
    }
    events = [];
  })
  .catch(err => console.error("Error sending tracking data:", err));

}, 3000);
