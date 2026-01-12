# verification/verify_login_flow.py
import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Lista para almacenar los mensajes de la consola
        console_logs = []

        # Escuchar los eventos de la consola y almacenar los mensajes
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        try:
            print("--- Iniciando servidor local ---")
            # Iniciar un servidor web local en segundo plano
            server_process = await asyncio.create_subprocess_shell(
                "python3 -m http.server 8000",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await asyncio.sleep(2) # Dar tiempo al servidor para que inicie

            print("--- Navegando a la página de login ---")
            await page.goto("http://localhost:8000/login.html")

            print("--- Rellenando credenciales incorrectas ---")
            await page.fill("#email", "test@test.com")
            await page.fill("#password", "wrongpassword")

            print("--- Enviando formulario ---")
            await page.click("button[type='submit']")

            # Esperar un poco para que se procese la respuesta de la API
            await page.wait_for_timeout(3000)

            print("\n--- Verificación completada ---")

        except Exception as e:
            print(f"\n--- Ocurrió un error durante la verificación ---")
            print(e)

        finally:
            print("\n--- Logs de la Consola del Navegador ---")
            error_found = False
            for log in console_logs:
                print(log)
                if "[error]" in log and "Failed to fetch" in log:
                    error_found = True
                if "ReferenceError" in log:
                    error_found = True

            print("\n--- Resultado de la Verificación ---")
            if error_found:
                print("🛑 Error: Se encontraron errores críticos ('Failed to fetch' o 'ReferenceError').")
            else:
                print("✅ Éxito: No se encontraron los errores reportados.")

            await browser.close()
            # Terminar el proceso del servidor
            if 'server_process' in locals() and server_process.returncode is None:
                server_process.kill()
                await server_process.wait()
                print("\n--- Servidor local detenido ---")


if __name__ == "__main__":
    asyncio.run(main())
