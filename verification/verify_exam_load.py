import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Iniciar sesión como estudiante
        await page.goto("http://localhost:8000/login.html")
        await page.evaluate("""
            localStorage.setItem('currentUser', JSON.stringify({
                nombre: 'Estudiante de Prueba',
                rol: 'Estudiante',
                userId: 'test-student-id'
            }));
        """)

        # Escuchar errores en la consola
        error_logs = []
        page.on("console", lambda msg: error_logs.append(msg.text) if msg.type == "error" else None)

        # Navegar a la página del examen con un ID de prueba
        await page.goto("http://localhost:8000/exam.html?examenId=no-questions-exam")

        # Esperar a que el contenido se cargue
        await page.wait_for_selector("#questions-container")

        # Verificar que se muestra el mensaje para examen vacío
        await expect(page.locator("#questions-container")).to_have_text("Este examen no tiene preguntas actualmente.")

        # Tomar captura de pantalla
        screenshot_path = "verification/exam_load_no_questions.png"
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        await browser.close()

        # Verificar que no hubo errores críticos de JS
        has_type_error = any("TypeError" in log for log in error_logs)
        if has_type_error:
            print("Error: Se encontró un TypeError en la consola.")
            print("\n".join(error_logs))
            exit(1)
        else:
            print("Verificación exitosa: No se encontraron TypeErrors en la consola.")

if __name__ == "__main__":
    asyncio.run(main())
