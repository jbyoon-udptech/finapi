# finapi

finance api for asset & Portfolio

## archtectures

- financial API: 특정날짜의 특정 Asset에 대한 값을 외부 서버에서 읽어오는 API
  - currency : 환율정보를 조회하는 api
  - crypto : cryto currency 정보를 조회하는 api
  - stocks : 주식 정보를 조회하는 api
    - KOSPI, KOSDAQ
    - NYSE, NASDAQ

- Asset DB:
  - 특정 Asset에 대한 날짜별 값을 가지고 있는 DB
  - financial api를 이용하여 값을 읽어온 후 내부 DB에 저장한다.
  - e.g. (한화오션, 2024-10-25): KRW32500, (KRWUSD, 2025-01-20): KRW1430
  - Asset은 생성시 (name, class, ticker) 세가지를 입력으로 받는다.
    - e.g. "한화오션", "KOSPI", "042660"
    - e.g. "Eaton", "NYSE", "ETN"
    - 생성후 Asset의 특정일 데이터를 요청하면 내부에 값이 있으면 바로 전달하고, 없으면 financial api를 이용하여 값을 읽어온뒤 저장한 후 전달한다.
    - class가 곧 financial api를 의미한다.

- Portfolio DB
  - Asset의 모음. 여러개의 Asset을 모아서 하나의 집합 자산이 되는 형태.
  - 특정일에 특정자산의 갯수를 가지고 있는 DB.
  - e.g. JB's Asset : (한화오션, 2024-10-25, 100), (ETN, 2024-10-25, 20), KRW, SGOV
  - Portfolio 생성시 name을 지정한 후,
    - asset별 날짜와 갯수를 등록하면 된다.
    - 최종 결과물은 (name, [asset]) 이 된다.
  - Portfolio는 생성 후 asset의 변화를 기입하게 된다.
    - e.g. (한화오션, 2025-01-10, +10)
    - e.g. (KRW, 2025-01-20, +1,000,000)

- Cron Handler : Portfolio DB를 구축하기 위해서 주기적으로 실행되는 데몬.

## build & run

    npm install
    npm start

## Test

    npm test
    npx mocha --require ts-node/register --recursive "test/**/*.ts"
