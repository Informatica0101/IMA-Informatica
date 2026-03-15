import asyncio
from playwright.async_api import async_playwright
import os

async def verify_presentation(file_path):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={'width': 375, 'height': 667}, # iPhone SE size
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()

        # Get absolute path for file
        abs_path = f"file://{os.path.abspath(file_path)}"
        await page.goto(abs_path)
        await page.wait_for_timeout(1000)

        print(f"\nVerifying (Post-Cleanup): {file_path}")

        # 1. Check Font Sizes and Line Height
        styles = await page.evaluate("""() => {
            const h2 = document.querySelector('.slide h2');
            const p = document.querySelector('.slide p');
            if (!h2 || !p) return null;
            return {
                h2Size: window.getComputedStyle(h2).fontSize,
                h2LineHeight: window.getComputedStyle(h2).lineHeight,
                pSize: window.getComputedStyle(p).fontSize,
                pLineHeight: window.getComputedStyle(p).lineHeight
            };
        }""")

        if styles:
            print(f"  - H2 Font Size: {styles['h2Size']} (Line Height: {styles['h2LineHeight']})")
            print(f"  - P Font Size: {styles['pSize']} (Line Height: {styles['pLineHeight']})")
        else:
            print("  - ERROR: Could not find H2 or P elements")

        # 2. Verify Fullscreen Hiding (Simulate F11/Fullscreen)
        await page.evaluate("""() => {
            Object.defineProperty(window.screen, 'height', { value: 800, configurable: true });
        }""")

        await page.set_viewport_size({'width': 1280, 'height': 800})
        await page.wait_for_timeout(1000)

        visibility = await page.evaluate("""() => {
            const header = document.querySelector('header');
            const footer = document.querySelector('footer');
            const container = document.getElementById('presentation-container');
            return {
                headerDisplay: window.getComputedStyle(header).display,
                footerDisplay: window.getComputedStyle(footer).display,
                containerHeight: window.getComputedStyle(container).height,
                bodyOverflow: window.getComputedStyle(document.body).overflow
            };
        }""")

        print(f"  - Fullscreen Simulation:")
        print(f"    * Header Display: {visibility['headerDisplay']} (Expected: none)")
        print(f"    * Footer Display: {visibility['footerDisplay']} (Expected: none)")
        print(f"    * Container Height: {visibility['containerHeight']} (Expected: 800px approx)")
        print(f"    * Body Overflow: {visibility['bodyOverflow']} (Expected: hidden)")

        await browser.close()

async def main():
    files_to_verify = [
        "III_BTP_A/alineacion_formato_texto.html",
        "II_BTP_A/Programacion/introduccion_programacion.html"
    ]
    for f in files_to_verify:
        await verify_presentation(f)

if __name__ == "__main__":
    asyncio.run(main())
