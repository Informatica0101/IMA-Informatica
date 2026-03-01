const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const filePath = 'file://' + path.resolve('pseudocode.html');
  await page.goto(filePath);

  const advancedPsc = `
Algoritmo TestAvanzado
    Dimension A[2]
    A[1] <- 100
    A[2] <- 200
    Escribir A[1] + A[2]

    Escribir sumar(300, 300)
FinAlgoritmo

Funcion res <- sumar(a, b)
    res <- a + b
FinFuncion
  `;

  await page.evaluate((code) => {
    document.getElementById('codeEditor').value = code;
    runAlgorithm();
  }, advancedPsc);

  // Wait for "Ejecución Finalizada"
  await page.waitForFunction(() => {
    return document.getElementById('consoleOutput').innerText.includes('Ejecución Finalizada.');
  }, { timeout: 10000 });

  const consoleText = await page.innerText('#consoleOutput');
  console.log('Console Output:\n', consoleText);

  if (consoleText.includes('300') && consoleText.includes('600')) {
    console.log('Advanced Verification PASSED');
  } else {
    console.log('Advanced Verification FAILED');
    process.exit(1);
  }

  await browser.close();
})();
