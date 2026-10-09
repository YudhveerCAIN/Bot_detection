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
  console.log("🎯 SNIPER BOT INITIALIZED");
  console.log("Objective: Wait patiently without mouse movement, then trigger specific API elements instantly.");
  console.log("Targeting:", url);
  
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle2' });
  console.log("Status: Camping...");
  
  // Wait silently for 2 seconds. A human always jiggles their mouse to some degree.
  // A bot stays mathematically dead-still.
  await sleep(2000);
  
  console.log("Status: Opening login modal...");
  
  // Click the "Sign In" button to open the login modal
  await page.click('#openLogin');
  await sleep(500);
  
  console.log("Status: Executing precision strike...");
  
  // Focus the input, but bypass moving the mouse there. Just type instantly with zero key_delay_std variance
  await page.focus('#username');
  await page.keyboard.type("admin_sniper@example.com", { delay: 1 }); // 1ms delay is inhuman
  
  await page.focus('#password');
  await page.keyboard.type("snip3r_br0ute!!", { delay: 1 });

  // Instantly click submit
  await page.click('#submitBtn');
  
  console.log("Status: Form submitted. Awaiting AI response block...");
  await sleep(4000);
  
  await browser.close();
})();
