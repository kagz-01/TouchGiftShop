import { test, expect } from '@playwright/test';

test.describe('Visual smoke', () => {
  test('homepage hero visible and CTA navigates to shop', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    await expect(page.getByText(/Send something they'll actually love/i)).toBeVisible();
    await page.getByRole('link', { name: /Browse Gifts/i }).click();
    await expect(page).toHaveURL(/\/shop/);
  });

  test('checkout phone inputs and country selector present', async ({ page }) => {
    // Navigate to a sample product then open checkout (assumes a product with id exists)
    await page.goto('http://localhost:3001/shop');
    // find first product link and open
    const first = page.locator('a[href^="/product/"]').first();
    await first.click();
    await expect(page).toHaveURL(/\/product\//);
    // Click Add to cart and proceed to checkout if present
    const buy = page.getByRole('button', { name: /add to cart|buy now|checkout|pay/i }).first();
    if (await buy.isVisible()) await buy.click();
    // open checkout page
    await page.goto('http://localhost:3001/checkout');
    await expect(page.getByLabel(/Your phone number|Their phone number/i)).toBeVisible();
    await expect(page.getByLabel(/country code|sender country code|recipient country code/i)).toBeVisible();
  });
});
