# finapi

finance api for asset & Portfolio

## archtectures

- low level finicial API: 특정날짜의 특정 Asset에 대한 값을 요청하는 API
  - currency : 환율정보를 조회하는 api
  - crypto : cryto currency 정보를 조회하는 api
  - stocks : 주식 정보를 조회하는 api
    - KOSPI, KOSDAQ
    - NYSE, NASDAQ

- Asset DB:
  - 특정 Asset에 대한 날짜별 값을 가지고 있는 DB
  - ffinalcial api를 이용하여 값을 알아온 후 저장한다.
  - ex) 한화오션, KRWUSD,

- Portfolio DB
  - Asset의 모음. 여러개의 Asset을 모아서 하나의 집합 자산이 되는 형태.
  - 특정일의 Asset 값을 가지고 있는 DB
  - ex) JB's Asset : 한화오션, ETN, KRW, SGOV

- Cron Handler : Portfolio DB를 구축하기 위해서 주기적으로 실행되는 데몬.

## build & run

    npm install
    npm start

## Test

    npm test
