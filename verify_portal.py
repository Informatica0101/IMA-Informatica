import asyncio
from playwright.async_api import async_playwright

async def verify_portal():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        # Test Login Page (Recovery link)
        try:
            print("Checking Login Page...")
            await page.goto("http://localhost:8000/login.html")
            await page.wait_for_timeout(1000)
            recovery_link = await page.query_selector("a[href='recovery.html']")
            print(f"Recovery link present: {recovery_link is not None}")
            await page.screenshot(path="verify_login.png")
        except Exception as e:
            print(f"Error checking login: {e}")

        # Test Student Dashboard (Profile modal)
        try:
            print("Checking Student Dashboard UI...")
            await page.goto("http://localhost:8000/student-dashboard.html")
            await page.wait_for_timeout(1000)
            # Mock login state
            await page.evaluate("localStorage.setItem('user', JSON.stringify({userId: 'USR-123', nombre: 'Test Student', rol: 'Estudiante', grado: '10', seccion: 'A'}))")
            await page.reload()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="verify_student_dashboard.png")
        except Exception as e:
            print(f"Error checking student dashboard: {e}")

        # Test Teacher Dashboard
        try:
            print("Checking Teacher Dashboard UI...")
            await page.goto("http://localhost:8000/teacher-dashboard.html")
            await page.wait_for_timeout(1000)
            # Mock login state
            await page.evaluate("localStorage.setItem('user', JSON.stringify({userId: 'TCH-123', nombre: 'Test Teacher', rol: 'Profesor'}))")
            await page.reload()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="verify_teacher_dashboard.png")
        except Exception as e:
            print(f"Error checking teacher dashboard: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_portal())
