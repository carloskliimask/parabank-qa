import { expect, test } from '@playwright/test';
import { randomBytes } from 'node:crypto';

const registrationFields: Record<string, string> = {
  'customer.firstName': 'QA',
  'customer.lastName': 'Tester',
  'customer.address.street': '100 Test Street',
  'customer.address.city': 'Testville',
  'customer.address.state': 'TS',
  'customer.address.zipCode': '12345',
  'customer.phoneNumber': '555-0100',
  'customer.ssn': '999-00-1234',
  'customer.username': '',
  'customer.password': 'TestPass123',
  repeatedPassword: 'TestPass123',
};

const missingRequiredFields = [
  { caseId: 'TC-REG-003', field: 'customer.lastName', message: 'Last name is required.' },
  { caseId: 'TC-REG-004', field: 'customer.address.street', message: 'Address is required.' },
  { caseId: 'TC-REG-005', field: 'customer.address.city', message: 'City is required.' },
  { caseId: 'TC-REG-006', field: 'customer.address.state', message: 'State is required.' },
  { caseId: 'TC-REG-007', field: 'customer.address.zipCode', message: 'Zip Code is required.' },
  { caseId: 'TC-REG-008', field: 'customer.ssn', message: 'Social Security Number is required.' },
  { caseId: 'TC-REG-009', field: 'customer.username', message: 'Username is required.' },
  { caseId: 'TC-REG-010', field: 'customer.password', message: 'Password is required.' },
  { caseId: 'TC-REG-011', field: 'repeatedPassword', message: 'Password confirmation is required.' },
];

async function submitRegistration(
  page: import('@playwright/test').Page,
  overrides: Record<string, string> = {},
) {
  await page.goto('register.htm');

  const fields = {
    ...registrationFields,
    'customer.username': `qa${randomBytes(5).toString('hex')}`,
    ...overrides,
  };

  for (const [name, value] of Object.entries(fields)) {
    await page.locator(`[name="${name}"]`).fill(value);
  }

  await page.getByRole('button', { name: 'Register' }).click();
}

for (const { caseId, field, message } of missingRequiredFields) {
  test(`${caseId}: registration rejects missing ${field} (AC-REG-02.1)`, async ({ page }) => {
    await submitRegistration(page, { [field]: '' });

    await expect(page.locator('span.error')).toContainText(message);
    await expect(page.getByRole('heading', { name: 'Welcome' })).toHaveCount(0);
  });
}

test('TC-REG-012: registration rejects mismatched passwords (AC-REG-02.2)', async ({ page }) => {
  await submitRegistration(page, { repeatedPassword: 'DifferentPass456' });

  await expect(page.locator('span.error')).toContainText('Passwords did not match.');
  await expect(page.getByRole('heading', { name: 'Welcome' })).toHaveCount(0);
});

test('TC-REG-013: registration rejects an existing username (AC-REG-02.3)', async ({ page }) => {
  await submitRegistration(page, {
    'customer.username': process.env.PARABANK_USERNAME ?? 'john',
  });

  await expect(page.locator('span.error')).toContainText('This username already exists.');
  await expect(page.getByRole('heading', { name: 'Welcome' })).toHaveCount(0);
});
