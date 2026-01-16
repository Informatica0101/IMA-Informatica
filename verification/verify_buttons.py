
import asyncio
from playwright.async_api import async_playwright
import subprocess
import os

SCREENSHOT_PATH = "verification/buttons_visible.png"
URL = "http://localhost:8000/teacher-dashboard.html"

async def main():
    os.makedirs(os.path.dirname(SCREENSHOT_PATH), exist_ok=True)

    server_process = subprocess.Popen(
        ['python3', '-m', 'http.server', '8000'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    await asyncio.sleep(2)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        # Mockear la función fetchApi para devolver exámenes en diferentes estados
        mock_api_script = """
        window.fetchApi = async (service, action) => {
            console.log(`[MOCK] Interceptando llamada a API: ${service} - ${action}`);
            if (service === 'EXAM' && action === 'getAllExams') {
                return {
                    status: 'success',
                    data: [
                        { examenId: 'EXM-001', titulo: 'Examen Activo', estado: 'Activo' },
                        { examenId: 'EXM-002', titulo: 'Examen Inactivo', estado: 'Inactivo' },
                        { examenId: 'EXM-003', titulo: 'Examen Bloqueado', estado: 'Bloqueado' }
                    ]
                };
            }
            // Devolver arrays vacíos para las otras llamadas
            return { status: 'success', data: [] };
        };
        """
        await page.add_init_script(mock_api_script)

        try:
            await page.goto("http://localhost:8000/index.html", wait_until="domcontentloaded")
            await page.evaluate(f'localStorage.setItem("currentUser", JSON.stringify({{ "nombre": "Profesor Oak", "rol": "Profesor" }}));')

            await page.goto(URL, wait_until="networkidle")
            await asyncio.sleep(3) # Espera extra para renderizado final

            # Tomar la captura de pantalla del dashboard
            await page.screenshot(path=SCREENSHOT_PATH)

        except Exception as e:
            print(f"Error durante la verificación visual: {e}")

        await browser.close()

    server_process.kill()

if __name__ == "__main__":
    asyncio.run(main())
