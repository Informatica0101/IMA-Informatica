import asyncio
from playwright.async_api import async_playwright
import os
import json
import subprocess
import time

async def run_matrix_test():
    # Iniciar servidor local
    server = subprocess.Popen(["python3", "-m", "http.server", "8000"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2) # Esperar a que el servidor inicie

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Matriz de Pruebas: Estudiante 11vo (Debe ver 10mo y 11vo)
        user_11 = {
            "userId": "USR-TEST-11",
            "nombre": "Estudiante 11vo",
            "grado": "Undécimo",
            "seccion": "A",
            "rol": "Estudiante"
        }

        # Simular Login y Stats (Sin aprobaciones)
        await page.goto("http://localhost:8000/juegos/quizpro.html")
        await page.evaluate(f"localStorage.setItem('currentUser', '{json.dumps(user_11)}')")

        # Mock de API para obtener stats vacíos (Bloqueo Cross-Grade activo)
        await page.route("**/macros/s/*/exec", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"status": "success", "data": {}, "allHistory": []})
        ))

        await page.reload()
        await page.wait_for_selector("button:has-text('Empezar')")

        # TEST 1: Verificar Navegación a Asignaturas
        await page.click("button:has-text('Empezar')")
        await page.wait_for_selector("#subjects-grid")

        # Capturar pantalla de asignaturas para 11vo
        await page.screenshot(path="verification/screenshots/subjects_Estudiante_11.png")
        print("Capturada pantalla de asignaturas para Estudiante 11vo")

        # TEST 2: Verificar Bloqueo Cross-Grade (11vo bloqueado si 10mo no aprobado)
        # Ofimatica es de 11vo. Informatica I es de 10mo.
        is_ofimatica_locked = await page.evaluate('''() => {
            const cards = Array.from(document.querySelectorAll('.subject-card'));
            const ofimatica = cards.find(c => c.innerText.includes('Ofimatica'));
            return ofimatica.classList.contains('cursor-not-allowed');
        }''')
        print(f"Ofimática (11vo) bloqueada para alumno de 11vo sin 10mo aprobado: {is_ofimatica_locked}")

        # TEST 3: Desbloquear con Stats simulados
        stats_approved = {
            "QuizPro_Informatica_Decimo_Basico": {"maxScore": 85, "grade": "10", "subject": "Informatica", "level": "Básico"}
        }
        print("Injecting stats:", stats_approved)
        await page.evaluate(f"window.userGameStats = {json.dumps(stats_approved)}")
        # Mejor usar el botón de cerrar o retroceder
        await page.evaluate("navigateToSubjects()") # Llamada directa para refrescar vista

        await page.wait_for_timeout(1000)
        is_ofimatica_unlocked = await page.evaluate('''() => {
            const cards = Array.from(document.querySelectorAll('.subject-card'));
            const ofimatica = cards.find(c => c.innerText.includes('Ofimatica'));
            return ofimatica && !ofimatica.classList.contains('cursor-not-allowed');
        }''')
        print(f"Ofimática (11vo) desbloqueada tras aprobar Informática I (10mo): {is_ofimatica_unlocked}")
        await page.screenshot(path="verification/screenshots/subjects_Estudiante_11_unlocked.png")

        await browser.close()

    server.terminate()

if __name__ == "__main__":
    asyncio.run(run_matrix_test())
