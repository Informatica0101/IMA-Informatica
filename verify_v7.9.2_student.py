
import asyncio
from playwright.async_api import async_playwright
import json

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # Test Case 1: Student Dashboard Filtering
        print("\n--- Testing Student Dashboard Filtering ---")
        page = await browser.new_page()

        mock_granular_config = [
            { "grado": "Décimo", "seccion": "A", "asignatura": "Materia 10A", "parcial": "I parcial" },
            { "grado": "Décimo", "seccion": "B", "asignatura": "Materia 10B", "parcial": "I parcial" },
            { "grado": "Undécimo", "seccion": "A", "asignatura": "Materia 11A", "parcial": "I parcial" }
        ]

        mock_config_res = {
            "ParcialActual": 'I parcial',
            "GradoActual": ['Décimo', 'Undécimo'],
            "SeccionActual": ['A', 'B'],
            "AsignaturaActual": ['Materia 10A', 'Materia 10B', 'Materia 11A'],
            "GranularConfig": mock_granular_config
        }

        await page.add_init_script(f"""
            localStorage.setItem('currentUser', JSON.stringify({{
                userId: 'stu-123',
                nombre: 'Estudiante Test',
                rol: 'Estudiante',
                grado: 'Décimo',
                seccion: 'A'
            }}));

            window.MOCK_CONFIG = {json.dumps(mock_config_res)};

            // Define fetchApi early
            window.fetchApi = async (service, action, payload, retry, options) => {{
                console.log('Mock fetchApi:', action, payload);
                if (action === 'getAcademicConfig') {{
                    if (options && options.onUpdate) options.onUpdate(window.MOCK_CONFIG);
                    return {{ status: 'success', data: window.MOCK_CONFIG }};
                }}
                if (action === 'getStudentTasks' || action === 'getStudentExams' || action === 'getAcademicHistory' || action === 'getLearningProfile') {{
                    return {{ status: 'success', data: [] }};
                }}
                return {{ status: 'success', data: [] }};
            }};

            // Pre-initialize GLOBAL_SCOPE to avoid race conditions with dashboards
            window.GLOBAL_SCOPE = window.MOCK_CONFIG;
        """)

        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        await page.goto('http://localhost:8080/student-dashboard.html')

        # Wait for either the card or the "no subjects" message
        try:
            await page.wait_for_selector('.subject-card h3, text="Sin asignaturas"', timeout=10000)
        except:
            pass

        # Debug current state
        debug_info = await page.evaluate("""() => {
            return {
                scope: window.GLOBAL_SCOPE,
                subjects: Array.from(document.querySelectorAll('.subject-card h3')).map(h => h.textContent.trim()),
                body: document.body.innerText.substring(0, 500)
            };
        }""")
        print(f"DEBUG: Subjects found: {debug_info['subjects']}")

        subjects = debug_info['subjects']
        if len(subjects) == 1 and subjects[0].upper() == "MATERIA 10A":
            print("SUCCESS: Student only sees their authorized subject.")
        else:
            print(f"FAILURE: Expected only ['MATERIA 10A'], got {subjects}")
            if len(subjects) == 0:
                print("No subjects rendered. Checking if 'Sin asignaturas' is present...")
                if "Sin asignaturas" in debug_info['body']:
                     print("Found 'Sin asignaturas' message.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_test())
