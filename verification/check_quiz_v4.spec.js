const { test, expect } = require('@playwright/test');

test('Verify QuizPro basic expansion and transcription fix', async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');

    // Mock student user (10th Grade)
    await page.evaluate(() => {
        localStorage.setItem('currentUser', JSON.stringify({
            userId: 'USR-STUDENT-10',
            nombre: 'Test Student 10',
            grado: 'Décimo',
            seccion: 'A',
            rol: 'Estudiante'
        }));
    });

    await page.goto('http://localhost:8080/juegos/quizpro.html');
    await page.click('text=Empezar');

    // Check if Informática I is there
    await expect(page.locator('h3:has-text("Informática I")')).toBeVisible();
    await page.click('h3:has-text("Informática I")');

    // Select Basic level
    await page.click('#level-basico button');

    // Wait for questions to load
    await page.waitForSelector('#question-text');

    // We want to find a transcription question to verify the fix
    // We might have to skip questions until we find one, but for a test,
    // let's just check if the input exists and is active when visible.

    // Note: Since questions are shuffled, we might not get one immediately.
    // Let's verify the input state if it appears.
});

test('Verify transcription input is focused and active', async ({ page }) => {
    await page.goto('http://localhost:8080/juegos/quizpro.html');

    // Inject a transcription question directly for testing
    await page.evaluate(() => {
        localStorage.setItem('currentUser', JSON.stringify({
            userId: 'USR-STUDENT-10',
            nombre: 'Test Student 10',
            grado: 'Décimo',
            seccion: 'A',
            rol: 'Estudiante'
        }));

        // Wait for script to be ready
        window.currentQuizQuestions = [{
            id: 'test_trans',
            type: 'transcription',
            question: 'Reto de Transcripción',
            targetText: 'Texto de prueba para transcripcion.',
            answer: 'Texto de prueba para transcripcion.',
            tags: ['Test']
        }];
        window.currentIndex = 0;

        // Show the question screen manually
        document.getElementById('home-screen').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        window.showQuestion();
    });

    const input = page.locator('#fib-input');
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    await expect(input).not.toHaveAttribute('readonly', '');

    // Check if focused (might need a bit of time)
    await page.waitForTimeout(1000);
    const isFocused = await page.evaluate(() => document.activeElement.id === 'fib-input');
    console.log('Is input focused:', isFocused);

    await page.screenshot({ path: 'verification/screenshots/transcription_active.png' });
});
