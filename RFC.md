# A Finance API의 요구사항 정리

## 요구사항

- EF(external finance) API: 특정 Asset의 특정 날짜에 대한 값을 외부 서버에서 읽어오는 API
  - currency : 환율 정보를 조회하는 api
    - KRWUSD
  - crypto : cryto currency 정보를 조회하는 api
    - KRWBTC, KRWETH
  - stocks : 주식 정보를 조회하는 api
    - KOSPI, KOSDAQ
      - 한화오션
    - NYSE, NASDAQ
      - TSLA

- Asset DB:
  - 특정 Asset에 대한 일자별 값을 가지고 있는 DB
  - EF api를 이용하여 값을 읽어온 후 내부 DB에 저장한다.
  - e.g.
    - 한화오션, 2024-10-25: KRW 32500
    - KRWUSD, 2025-01-20: KRW 1430
  - Asset은 생성시 (name, category, ticker) 세가지를 입력으로 받는다.
    - e.g.
      - "한화오션", "KOSPI", "042660"
      - "Eaton", "NYSE", "ETN"
    - 생성후 Asset의 특정일 데이터를 요청하면 내부에 DB에 값이 있으면 바로 전달하고, 없으면 EF api를 이용하여 값을 읽어온 뒤 저장한 후 전달한다.
    - category 곧 EF api를 의미한다.

- Portfolio DB
  - Asset의 모음. 여러 개의 Asset을 모아서 하나의 집합 자산이 되는 형태.
  - 특정 일에 특정 자산의 갯수를 가지고 있는 DB.
  - e.g. JB's Asset
    - 한화오션, 2024-10-25: 100
    - ETN, 2024-10-25: 20
    - KRW, 2024-10-25: 3000000
  - Portfolio 생성시 name을 지정한 후,
    - asset별 날짜와 갯수를 등록하면 된다.
    - 최종 결과물은 (name, [asset]) 이 된다.
  - Portfolio는 생성 후 asset의 변화를 기입하게 된다.
    - e.g.
      - 한화오션, 2025-01-10: +10
      - KRW, 2025-01-20: +1000000
  - 특정일의 portfolio 상황을 바로 알수 있도록 날짜별 Snapshot List가 필요하다.

- Cron Handler : Portfolio DB를 구축하기 위해서 주기적(매일)으로 실행되는 데몬.

- 고려사항들
  - 모든 데이터의 시각에 대한 timezone을 고려해야한다.

## 구현 기술 스택

- 언어 : Typescript
- backend framework : Node.js
- DB : mongoDB
- web framework : Express.js
- HTTP api library : Axio
- time zone lbrary : luxon
- cache library : redis
