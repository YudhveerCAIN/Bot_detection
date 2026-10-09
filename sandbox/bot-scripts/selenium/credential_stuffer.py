# -*- coding: utf-8 -*-
import sys, os, time
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By

# Load ENV variables
current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(current_dir, '.env'))
TARGET_URL = os.getenv("TARGET_URL", "https://bot-target-site.netlify.app/")

print("CREDENTIAL STUFFER INIT (Python Selenium)")
print(f"Targeting Node: {TARGET_URL}")

# Boot up the browser
options = webdriver.ChromeOptions()
# Not using headless so the presentation audience can watch the browser execute
driver = webdriver.Chrome(options=options)

try:
    driver.get(TARGET_URL)
    print("Status: Connected. Waiting for page load...")
    
    # Wait for the AI tracker to initialize
    time.sleep(2)

    # Open the login modal first (NovaMart requires clicking Sign In)
    login_btn = driver.find_element(By.ID, "openLogin")
    login_btn.click()
    time.sleep(0.5)
    print("Status: Login modal opened. Injecting hostile payload...")

    username_field = driver.find_element(By.ID, "username")
    password_field = driver.find_element(By.ID, "password")
    submit_button = driver.find_element(By.ID, "submitBtn")
    
    # Brute force credential stuffing with absolute rigid timing (flags AI detection instantly)
    # The machine loops perfect robotic cycles without mouse movement or key variance.
    for i in range(5):
        try:
            print(f"Attempt {i+1}...")
            username_field = driver.find_element(By.ID, "username")
            password_field = driver.find_element(By.ID, "password")
            submit_button = driver.find_element(By.ID, "submitBtn")

            username_field.clear()
            password_field.clear()
            
            # 'send_keys' executes with 0 ms variance between keystrokes by default
            username_field.send_keys(f"hacked_admin_{i}@example.com")
            password_field.send_keys("p4ssw0rd!123")
            submit_button.click()
            
            # Wait for the fake page response
            time.sleep(1.5)
        except Exception as e:
            print(f"Attempt {i+1} blocked — DOM replaced by AI (BLOCK ENFORCED). {e}")
            break

    print("Status: Operation complete. AI Behavioral model should have logged exact mathematical anomalies.")
    # Keep the browser open briefly to see the red "BLOCK ENFORCED" trap page
    time.sleep(4)

finally:
    driver.quit()
    print("Bot Offline.")
