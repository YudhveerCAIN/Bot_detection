import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const url = process.env.TARGET_URL || 'https://bot-target-site.netlify.app/';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  console.log("🛒 CART MANIPULATION BOT INITIALIZED");
  console.log("Objective: Scroll products, add all to cart with perfect timing, spam search.");
  console.log("Targeting:", url);

  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });
  console.log("Status: Page loaded. Beginning automated shopping sequence...");

  // Wait for tracker to initialize
  await sleep(1500);

  // ─── PHASE 1: Perfect-interval scrolling (no human would scroll this evenly) ───
  console.log("Phase 1: Machine-precision scrolling...");
  for (let i = 0; i < 8; i++) {
    await page.evaluate((px) => window.scrollBy(0, px), 150);
    await sleep(100); // Exactly 100ms between each scroll — zero variance
  }

  // ─── PHASE 2: Search bar spam with robotic typing ───
  console.log("Phase 2: Search bar injection...");
  await page.focus('#searchInput');
  
  const queries = ["laptop", "drone", "headphones", "watch", "keyboard"];
  for (const q of queries) {
    // Triple-click to select all, then overwrite
    await page.click('#searchInput', { clickCount: 3 });
    await page.keyboard.type(q, { delay: 5 }); // 5ms per key — inhuman speed
    await page.keyboard.press('Enter');
    await sleep(200); // Exactly 200ms between queries — rigid timing
  }

  // ─── PHASE 3: Scroll to products and add every item to cart ───
  console.log("Phase 3: Mass cart injection...");
  
  // Scroll to products section
  await page.evaluate(() => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'instant' });
  });
  await sleep(300);

  // Click every "Add to Cart" button with perfectly even 150ms intervals
  const buttonCount = await page.evaluate(() => document.querySelectorAll('.btn-add').length);
  console.log(`Found ${buttonCount} products. Adding all to cart...`);
  
  for (let i = 0; i < buttonCount; i++) {
    try {
      await page.evaluate((idx) => {
        const btn = document.querySelectorAll('.btn-add')[idx];
        if (btn) btn.click();
      }, i);
      await sleep(150); // Perfectly rigid 150ms — no human clicks this evenly
    } catch (e) {
      console.log(`Cart injection blocked at item ${i+1} — DOM replaced by AI.`);
      break;
    }
  }

  // ─── PHASE 4: Rapid cart button spam (checking cart obsessively) ───
  try {
    console.log("Phase 4: Cart button spam...");
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => document.getElementById('cartBtn')?.click());
      await sleep(80); // 80ms between clicks — machine gun
    }

    // ─── PHASE 5: Newsletter form spam ───
    console.log("Phase 5: Newsletter spam...");
    await page.evaluate(() => {
      document.getElementById('newsletter')?.scrollIntoView({ behavior: 'instant' });
    });
    await sleep(200);

    const emails = [
      "spam1@botnet.io",
      "spam2@botnet.io",
      "spam3@botnet.io"
    ];

    for (const email of emails) {
      await page.focus('#emailInput');
      await page.click('#emailInput', { clickCount: 3 }); // select all
      await page.keyboard.type(email, { delay: 3 }); // 3ms per key — absurdly fast
      
      // Submit the form
      await page.evaluate(() => {
        document.getElementById('newsletterForm')?.dispatchEvent(new Event('submit', { cancelable: true }));
      });
      await sleep(200);
    }
  } catch (e) {
    console.log("Phases 4-5 blocked — DOM replaced by AI (BLOCK ENFORCED).");
  }

  console.log("Status: All phases complete. Awaiting AI verdict...");
  await sleep(5000);

  console.log("Bot terminating. (Check the Admin Dashboard for interception metrics)");
  await browser.close();
})();
