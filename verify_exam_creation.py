
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Log errors
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        try:
            # Create a unique email for the new user
            import time
            timestamp = int(time.time())
            new_email = f"profesor{timestamp}@example.com"
            new_password = "password123"

            # Go to registration page
            await page.goto("http://localhost:8000/register.html")

            # Register a new professor
            await page.fill('#nombre', "Test Professor")
            await page.select_option('#grado', "Décimo")
            await page.fill('#seccion', "A")
            await page.fill('#email', new_email)
            await page.fill('#password', new_password)

            # The page automatically redirects to login after successful registration
            await page.click('button[type="submit"]')
            await page.wait_for_url("http://localhost:8000/login.html")

            # Login with the new credentials
            await page.fill('#email', new_email)
            await page.fill('#password', new_password)
            await page.click('button[type="submit"]')
            await page.wait_for_url("http://localhost:8000/teacher-dashboard.html")

            # Now on the dashboard, navigate to exam creation
            await page.click("#nav-crear-examen")

            # Fill out exam details
            await page.fill("#exam-titulo", "Test Exam")
            await page.fill("#exam-asignatura", "Test Subject")
            await page.select_option("#exam-grado", "Décimo")
            await page.fill("#exam-seccion", "A")
            await page.fill("#exam-fechaLimite", "2024-12-31")
            await page.fill("#exam-tiempoLimite", "60")

            # Add a question
            await page.click("#add-question-btn")
            await page.wait_for_selector(".question-block")

            # Fill out the question
            await page.fill(".question-text", "What is 2 + 2?")
            await page.fill(".question-options", "3,4,5")
            await page.fill(".correct-answer", "4")

            # Save exam
            await page.click('#create-exam-form button[type="submit"]')

            print("Test finished")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            await browser.close()

asyncio.run(main())
