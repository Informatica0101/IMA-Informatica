import asyncio
from playwright.async_api import async_playwright
import os

async def verify_modal_history():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 720})
        page = await context.new_page()

        # Go to index
        await page.goto('http://localhost:8080/index.html')

        # Login as Professor
        await page.evaluate("""() => {
            localStorage.setItem('currentUser', JSON.stringify({
                nombre: 'Profesor Test',
                rol: 'Profesor',
                id: 'prof123',
                grado: 'Undécimo',
                seccion: 'A'
            }));
            localStorage.setItem('academic_config_cache', JSON.stringify([
                { grado: 'Undécimo', seccion: 'A', asignatura: 'Matemáticas' },
                { grado: 'Undécimo', seccion: 'A', asignatura: 'Física' }
            ]));
        }""")
        await page.reload()

        # Open Academic Menu (Modal)
        await page.evaluate("window.openAcademicMenu()")
        await page.wait_for_selector('#academic-menu-modal', state='visible')
        await asyncio.sleep(1)
        await page.screenshot(path='/home/jules/verification/screenshots/modal_0_root.png')

        # Select "Presentaciones"
        print("Clicking Presentaciones...")
        await page.click('#academic-menu-options button:has(h3:has-text("Presentaciones"))')
        await asyncio.sleep(1)
        await page.screenshot(path='/home/jules/verification/screenshots/modal_1_grades.png')

        # Click a Grade (Undécimo)
        print("Clicking Undécimo...")
        await page.click('#hierarchy-options button:has-text("Undécimo")')
        await asyncio.sleep(1)
        await page.screenshot(path='/home/jules/verification/screenshots/modal_2_sections.png')

        # Click a Section (A)
        print("Clicking Sección A...")
        await page.click('#hierarchy-options button:has-text("A")')
        await asyncio.sleep(1)
        await page.screenshot(path='/home/jules/verification/screenshots/modal_3_partials.png')

        # Click a Partial (Primer Parcial)
        print("Clicking Primer Parcial...")
        await page.click('#hierarchy-options button:has-text("Primer Parcial")')
        await asyncio.sleep(1)
        await page.screenshot(path='/home/jules/verification/screenshots/modal_4_subjects.png')

        # Now use Browser Back
        print("Going back to Partials...")
        await page.go_back()
        await asyncio.sleep(1)
        await page.screenshot(path='/home/jules/verification/screenshots/modal_back_to_partials.png')

        # Go back again
        print("Going back to Sections...")
        await page.go_back()
        await asyncio.sleep(1)
        await page.screenshot(path='/home/jules/verification/screenshots/modal_back_to_sections.png')

        # Go back again
        print("Going back to Grades...")
        await page.go_back()
        await asyncio.sleep(1)
        await page.screenshot(path='/home/jules/verification/screenshots/modal_back_to_grades.png')

        # Go back again (should be the Root Menu)
        print("Going back to Root Menu...")
        await page.go_back()
        await asyncio.sleep(1)
        await page.screenshot(path='/home/jules/verification/screenshots/modal_back_to_root.png')

        await browser.close()

if __name__ == '__main__':
    os.makedirs('/home/jules/verification/screenshots', exist_ok=True)
    asyncio.run(verify_modal_history())
