import { expect, test } from '@playwright/test';
import { randomBytes } from 'node:crypto';

test('a new customer can register, sign out, and sign in', async ({ page }) => {
  const unique = randomBytes(5).toString('hex');
  const username = `qa${unique}`;
  const password = 'TestPass123';

  await page.goto('register.htm');
  const fields: Record<string, string> = {
    'customer.firstName': 'QA',
    'customer.lastName': 'Tester',
    'customer.address.street': '100 Test Street',
    'customer.address.city': 'Testville',
    'customer.address.state': 'TS',
    'customer.address.zipCode': '12345',
    'customer.phoneNumber': '555-0100',
    'customer.ssn': `999-${unique.slice(0, 2)}-${unique.slice(2, 6)}`,
    'customer.username': username,
    'customer.password': password,
    repeatedPassword: password,
  };

  for (const [name, value] of Object.entries(fields)) {
    await page.locator(`[name="${name}"]`).fill(value);
  }
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('heading', { name: `Welcome ${username}` })).toBeVisible();
  await expect(page.getByText('Your account was created successfully. You are now logged in.')).toBeVisible();

  await page.goto('logout.htm');
  await page.goto('index.htm');
  await page.locator('form[name="login"] input[name="username"]').fill(username);
  await page.locator('form[name="login"] input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page).toHaveURL(/overview\.htm/);
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();
  await expect(page.locator('#accountTable tbody tr')).toHaveCount(2);
});
