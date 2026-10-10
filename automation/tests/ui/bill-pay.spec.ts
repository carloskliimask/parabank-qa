import { expect, test } from '@playwright/test';

const username = process.env.PARABANK_USERNAME ?? 'john';
const password = process.env.PARABANK_PASSWORD ?? 'demo';
const fromAccountId = process.env.PARABANK_BILLPAY_ACCOUNT_ID ?? '54321';
const amount = '1.07';

test('customer can submit a bill payment to a payee', async ({ page }) => {
  await page.goto('index.htm');
  await page.locator('form[name="login"] input[name="username"]').fill(username);
  await page.locator('form[name="login"] input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

  await page.getByRole('link', { name: 'Bill Pay' }).click();
  const payeeFields: Record<string, string> = {
    'payee.name': 'QA Utility Company',
    'payee.address.street': '200 Test Avenue',
    'payee.address.city': 'Testville',
    'payee.address.state': 'TS',
    'payee.address.zipCode': '12345',
    'payee.phoneNumber': '555-0101',
    'payee.accountNumber': '987654321',
    verifyAccount: '987654321',
    amount,
  };
  for (const [name, value] of Object.entries(payeeFields)) {
    await page.locator(`[name="${name}"]`).fill(value);
  }
  await page.locator('[name="fromAccountId"]').selectOption(fromAccountId);
  await page.getByRole('button', { name: 'Send Payment' }).click();

  await expect(page.getByRole('heading', { name: 'Bill Payment Complete' })).toBeVisible();
  await expect(page.locator('#payeeName')).toHaveText('QA Utility Company');
  await expect(page.locator('#amount')).toHaveText('$1.07');
  await expect(page.locator('#fromAccountId')).toHaveText(fromAccountId);
});
