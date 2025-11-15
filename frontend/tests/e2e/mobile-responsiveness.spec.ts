import { test, expect } from '@playwright/test';

const mobileDevices = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
  { name: 'Pixel 5', width: 393, height: 851 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
];

test.describe('Mobile Responsiveness', () => {
  for (const device of mobileDevices) {
    test(`No overlaps or overflows on ${device.name}`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto('/');
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      // Check for horizontal overflow
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth = device.width;
      expect(bodyScrollWidth).toBeLessThanOrEqual(windowWidth + 10); // Allow small margin
      // Check that key elements are visible
      const header = page.locator('header');
      await expect(header).toBeVisible();
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      // Check that buttons do not overflow horizontally and are not positioned off-screen to the left or top
      const buttons = page.locator('button');
      for (const button of await buttons.all()) {
        const boundingBox = await button.boundingBox();
        if (boundingBox) {
          // Check no horizontal overflow
          expect(boundingBox.x).toBeGreaterThanOrEqual(0);
          expect(boundingBox.x + boundingBox.width).toBeLessThanOrEqual(device.width);
          // Check not above viewport
          expect(boundingBox.y).toBeGreaterThanOrEqual(0);
          // Vertical overflow is allowed if scrollable
        }
      }
      // Take screenshot for visual verification
      await page.screenshot({ path: `test-results/${device.name.replace(/ /g, '-')}.png`, fullPage: true });
    });
  }
});

test.describe('Candidate Profile Mobile Responsiveness', () => {
  const testDevices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800 },
  ];

  for (const device of testDevices) {
    test(`Phone number field no overflow on ${device.name}`, async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.getByRole('button', { name: ' Candidate' }).click();
      await page.getByRole('textbox', { name: 'Username' }).fill('candidate@gmail.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('candi@123');
      await page.getByRole('button', { name: 'Log in' }).click();
      // Go to profile
      await page.goto('/candidate/profile');
      await page.waitForSelector('input[placeholder="Enter mobile number"]');
      // Set mobile viewport
      await page.setViewportSize({ width: device.width, height: device.height });
      // Check for horizontal overflow on page
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyScrollWidth).toBeLessThanOrEqual(device.width + 10);
      // Check phone number field components
      const rects = await page.evaluate(() => {
        const button = document.querySelector('button'); // Country code button
        const input = document.querySelector('input[placeholder="Enter mobile number"]');
        if (button && input) {
          return {
            button: button.getBoundingClientRect(),
            input: input.getBoundingClientRect(),
          };
        }
        return null;
      });
      expect(rects).not.toBeNull();
      // Ensure button does not overflow input horizontally
      expect(rects.button.right).toBeLessThanOrEqual(rects.input.right);
      // Ensure no text overflow in button or input
      const overflows = await page.evaluate(() => {
        const button = document.querySelector('button');
        const input = document.querySelector('input[placeholder="Enter mobile number"]');
        return {
          buttonOverflow: button ? button.scrollWidth > button.clientWidth : false,
          inputOverflow: input ? input.scrollWidth > input.clientWidth : false,
        };
      });
      expect(overflows.buttonOverflow).toBe(false);
      expect(overflows.inputOverflow).toBe(false);
      // Take screenshot for visual verification
      await page.screenshot({ path: `test-results/candidate-profile-${device.name.replace(/ /g, '-')}.png`, fullPage: true });
    });
  }
});