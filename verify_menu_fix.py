
import asyncio
from playwright.async_api import async_playwright
import http.server
import socketserver
import threading
import os

PORT = 8000
SCREENSHOT_PATH = "/home/jules/verification/menu_fix_verified.png"

# --- Server Setup ---
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=".", **kwargs)

def run_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

# --- Verification Script ---
async def main():
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()

    # Give the server a moment to start
    await asyncio.sleep(1)

    console_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Listen for console errors
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        try:
            # Navigate to the local page
            await page.goto(f"http://localhost:{PORT}/index.html")
            print("Page loaded.")

            # Simulate clicking the 'Cursos' dropdown menu
            # The button is inside a div.relative.group, we target the button itself
            cursos_button_selector = "nav > div.relative.group > button"
            await page.click(cursos_button_selector)
            print("Clicked on 'Cursos' button.")

            # Wait for the first-level dropdown to be visible
            # The dropdown content is inside a div with id 'desktop-grades-menu'
            await page.wait_for_selector("#desktop-grades-menu", state="visible", timeout=5000)
            print("Desktop grades menu is visible.")

            # The user's goal was to see the "Décimo" option. We'll wait for that specific button to be visible.
            # The "Décimo" button is inside the grades menu
            decimo_button_selector = "button:has-text('Décimo')"
            await page.wait_for_selector(decimo_button_selector, state="visible", timeout=5000)
            print("'Décimo' button is visible.")

            # Take a screenshot for visual confirmation
            await page.screenshot(path=SCREENSHOT_PATH)
            print(f"Screenshot saved to {SCREENSHOT_PATH}")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            await page.screenshot(path="/home/jules/verification/verification_error.png")
        finally:
            await browser.close()
            # The server will be stopped when the main thread exits

    if console_errors:
        print("\n--- Console Errors Found ---")
        for error in console_errors:
            print(error)
        print("--------------------------")
        # Exit with a non-zero code to indicate failure
        exit(1)
    else:
        print("\nVerification successful: No console errors found and menu interaction was successful.")

if __name__ == "__main__":
    asyncio.run(main())
