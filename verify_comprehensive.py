import asyncio
from playwright.async_api import async_playwright
import os

async def verify_comprehensive():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 720})
        page = await context.new_page()

        # 1. TEST STUDENT FLOW (Index Resource Center)
        print("Testing Student Flow (Index)...")
        await page.goto('http://localhost:8080/index.html')
        await page.evaluate("""() => {
            localStorage.setItem('currentUser', JSON.stringify({
                nombre: 'Estudiante Test',
                rol: 'Estudiante',
                id: 'std123',
                grado: 'Undécimo',
                seccion: 'A'
            }));
        }""")
        await page.reload()
        await page.screenshot(path='/home/jules/verification/screenshots/std_index_0_start.png')

        # Click "Ver Recursos"
        print("Clicking Ver Recursos...")
        await page.click('button:has-text("Ver Recursos Académicos")')

        # Wait for the next level (Subjects)
        try:
            await page.wait_for_selector('#content-display-area button:has-text("Programación")', timeout=5000)
            print("Auto-advance worked!")
        except:
            print("Auto-advance failed or took too long. Checking current state...")

        await page.screenshot(path='/home/jules/verification/screenshots/std_index_1_after_click.png')

        # If auto-advance failed, maybe it's because it matched 0 grades or more than 1?
        # Let's check the console

        # 2. TEST COURSES ICON (Cursos) for Student
        print("Testing Courses Icon (Student)...")
        await page.evaluate("window.openAcademicHierarchy('Presentaciones')")
        await page.wait_for_selector('#academic-menu-modal', state='visible')
        await asyncio.sleep(2)
        await page.screenshot(path='/home/jules/verification/screenshots/std_modal_1_subjects.png')

        # Browser Back
        print("Testing Modal Browser Back...")
        await page.go_back()
        await asyncio.sleep(1.5)
        await page.screenshot(path='/home/jules/verification/screenshots/std_modal_back.png')

        # 3. VERIFY CACHE (News)
        print("Verifying News Cache...")
        await page.evaluate("""async () => {
            await PersistenceManager.set('news', [{
                id: 'cache_test',
                titulo: 'NOTICIA CACHEADA',
                categoria: 'Test',
                fecha: '2026-06-15',
                contenido: '<p>Contenido de cache suficiente largo para el extracto</p>'
            }], 'global');
        }""")

        await page.reload()
        await page.wait_for_selector('#news-container')
        await asyncio.sleep(1)
        await page.screenshot(path='/home/jules/verification/screenshots/news_cache_check.png')

        await browser.close()

if __name__ == '__main__':
    os.makedirs('/home/jules/verification/screenshots', exist_ok=True)
    asyncio.run(verify_comprehensive())
