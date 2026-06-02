const { test, expect } = require('@playwright/test');

test('Verify Grade Hierarchy: 11th sees 10th and 11th, but 11th is locked if 10th is not approved', async ({ page }) => {
    await page.goto('http://localhost:8080/juegos/quizpro.html');

    // Mock user: 11th grade student with NO approvals
    await page.evaluate(() => {
        localStorage.setItem('currentUser', JSON.stringify({
            userId: 'USR-ST-11',
            nombre: 'Student 11',
            grado: 'Undécimo',
            seccion: 'A',
            rol: 'Estudiante'
        }));
        window.userGameStats = {}; // Clear stats
    });

    await page.click('text=Empezar');

    // 10th grade subject (Informática I) should be unlocked (no prev grade)
    const info1 = page.locator('h3:has-text("Informática I")');
    await expect(info1).toBeVisible();
    await expect(page.locator('.subject-card:has-text("Informática I")')).not.toHaveClass(/opacity-60/);

    // 11th grade subject (Programación) should be LOCKED
    const prog = page.locator('.subject-card:has-text("Programación")');
    await expect(prog).toBeVisible();
    await expect(prog).toHaveClass(/opacity-60/); // Grayscale/Locked
    await expect(prog.locator('p:has-text("Prerrequisito pendiente")')).toBeVisible();

    await page.screenshot({ path: 'verification/screenshots/hierarchy_locked.png' });
});
