
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Log errors
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        try:
            # Login
            await page.goto("http://localhost:8000/login.html")
            await page.fill('#email', "profesor@example.com")
            await page.fill('#password', "password123")
            await page.click('button[type="submit"]')
            await page.wait_for_url("http://localhost:8000/teacher-dashboard.html")

            # Navigate to exam creation
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
