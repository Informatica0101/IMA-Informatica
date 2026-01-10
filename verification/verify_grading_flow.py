
import asyncio
import json
from playwright.async_api import async_playwright, expect

async def main():
    # --- Mock Data ---
    MOCK_USER = {
        "nombre": "Profesor Test", "email": "profesor.test@example.com", "rol": "Profesor"
    }
    MOCK_SUBMISSION_DETAILS = {
        "status": "success",
        "data": {
            "details": [
                {"preguntaId": "P1", "textoPregunta": "¿Cuál es la capital de Francia?", "preguntaTipo": "opcion_multiple", "respuestaCorrecta": "París", "respuestaEstudiante": "París", "esCorrecta": True},
                {"preguntaId": "P2", "textoPregunta": "El agua hierve a 100°C.", "preguntaTipo": "verdadero_falso", "respuestaCorrecta": "Verdadero", "respuestaEstudiante": "Falso", "esCorrecta": False},
                {"preguntaId": "P3", "textoPregunta": "Completa la frase: 'El sol es ___.'", "preguntaTipo": "completacion", "respuestaCorrecta": "amarillo", "respuestaEstudiante": "caliente", "esCorrecta": False}
            ],
            "studentName": "Estudiante de Prueba",
            "currentGrade": "33.33",
            "currentStatus": "Entregado",
            "currentComment": "Revisión inicial automática."
        }
    }
    EXAM_SERVICE_URL = 'https://script.google.com/macros/s/AKfycbyVn6NlBCsMEoB9s8Vwz3bnGv-J-CjQzpfY8_hJ5iLwD__-TBNq2FHIwKCzZMsTf-7c/exec'

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Intercept the API call for submission details
        await page.route(
            lambda url: EXAM_SERVICE_URL in url and "getSubmissionDetails" in url,
            lambda route: route.fulfill(status=200, json=MOCK_SUBMISSION_DETAILS)
        )

        # Start the local server
        server_process = await asyncio.create_subprocess_shell(
            "python3 -m http.server 8000",
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )

        try:
            await asyncio.sleep(2) # Wait for server

            # Navigate to the grading view directly
            await page.goto("http://localhost:8000/exam-manager.html")
            await page.evaluate(f"localStorage.setItem('currentUser', JSON.stringify({json.dumps(MOCK_USER)}))")
            await page.goto("http://localhost:8000/exam-manager.html?entregaExamenId=EEX-12345&view=grading")

            # --- Assertions ---
            print("Verifying grading view...")
            await expect(page.locator("h2")).to_contain_text("Revisión para: Estudiante de Prueba")

            # Check if all questions are rendered
            await expect(page.locator(".p-4.rounded.border")).to_have_count(3)

            # Check correct answer style
            await expect(page.locator(".p-4.rounded.border").first).to_have_class(lambda class_list: "bg-green-100" in class_list)

            # Check incorrect answer style
            await expect(page.locator(".p-4.rounded.border").last).to_have_class(lambda class_list: "bg-red-100" in class_list)

            # Check grading form is pre-filled
            await expect(page.locator("#calificacion")).to_have_value("33.33")
            await expect(page.locator("#estado")).to_have_value("Entregado")
            await expect(page.locator("#comentario")).to_have_value("Revisión inicial automática.")

            print("Verification successful.")

            # --- Screenshot ---
            screenshot_path = "verification/teacher_grading_view.png"
            await page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="verification/error_screenshot.png")
        finally:
            server_process.kill()
            await server_process.wait()
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
