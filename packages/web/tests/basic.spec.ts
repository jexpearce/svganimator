import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loads and has the expected title
  await expect(page).toHaveTitle(/Motif/);
  
  // Check for main heading or key content
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('basic page functionality', async ({ page }) => {
  await page.goto('/');
  
  // Verify the page loads without errors
  await expect(page.locator('body')).toBeVisible();
  
  // Check that no JavaScript errors occurred
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  await page.waitForLoadState('networkidle');
  expect(errors).toHaveLength(0);
}); 