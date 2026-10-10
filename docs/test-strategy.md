# Test Strategy

## Scope

The main focus is customer banking workflows:

- Registration and validation
- Login, logout and session handling
- Accounts and balances
- Transaction history
- Transfers
- Bill pay

## Test approach

- **UI:** Playwright + TypeScript for browser based functional and regression tests.
- **API:** Postman + Newman for account, transaction and transfer API checks.
- **API/UI consistency:** Playwright compares selected UI data with API responses.
- **CI:** GitHub Actions runs type checking, Playwright tests and the Newman collection.
- **Reporting:** Allure results are generated in CI.

## Test environment

Testing is performed against a local or temporary ParaBank instance using seeded demo account and test data. Some tests modify application data so reset instance is used for repeatable runs.

## Limitations

The automated suite is a focused regression baseline rather than full application coverage. Exploratory testing is used for areas where requirements or application behavior are not fully defined.

Database validation currently outside the project scope.
