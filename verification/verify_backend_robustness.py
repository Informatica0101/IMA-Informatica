import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # --- Enhanced Logging ---
        all_console_messages = []
        page.on("console", lambda msg: all_console_messages.append(f"[{msg.type.upper()}] {msg.text}"))

        def log_request(request):
            print(f">> REQ: {request.method} {request.url}")

        def log_response(response):
            print(f"<< RES: {response.status} {response.url}")

        page.on("request", log_request)
        page.on("response", log_response)
        # --- End Enhanced Logging ---

        try:
            await page.goto("http://localhost:8000/login.html", timeout=60000)
            print("Navegado a login.html")

            await page.fill("#email", "test@student.com")
            await page.fill("#password", "password123")

            print("Haciendo clic en el botón de login...")
            # We will now wait for the URL to change, which is the ultimate success condition
            await page.click("button[type='submit']")

            await expect(page).to_have_url("http://localhost:8000/student.html", timeout=15000)
            print("Redirección a student.html exitosa.")

            await expect(page.locator("#activity-list")).not_to_be_empty(timeout=20000)
            print("La lista de actividades se ha cargado.")

            print("\nVerificación completada exitosamente.")

        except Exception as e:
            print(f"\n--- Falló la Verificación ---")
            print(f"Error: {e}")
            print("---------------------------")
            await page.screenshot(path="verification/error_screenshot_detailed.png")
            print("Screenshot guardado en verification/error_screenshot_detailed.png")

        finally:
            print("\n--- Mensajes de Consola Capturados ---")
            if all_console_messages:
                for msg in all_console_messages:
                    print(msg)
            else:
                print("No se capturaron mensajes de consola.")
            print("------------------------------------")
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
