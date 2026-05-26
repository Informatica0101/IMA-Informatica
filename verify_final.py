import asyncio
from playwright.async_api import async_playwright

async def verify_final():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        # 1. Test Global Login UI on Index
        try:
            print("Checking Guest Index...")
            await page.goto("http://localhost:8000/index.html")
            await page.wait_for_timeout(1000)
            # Check news section (should be visible if backend returned data)
            news_section = await page.query_selector("#news-section")
            print(f"News section visible: {news_section is not None}")

            print("Mocking Student Login (10th Grade)...")
            await page.evaluate("localStorage.setItem('currentUser', JSON.stringify({userId: 'USR-10-A', nombre: 'Juan 10A', rol: 'Estudiante', grado: 'Décimo', seccion: 'A'}))")
            await page.reload()
            await page.wait_for_timeout(1000)

            # Check segmentation: Courses should show 10th grade
            courses_btn = await page.query_selector("button:has-text('Cursos')")
            if courses_btn:
                await courses_btn.hover()
                await page.wait_for_timeout(500)
                grades_menu = await page.inner_text("#desktop-grades-menu")
                print(f"Grades in menu: {grades_menu}")

        except Exception as e:
            print(f"Error checking Index/Segmentation: {e}")

        # 2. Test Pseudocode Arrays
        try:
            print("Checking Pseudocode Arrays...")
            await page.goto("http://localhost:8000/pseudocode.html")
            await page.wait_for_timeout(1000)

            # Set Strict Profile
            await page.click("div.menu-item:has-text('Herramientas')")
            await page.click("text=Modo Estricto")

            # Input code with Dimension and Assignment
            code = """Algoritmo TestArreglos
    Definir miArreglo como Entero;
    Dimension miArreglo[5];
    miArreglo[1] <- 10;
    Escribir miArreglo[1];
FinAlgoritmo"""

            await page.evaluate(f"document.getElementById('codeEditor').innerText = `{code}`")
            await page.evaluate("updateEditor()")

            # Run
            await page.click("button[title='Ejecutar']")
            await page.wait_for_timeout(2000)

            console_output = await page.inner_text("#consoleOutput")
            print(f"Console Output:\n{console_output}")

            await page.screenshot(path="verify_pseudocode_run.png")
        except Exception as e:
            print(f"Error checking Pseudocode Arrays: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_final())
