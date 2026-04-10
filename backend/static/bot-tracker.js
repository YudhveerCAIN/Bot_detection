/**
 * ╔══════════════════════════════════════════════════════╗
 * ║          AI Behavioral Bot Tracker v1.0              ║
 * ║  Drop-in passive bot detection for any website.      ║
 * ║                                                      ║
 * ║  Usage:                                              ║
 * ║    <script>                                          ║
 * ║      window.BOT_API_URL  = "https://your-api/collect"║
 * ║      window.BOT_SITE_ID  = "your-site-name"         ║
 * ║      // Optional callbacks:                          ║
 * ║      window.BOT_ON_DETECT   = function(prob) {}     ║
 * ║      window.BOT_ON_SAFE     = function(prob) {}     ║
 * ║      window.BOT_BLOCK_PAGE  = false  // default true ║
 * ║    </script>                                         ║
 * ║    <script src="https://your-api/static/bot-tracker.js"></script>
 * ╚══════════════════════════════════════════════════════╝
 */
(function () {
  "use strict";

  // ─── Config (Hardcoded specific Render URL fallback) ───────────────────────
  // We explicitly hardcode the collect endpoint URL here instead of relying on auto-detect
  var defaultApiUrl = "https://bot-detection-nilz.onrender.com/collect";

  var API_URL    = window.BOT_API_URL  || defaultApiUrl;
  var SITE_ID    = window.BOT_SITE_ID  || window.location.hostname; // Auto-detect website domain
  var BLOCK_PAGE = window.BOT_BLOCK_PAGE !== false; // default: true
  var ON_DETECT  = typeof window.BOT_ON_DETECT === "function" ? window.BOT_ON_DETECT : null;
  var ON_SAFE    = typeof window.BOT_ON_SAFE  === "function" ? window.BOT_ON_SAFE  : null;

  if (!API_URL) {
    console.warn("[BotTracker] Cannot detect API URL. Tracker is disabled.");
    return;
  }

  // ─── Session ID (persisted across page reloads) ──────────────────────────────
  var SESSION_ID = (function () {
    var key = "bot_session_id";
    var id  = sessionStorage.getItem(key);
    if (!id) {
      id = "sess_" + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem(key, id);
    }
    return id;
  })();

  // ─── State ───────────────────────────────────────────────────────────────────
  var events    = [];
  var isBlocked = false;
  var SEND_INTERVAL_MS  = 3000;
  var MOUSE_THROTTLE_MS = 50;
  var SCROLL_THROTTLE_MS = 100;
  var lastMouseTime  = 0;
  var lastScrollTime = 0;
  var lastKeyTime    = null;

  // ─── Event logging ───────────────────────────────────────────────────────────
  function log(event) {
    if (!isBlocked) events.push(event);
  }

  // ─── Listeners ───────────────────────────────────────────────────────────────
  document.addEventListener("mousemove", function (e) {
    var now = Date.now();
    if (now - lastMouseTime > MOUSE_THROTTLE_MS) {
      lastMouseTime = now;
      log({ type: "mousemove", x: e.clientX, y: e.clientY, timestamp: now });
    }
  });

  document.addEventListener("click", function (e) {
    log({ type: "click", x: e.clientX, y: e.clientY, timestamp: Date.now() });
  });

  window.addEventListener("scroll", function () {
    var now = Date.now();
    if (now - lastScrollTime > SCROLL_THROTTLE_MS) {
      lastScrollTime = now;
      log({ type: "scroll", scrollY: window.scrollY, timestamp: now });
    }
  });

  document.addEventListener("keydown", function () {
    var now = Date.now();
    var delay = lastKeyTime !== null ? now - lastKeyTime : null;
    lastKeyTime = now;
    log({ type: "keydown", keyDelay: delay, timestamp: now });
  });

  // ─── Block page (configurable) ───────────────────────────────────────────────
  function blockPage(probability) {
    isBlocked = true;
    if (ON_DETECT) {
      ON_DETECT(probability);   // let the host site handle it their own way
      return;
    }
    if (BLOCK_PAGE) {
      document.body.innerHTML =
        "<div style='display:flex;flex-direction:column;align-items:center;" +
        "justify-content:center;height:100vh;background:#450a0a;color:white;" +
        "font-family:sans-serif;text-align:center;padding:2rem;'>" +
        "<h1 style='font-size:2.5em;color:#f87171;margin-bottom:1rem;'>Access Denied</h1>" +
        "<p style='max-width:480px;opacity:0.85;'>Automated behavior detected." +
        " This session has been terminated by our AI security system.</p>" +
        "<small style='margin-top:2rem;opacity:0.5;'>Session: " + SESSION_ID + "</small>" +
        "</div>";
    }
  }

  // ─── Send data ───────────────────────────────────────────────────────────────
  function sendEvents() {
    if (isBlocked || events.length === 0) return;

    var payload = JSON.stringify({
      site_id:    SITE_ID,
      session_id: SESSION_ID,
      events:     events.slice()   // snapshot
    });
    events = [];                   // clear immediately (don't wait for response)

    // Use fetch with keepalive for reliability on page unload
    fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    payload,
      keepalive: true,        // reliable delivery when page unloads
      credentials: "omit"     // Required to fix CORS wildcard '*' policy error
    })
    .then(function (res) { return res.json(); })
    .then(handleResponse)
    .catch(function (err) {
      console.warn("[BotTracker] Send failed:", err);
    });
  }

  function handleResponse(data) {
    if (!data) return;
    if (data.prediction === "BOT") {
      console.warn("[BotTracker] Bot detected (p=" + data.bot_probability + "). Blocking.");
      blockPage(data.bot_probability);
    } else if (ON_SAFE && data.bot_probability !== undefined) {
      ON_SAFE(data.bot_probability);
    }
  }

  setInterval(sendEvents, SEND_INTERVAL_MS);

  // Also flush on page hide (tab close / navigate away)
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") sendEvents();
  });

  console.log("[BotTracker] Active | site=" + SITE_ID + " session=" + SESSION_ID);
})();
