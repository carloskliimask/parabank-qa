import { expect, test } from '@playwright/test';

const username = process.env.PARABANK_USERNAME ?? 'john';
const password = process.env.PARABANK_PASSWORD ?? 'demo';
const fromAccountId = process.env.PARABANK_TRANSFER_FROM_ACCOUNT_ID ?? '54321';
const toAccountId = process.env.PARABANK_TRANSFER_TO_ACCOUNT_ID ?? '12456';
const amount = '1.11';

test('customer can transfer funds between two accounts', async ({ page }) => {
  await page.goto('index.htm');
  await page.locator('form[name="login"] input[name="username"]').fill(username);
  await page.locator('form[name="login"] input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

  await page.getByRole('link', { name: 'Transfer Funds' }).click();
  await expect(page.locator('#transferForm')).toBeVisible();
  await page.locator('#amount').fill(amount);
  await page.locator('#fromAccountId').selectOption(fromAccountId);
  await page.locator('#toAccountId').selectOption(toAccountId);
  await page.locator('#transferForm').getByRole('button', { name: 'Transfer' }).click();

  await expect(page.locator('#showResult')).toBeVisible();
  await expect(page.locator('#amountResult')).toHaveText('$1.11');
  await expect(page.locator('#fromAccountIdResult')).toHaveText(fromAccountId);
  await expect(page.locator('#toAccountIdResult')).toHaveText(toAccountId);
});
