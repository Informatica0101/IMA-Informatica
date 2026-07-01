const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Mock data
  await page.addInitScript(() => {
    const mockUser = { userId: '12345', nombre: 'Estudiante Prueba', cargo: 'Estudiante', grado: 'Décimo', seccion: 'A' };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    // Mock IndexedDB
    window.indexedDB.open = function() {
       return {
         onupgradeneeded: null,
         onsuccess: function() {
           this.result = {
             transaction: () => ({
               objectStore: () => ({
                 get: () => ({ onsuccess: function() { this.result = { activities: [
                   { id: '1', titulo: 'Tarea 1', asignatura: 'Programación', fecha_limite: '2023-01-01', entregada: false, descripcion: 'Desc 1', tipo: 'Tarea' },
                   { id: '2', titulo: 'Tarea 2', asignatura: 'Programación', fecha_limite: '2026-06-21', entregada: true, descripcion: 'Desc 2', tipo: 'Tarea' }
                 ] }; this.onsuccess(); } })
               }),
               oncomplete: null
             }),
             close: () => {}
           };
           this.onsuccess();
         }
       };
    };
  });

  await page.goto('file://' + path.resolve('student-dashboard.html'));
  await page.waitForTimeout(1000);

  // 1. Check Tabs
  console.log('Checking tabs...');
  await page.click('button:has-text("Progreso Académico")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'verification/screenshots/3_progress_tab.png' });

  // 2. Go back to Activities and Expand
  await page.click('button:has-text("Actividades")');
  await page.waitForTimeout(500);

  const subjectCard = page.locator('.subject-card').first();
  await subjectCard.click();
  await page.waitForTimeout(1000); // Wait for expansion animation

  // 3. Try to click Entregar Tarea on an overdue task
  // We need to handle the dialog
  page.on('dialog', async dialog => {
    console.log('Dialog shown:', dialog.message());
    await page.screenshot({ path: 'verification/screenshots/4_late_dialog.png' });
    await dialog.accept();
  });

  console.log('Clicking Entregar Tarea...');
  const entregaBtn = page.locator('button:has-text("Entregar Tarea")').first();
  if (await entregaBtn.isVisible()) {
      await entregaBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'verification/screenshots/5_submission_modal.png' });
  } else {
      console.log('Button not visible');
  }

  await browser.close();
})();
