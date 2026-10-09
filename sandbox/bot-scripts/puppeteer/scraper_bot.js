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
  console.log("🤖 SCRAPER BOT INITIALIZED");
  console.log("Objective: Rip text instantly via zero-variance mouse teleportation.");
  console.log("Targeting:", url);
  
  const browser = await puppeteer.launch({ 
    headless: false, // Must be false so the audience sees the browser open!
    defaultViewport: null 
  });
  
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  console.log("Status: Infiltrated Target Site. Executing rapid rigid maneuvers...");
  
  // Wait for Tracker to load
  await sleep(1500);

  // The bot clicks in perfect straight lines across the screen multiple times per second
  // This produces an entropy score of 0.0, immediately flagging the Random Forest model
  for (let i = 0; i < 30; i++) {
    await page.mouse.move(Math.random() * 800, 200, { steps: 1 }); // Instant jump (Machine-like)
    await page.mouse.down();
    await page.mouse.up();
    await sleep(20); // Static rigid delay variance (Machine-like)
    
    await page.mouse.move(100, Math.random() * 600, { steps: 1 }); // Instant jump
    await page.mouse.down();
    await page.mouse.up();
    await sleep(20);
  }

  console.log("Status: Activity complete. Waiting 4 seconds for AI processing...");
  await sleep(4000);
  
  console.log("Bot terminating. (Check the Admin Dashboard for interception metrics)");
  await browser.close();
})();
