# ParaBank QA

QA project for the ParaBank demo banking application. Covering UI testing with Playwright. API testing with Postman/Newman. CI with GitHub Actions.

## Run locally

Start ParaBank at `http://127.0.0.1:8080/parabank/` then:

```sh
cd automation
npm ci
npx playwright install chromium
npm run typecheck
npm test
npm run test:api
