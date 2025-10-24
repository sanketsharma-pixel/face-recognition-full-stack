
import time
from playwright.sync_api import sync_playwright

time.sleep(15)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3000/")
    page.get_by_label("Email").fill("test@example.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Sign in").click()
    page.wait_for_selector("text=Sign Out")
    page.get_by_role("textbox").fill("https://clarifai.com/cms-assets/20180320212159/face-001.jpg")
    page.get_by_role("button", name="Detect").click()
    page.wait_for_selector(".bounding-box")
    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()
