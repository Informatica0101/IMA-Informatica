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

        # Navegar a la página del examen con el ID del mock
        await page.goto("http://localhost:8000/exam.html?examenId=exam-with-questions")

        # Esperar a que el contenido se cargue
        await page.wait_for_selector("#questions-container")

        # Verificar que el título del examen es correcto
        await expect(page.locator("#exam-title")).to_have_text("Examen de Prueba (Con Preguntas)")

        # Verificar que se renderizan las preguntas
        await expect(page.locator(".question-block")).to_have_count(2)
        await expect(page.get_by_text("¿Cuál es la capital de Francia?")).to_be_visible()
        await expect(page.get_by_text("El agua hierve a 90 grados Celsius.")).to_be_visible()


        # Tomar captura de pantalla
        screenshot_path = "verification/exam_questions_visible.png"
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        await browser.close()

        # Verificar que no hubo errores
        if any("error" in log.lower() for log in error_logs):
            print("Se encontraron errores en la consola:")
            print("\n".join(error_logs))
        else:
            print("Verificación exitosa: No se encontraron errores en la consola.")

if __name__ == "__main__":
    asyncio.run(main())
