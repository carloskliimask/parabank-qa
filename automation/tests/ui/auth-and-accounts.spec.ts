import { expect, test } from '@playwright/test';

const username = process.env.PARABANK_USERNAME ?? 'john';
const password = process.env.PARABANK_PASSWORD ?? 'demo';

test('customer can sign in and view account activity (REQ-AUTH-01, REQ-ACCT-01, REQ-TXN-01)', async ({ page }) => {
  await page.goto('index.htm');

  await page.locator('form[name="login"] input[name="username"]').fill(username);
  await page.locator('form[name="login"] input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page).toHaveURL(/overview\.htm/);
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

  const accountLink = page.locator('#accountTable tbody a[href*="activity.htm"]').first();
  await expect(accountLink).toBeVisible();
  const accountId = (await accountLink.textContent())?.trim();
  expect(accountId).toBeTruthy();

  await accountLink.click();
  await expect(page.getByRole('heading', { name: 'Account Activity' })).toBeVisible();
  await expect(page.locator('#accountId')).toHaveText(accountId!);
  await expect(page.locator('#month')).toBeVisible();
  await expect(page.locator('#transactionType')).toBeVisible();
});

test('empty login credentials are rejected (AC-AUTH-01.2)', async ({ page }) => {
  await page.goto('index.htm');
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page.locator('p.error')).toHaveText('Please enter a username and password.');
});

test('invalid login credentials are rejected (AC-AUTH-01.2)', async ({ page }) => {
  await page.goto('index.htm');

  await page.locator('form[name="login"] input[name="username"]').fill('qa-invalid-user');
  await page.locator('form[name="login"] input[name="password"]').fill('WrongPass123');
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page.locator('p.error')).toBeVisible();
  await expect(page).not.toHaveURL(/overview\.htm/);
});

test('logout ends the session and protected overview does not show account data (AC-AUTH-02.2, AC-AUTH-02.3)', async ({ page }) => {
  await page.goto('index.htm');
  await page.locator('form[name="login"] input[name="username"]').fill(username);
  await page.locator('form[name="login"] input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

  await page.goto('logout.htm');
  await expect(page).toHaveURL(/index\.htm/);

  await page.goto('overview.htm');
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toHaveCount(0);
  await expect(page.locator('#accountTable tbody a[href*="activity.htm"]')).toHaveCount(0);
});
