
import asyncio
from playwright.async_api import async_playwright
import subprocess
import os

LOG_FILE_PATH = "verification/console.log"
URL = "http://localhost:8000/teacher-dashboard.html"
USER_DATA = {
    "nombre": "Profesor Oak",
    "rol": "Profesor"
}

async def main():
    # Asegurarse de que el directorio de verificación exista
    os.makedirs(os.path.dirname(LOG_FILE_PATH), exist_ok=True)

    # Iniciar el servidor web en segundo plano
    server_process = subprocess.Popen(
        ['python3', '-m', 'http.server', '8000'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    await asyncio.sleep(2) # Dar tiempo al servidor para que inicie

    console_messages = []
    def handle_console(msg):
        # Almacenar cada mensaje de la consola en la lista
        console_messages.append(f"[{msg.type.upper()}] {msg.text}\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        # Registrar el manejador de eventos de la consola
        page.on("console", handle_console)

        # Mockear la función fetchApi para simular las respuestas de la API
        # Esto nos permite probar el frontend de forma aislada
        mock_api_script = """
        window.fetchApi = async (service, action) => {
            console.log(`[MOCK] Interceptando llamada a API: ${service} - ${action}`);
            if (service === 'EXAM' && action === 'getAllExams') {
                return {
                    status: 'success',
                    data: [
                        { examenId: 'EXM-001', titulo: 'Examen de Prueba Activo', estado: 'Activo' },
                        { examenId: 'EXM-002', titulo: 'Examen de Prueba Inactivo', estado: 'Inactivo' },
                        { examenId: 'EXM-003', titulo: 'Examen de Prueba Bloqueado', estado: 'Bloqueado' }
                    ]
                };
            }
            // Devolver arrays vacíos para las otras llamadas para simplificar
            return { status: 'success', data: [] };
        };
        """
        await page.add_init_script(mock_api_script)

        try:
            # Navegar a una página del origen para establecer el localStorage
            await page.goto("http://localhost:8000/index.html", wait_until="domcontentloaded")

            # Inyectar el usuario actual en localStorage para evitar el redireccionamiento al login
            await page.evaluate(f'localStorage.setItem("currentUser", JSON.stringify({{ "nombre": "Profesor Oak", "rol": "Profesor" }}));')

            # Navegar a la página del dashboard del profesor
            await page.goto(URL, wait_until="networkidle")

            # Esperar un momento para asegurar que todos los scripts asíncronos se completen
            await asyncio.sleep(3)

        except Exception as e:
            console_messages.append(f"[ERROR] No se pudo cargar la página: {e}\n")

        await browser.close()

    # Escribir los mensajes de la consola capturados en el archivo de log
    with open(LOG_FILE_PATH, "w", encoding='utf-8') as f:
        f.writelines(console_messages)

    # Detener el servidor web
    server_process.kill()

if __name__ == "__main__":
    asyncio.run(main())
