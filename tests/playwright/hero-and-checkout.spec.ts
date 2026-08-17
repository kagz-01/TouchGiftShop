import { test, expect } from '@playwright/test';

test.describe('Visual smoke', () => {
  test('homepage hero visible and CTA navigates to shop', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    // allow for small copy changes: check the H1 contains the leading copy
    await expect(page.locator('h1').first()).toContainText(/Send something/i, { timeout: 10000 });
    await page.getByRole('link', { name: /Browse Gifts/i }).click();
    await expect(page).toHaveURL(/\/shop/, { timeout: 10000 });
  });

  test('checkout phone inputs and country selector present', async ({ page }) => {
    // Navigate to a sample product then open checkout (assumes a product with id exists)
    await page.goto('http://localhost:3001/shop');
    // find first product link and open
    const first = page.locator('a[href^="/product/"]').first();
    // wait for product links to appear
    await expect(first).toBeVisible({ timeout: 10000 });
    const href = await first.getAttribute('href');
    await first.click();
    // if click didn't navigate, fallback to direct navigation using href
    try {
      await expect(page).toHaveURL(/\/product\//, { timeout: 10000 });
    } catch (err) {
      if (href) {
        await page.goto(`http://localhost:3001${href}`);
        await expect(page).toHaveURL(/\/product\//, { timeout: 10000 });
      } else {
        throw err;
      }
    }
    // Click Add to cart and proceed to checkout if present
    const buy = page.getByRole('button', { name: /add to cart|buy now|checkout|pay/i }).first();
    if (await buy.isVisible()) await buy.click();
    // open checkout page
    await page.goto('http://localhost:3001/checkout');
    // Check that phone inputs and country selectors are present
    await expect(page.locator('input[name="senderPhone"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="recipientPhone"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[aria-label="sender country code"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[aria-label="recipient country code"]')).toBeVisible({ timeout: 10000 });
  });
});
