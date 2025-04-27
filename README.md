# Financial API

Purpose: a financial api for monitoring current and historical changes in assets and portfolios.

## 구조

  [RFC|RFC.md]

## 구현

- 언어 : typescript
- web framework : express.js
- db : mongoDB

## build & run

    npm install
    npm start

## Test

    npm test
    npx mocha --require ts-node/register --recursive "test/**/*.ts"
