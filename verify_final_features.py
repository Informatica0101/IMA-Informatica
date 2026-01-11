
import asyncio
import json
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            # Go to login page
            await page.goto("http://localhost:8000/login.html")

            # Mock user data for professor and student
            teacher_user = {
                "id": "USR-123", "nombre": "Profesor Oak", "rol": "Profesor",
                "grado": "", "seccion": ""
            }
            student_user = {
                "id": "USR-456", "nombre": "Ash Ketchum", "rol": "Estudiante",
                "grado": "Décimo", "seccion": "A"
            }

            # --- Test Professor Dashboard ---
            print("--- Testing Professor Dashboard ---")
            await page.evaluate(f"localStorage.setItem('currentUser', JSON.stringify({teacher_user}))")
            await page.goto("http://localhost:8000/teacher-dashboard.html")

            # Wait for the dashboard to load and check the teacher's name
            await expect(page.locator("#teacher-name")).to_have_text("Profesor Oak")
            print("Professor name verified.")

            # Check if the activity table loads
            await page.wait_for_function("() => document.getElementById('submissions-table-body').children.length > 0")
            print("Activity table loaded.")

            # --- Test Exam Creation ---
            print("\n--- Testing Exam Creation ---")
            await page.click("#nav-crear-examen")
            await expect(page.locator("#section-crear-examen")).not_to_have_class("hidden")
            print("Navigated to exam creation section.")

            # Fill out exam details
            await page.fill("#exam-titulo", "Examen Final de Biología")
            await page.fill("#exam-asignatura", "Biología")
            await page.select_option("#exam-grado", "Décimo")
            await page.fill("#exam-seccion", "A")
            await page.fill("#exam-fechaLimite", "2024-12-31")
            await page.fill("#exam-tiempoLimite", "45")
            print("Filled exam details.")

            # Add a multiple choice question
            await page.fill("#questions-container .question-block:first-child textarea[data-name='textoPregunta']", "What is the powerhouse of the cell?")
            await page.select_option("#questions-container .question-block:first-child select[data-name='preguntaTipo']", "opcion_multiple")
            await page.fill("#questions-container .question-block:first-child input[data-name='opcionA']", "Mitochondria")
            await page.fill("#questions-container .question-block:first-child input[data-name='opcionB']", "Nucleus")
            await page.fill("#questions-container .question-block:first-child input[data-name='opcionC']", "Ribosome")
            await page.select_option("#questions-container .question-block:first-child select[data-name='respuestaCorrecta']", "A")
            print("Filled multiple choice question.")

            # Add a second question (fill-in-the-blank)
            await page.click("#add-question-btn")
            await page.wait_for_selector("#questions-container .question-block:nth-child(2)")
            await page.fill("#questions-container .question-block:nth-child(2) textarea[data-name='textoPregunta']", "The chemical formula for water is __.")
            await page.select_option("#questions-container .question-block:nth-child(2) select[data-name='preguntaTipo']", "completacion")
            await page.fill("#questions-container .question-block:nth-child(2) input[data-name='respuestaCorrecta']", "H2O")
            print("Filled second question (completion).")

            print("Exam creation form filled. Submitting is mocked.")

            # --- Test Student Dashboard & Exam Taking ---
            print("\n--- Testing Student View ---")
            await page.evaluate(f"localStorage.setItem('currentUser', JSON.stringify({student_user}))")
            await page.goto("http://localhost:8000/student-dashboard.html")

            # Check student name
            await expect(page.locator("#student-name")).to_have_text("Ash Ketchum")
            print("Student name verified.")

            # This part is harder to test without real backend data,
            # but we can check if the main component is there.
            await expect(page.locator("#tasks-list")).to_be_visible()
            print("Student dashboard task list is visible.")

            # --- Test Navigation to Exam Page (mock) ---
            print("\n--- Testing Exam Taking (Navigation) ---")

            # Mock the API response for getExamQuestions to simulate a real exam load
            async def handle_route(route):
                # Ensure we only process POST requests with post_data
                if route.request.method == "POST" and route.request.post_data and "getExamQuestions" in route.request.post_data:
                    mock_response = {
                        "status": "success",
                        "data": {
                            "titulo": "Mock Exam Title",
                            "tiempoLimite": "1",
                            "preguntas": [
                                {"preguntaId": "Q1", "preguntaTipo": "opcion_multiple", "textoPregunta": "Test Question 1?", "opciones": {"A": "Opt A", "B": "Opt B"}},
                                {"preguntaId": "Q2", "preguntaTipo": "completacion", "textoPregunta": "Test Question 2?"}
                            ]
                        }
                    }
                    await route.fulfill(status=200, content_type="application/json", body=json.dumps(mock_response))
                else:
                    await route.continue_()

            await page.route("**/*", handle_route)

            # Dismiss alerts that the page may trigger (e.g., for fullscreen)
            page.on("dialog", lambda dialog: dialog.dismiss())

            # Navigate to the exam page
            await page.goto("http://localhost:8000/exam.html?examId=EXM-TEST123")

            # Check if the exam page loads with mocked data
            await expect(page.locator("#exam-title")).to_have_text("Mock Exam Title")
            await expect(page.locator("#timer")).not_to_be_empty()
            await expect(page.locator("#questions-container")).not_to_be_empty()
            print("Exam page loaded correctly with mocked data.")

            # --- Take Screenshot ---
            screenshot_path = "final_features_verification.png"
            await page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

            print("\nVerification script completed successfully!")

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="error_screenshot.png")

        finally:
            await browser.close()

asyncio.run(main())
