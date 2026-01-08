const { test, expect } = require('@playwright/test');

test.describe('UI Component Verification', () => {

  test('should load header and footer on main page', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    // Check for header content
    const header = await page.locator('#header-container');
    await expect(header.locator('nav')).toBeVisible();
    await expect(header.locator('a[href="index.html"]')).toBeVisible();

    // Check for footer content
    const footer = await page.locator('#footer-container');
    await expect(footer.locator('p')).toContainText('©');

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/main_page.png' });
  });

  test('should load header and footer on student dashboard', async ({ page }) => {
    await page.goto('/student-dashboard.html', { waitUntil: 'networkidle' });

    // Check for header content
    const header = await page.locator('#header-container');
    await expect(header.locator('nav')).toBeVisible();

    // Check for footer content
    const footer = await page.locator('#footer-container');
    await expect(footer.locator('p')).toContainText('©');

    await page.screenshot({ path: 'tests/screenshots/student_dashboard.png' });
  });

  test('should load header and footer on teacher dashboard', async ({ page }) => {
    await page.goto('/teacher-dashboard.html', { waitUntil: 'networkidle' });

    // Check for header content
    const header = await page.locator('#header-container');
    await expect(header.locator('nav')).toBeVisible();

    // Check for footer content
    const footer = await page.locator('#footer-container');
    await expect(footer.locator('p')).toContainText('©');

    await page.screenshot({ path: 'tests/screenshots/teacher_dashboard.png' });
  });

  test('should load header and footer on login page', async ({ page }) => {
    await page.goto('/login.html', { waitUntil: 'networkidle' });

    // Check for header content
    const header = await page.locator('#header-container');
    await expect(header.locator('nav')).toBeVisible();

    // Check for footer content
    const footer = await page.locator('#footer-container');
    await expect(footer.locator('p')).toContainText('©');

    await page.screenshot({ path: 'tests/screenshots/login_page.png' });
  });

  test('should load header and footer on register page', async ({ page }) => {
    await page.goto('/register.html', { waitUntil: 'networkidle' });

    // Check for header content
    const header = await page.locator('#header-container');
    await expect(header.locator('nav')).toBeVisible();

    // Check for footer content
    const footer = await page.locator('#footer-container');
    await expect(footer.locator('p')).toContainText('©');

    await page.screenshot({ path: 'tests/screenshots/register_page.png' });
  });

});
