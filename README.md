# Financial API

Purpose: a financial api for monitoring current and historical changes in assets and portfolios.

## 구조

  [RFC](RFC.md)

## 진행상황

- 2025-05-11
  - done: currency unit test

## build & run

    npm install
    npm start

## Test

    npm test
    npx mocha --require ts-node/register --recursive "test/**/*.ts"
