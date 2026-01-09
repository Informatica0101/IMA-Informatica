
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Log errors
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        try:
            # Verify index.html login link
            await page.goto("http://localhost:8000/index.html")
            await page.click('a:has-text("Area de Informatica")')
            await page.wait_for_url("http://localhost:8000/login.html")
            print("Successfully navigated to login page from index.")

            # Login as student
            await page.fill('#email', "student@example.com")
            await page.fill('#password', "password123")
            await page.click('button[type="submit"]')
            await page.wait_for_url("http://localhost:8000/student-dashboard.html")
            print("Successfully logged in as student.")

            # Verify student can see exams
            await page.wait_for_selector('text="Realizar Examen"')
            print("Successfully found exam on student dashboard.")

            # Verify student logout
            await page.click("#logout-button")
            await page.wait_for_url("http://localhost:8000/login.html")
            print("Successfully logged out as student.")

            print("Test finished")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            await browser.close()

asyncio.run(main())
