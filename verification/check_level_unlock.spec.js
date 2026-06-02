const { test, expect } = require('@playwright/test');

test('Verify Intermediate level unlocks after 70% in Basic', async ({ page }) => {
    await page.goto('http://localhost:8080/juegos/quizpro.html');

    // Mock user and data
    await page.evaluate(() => {
        const student = {
            userId: 'USR-TEST-123',
            nombre: 'Test Student',
            grado: 'Décimo',
            seccion: 'A',
            rol: 'Estudiante'
        };
        localStorage.setItem('currentUser', JSON.stringify(student));

        // Mock stats: 100% in Basic (Informática I)
        window.userGameStats = {
            'QuizPro_Informatica_I_Decimo_Basico': {
                subject: 'Informática I',
                grade: 'Décimo',
                level: 'Básico',
                maxScore: 100
            }
        };
    });

    await page.click('text=Empezar');
    await page.click('h3:has-text("Informática I")');

    // Check if Intermediate is unlocked
    const interBtn = page.locator('#btn-intermedio');
    await expect(interBtn).not.toBeDisabled();
    await expect(interBtn).toHaveText('Entrar');

    await page.screenshot({ path: 'verification/screenshots/level_unlock_fixed.png' });
});
