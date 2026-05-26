import asyncio
from playwright.async_api import async_playwright

async def verify_games():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        # Test Destreza en el Teclado
        try:
            print("Testing Destreza en el Teclado...")
            await page.goto("http://localhost:8000/juegos/destreza_teclado.html")
            await page.wait_for_timeout(1000)

            # Manual init since index.html is not there
            await page.evaluate("window.initDexterityGame()")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="verify_destreza_init.png")

            # Start game
            await page.click("#start-game-button")
            await page.wait_for_timeout(2000)
            await page.screenshot(path="verify_destreza_play.png")
            print("Destreza screen captured.")
        except Exception as e:
            print(f"Error testing Destreza: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_games())
