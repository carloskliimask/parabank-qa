import { expect, test } from '@playwright/test';

const username = process.env.PARABANK_USERNAME ?? 'john';
const password = process.env.PARABANK_PASSWORD ?? 'demo';
const customerId = process.env.PARABANK_CUSTOMER_ID ?? '12212';
const accountId = process.env.PARABANK_ACCOUNT_ID ?? '12345';
const baseURL = (process.env.PARABANK_BASE_URL ?? 'http://127.0.0.1:8080/parabank/').replace(/\/+$/, '') + '/';

type AccountApi = { id: number; type: string; balance: number };
type TransactionApi = {
  id: number;
  accountId: number;
  type: 'Debit' | 'Credit';
  date: number;
  amount: number;
  description: string;
};

function money(value: number) {
  const amount = Math.abs(value).toFixed(2);
  return value < 0 ? `-$${amount}` : `$${amount}`;
}

test('account overview and activity match the account and transaction API (AC-ACCT-01.2, AC-TXN-01.4)', async ({ page, request }) => {
  const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  const apiHeaders = { Accept: 'application/json', Authorization: authorization };
  const accountsResponse = await request.get(
    new URL(`services/bank/customers/${customerId}/accounts`, baseURL).toString(),
    { headers: apiHeaders },
  );
  expect(accountsResponse.status()).toBe(200);
  const accounts = await accountsResponse.json() as AccountApi[];
  const account = accounts.find((item: { id: number }) => String(item.id) === accountId);
  if (!account) {
    throw new Error(`Expected account ${accountId} for customer ${customerId}`);
  }

  const transactionsResponse = await request.get(
    new URL(`services/bank/accounts/${accountId}/transactions`, baseURL).toString(),
    { headers: apiHeaders },
  );
  expect(transactionsResponse.status()).toBe(200);
  const transactions = await transactionsResponse.json() as TransactionApi[];

  await page.goto('index.htm');
  await page.locator('form[name="login"] input[name="username"]').fill(username);
  await page.locator('form[name="login"] input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();
  const accountLink = page.locator(`#accountTable a[href*="activity.htm?id=${accountId}"]`);
  const accountRow = accountLink.locator('xpath=ancestor::tr');
  await expect(accountLink).toBeVisible();
  await expect(accountRow.locator('td').nth(1)).toHaveText(money(account.balance));
  await expect(accountRow.locator('td').nth(2)).toHaveText(money(Math.max(account.balance, 0)));

  await accountLink.click();
  await expect(page.locator('#accountId')).toHaveText(accountId);
  await expect(page.locator('#accountType')).toHaveText(account.type);
  await expect(page.locator('#balance')).toHaveText(money(account.balance));

  await page.locator('#month').selectOption({ label: 'All' });
  await page.locator('#transactionType').selectOption({ label: 'All' });
  const transactionRows = page.locator('#transactionTable tbody tr');
  await expect(transactionRows).toHaveCount(transactions.length);

  for (const transaction of transactions) {
    const transactionLink = page.locator(`#transactionTable a[href="transaction.htm?id=${transaction.id}"]`);
    const row = transactionLink.locator('xpath=ancestor::tr');
    const expectedDate = await page.evaluate((timestamp) => {
      const date = new Date(timestamp);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}-${day}-${date.getFullYear()}`;
    }, transaction.date);

    await expect(row.locator('td').nth(0)).toHaveText(expectedDate);
    await expect(transactionLink).toHaveText(transaction.description);
    await expect(row.locator('td').nth(2)).toHaveText(transaction.type === 'Debit' ? money(transaction.amount) : '');
    await expect(row.locator('td').nth(3)).toHaveText(transaction.type === 'Credit' ? money(transaction.amount) : '');
  }
});
