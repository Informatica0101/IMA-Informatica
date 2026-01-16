
import asyncio
from playwright.async_api import async_playwright
import subprocess
import os

SCREENSHOT_PATH = "verification/robustness_check.png"
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

        # Mockear la función fetchApi para simular un fallo en una de las llamadas
        # devolviendo `undefined` para `getAllExams`.
        mock_api_script = """
        window.fetchApi = async (service, action) => {
            console.log(`[MOCK] Interceptando llamada a API: ${service} - ${action}`);
            if (service === 'EXAM' && action === 'getAllExams') {
                // Simular un fallo de la API que devuelve undefined
                console.log('[MOCK] Devolviendo undefined para getAllExams');
                return undefined;
            }
            if (service === 'TASK' && action === 'getTeacherActivity') {
                 return { status: 'success', data: [{ tipo: 'Tarea', titulo: 'Tarea de prueba' }] };
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
            await asyncio.sleep(3)

            # Tomar la captura de pantalla del dashboard
            await page.screenshot(path=SCREENSHOT_PATH)

        except Exception as e:
            print(f"Error durante la verificación de robustez: {e}")

        await browser.close()

    server_process.kill()

if __name__ == "__main__":
    asyncio.run(main())
