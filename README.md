# finapi

finance api for asset & Portfolio

## 구조

- financial API: 특정 날짜의 특정 Asset에 대한 값을 조회할 수 있는 API
  - currency : 환율 정보를 조회하는 api
  - crypto : cryto currency 정보를 조회하는 api
  - stocks : 주식 정보를 조회하는 api
    - KOSPI, KOSDAQ
    - NYSE, NASDAQ

- Asset Date DB
  - 특정 Asset에 대한 날짜별 값을 가지고 있는 DB
  - financial api를 이용하여 값을 읽어온 후 본 DB에 저장한다.
  - e.g. (한화오션, 2024-10-25): KRW 32500, (KRWUSD, 2025-01-20): KRW 1430
  - Asset은 생성시 (category, ticker, name) 세가지를 입력으로 받는다.
    - e.g. "KOSPI", "042660", "한화오션"
    - e.g. "NYSE", "ETN","Eaton"
    - 생성 후 Asset의 특정일 데이터를 요청하면 DB에 값이 있으면 바로 전달하고, 없으면 financial api를 이용하여 값을 읽어온 뒤 DB에 저장한 후 전달한다.
    - category가 곧 financial api를 의미한다.

- Portfolio DB
  - 여러 Asset을 모아서 하나의 집합 자산이 되는 형태.
  - 여러 Asset들의 변화 이력들 모음.
  - 특정일 특정 Asset의 변화를 기본 레코드로 가지고 있다.
    - e.g.
      - (한화오션, 2024-10-25, +100)
      - (ETN, 2024-10-25, +20)
      - (USD, 2024-10-27, +1000)
  - Portfolio 생성시 name과 기본 화폐단위를 한다.
  - 이후 asset의 변화를 기입하게 된다.
    - e.g. (한화오션, 2025-01-10, +10)
    - e.g. (KRW, 2025-01-20, +1,000,000)

- Cron Handler
  - Portfolio 일별 DB를 생성하기 위해서 주기적으로 실행되는 데몬.

## 동작 시나리오

- Portfolio 생성
  - 이름(Name): "JB's PF"라는 식의 이름 지정
  - 기본 화폐 표시 단위(Default Curreny): KRW
- Portfolid에 Asset들을 추가
  - New Asset의 설정 항목
    - Categroy(종류): "Cyrpto"
    - Ticker(항목): "BTC"
    - Unit(Value의 단위, 화폐단위): "KRW"
    - Value(갯수): 0 // 최초 갯수 입력
    - Date(날짜): "2025-01-10" // default 현재시각
- Portfolio에서 "한화오션" Asset을 생성 후 추가
  - Asset을 설정 항목
    - Categroy(종류): "KOSPI"
    - Ticker(항목): "042660"
    - Name(이름) : "한화오션" // default 항목명
    - Unit(Value의 단위, 화폐단위): "KRW"
    - Value(갯수): 0 // 최초 갯수 입력
    - Date(날짜): "2025-01-10" // default 현재시각
- Portfolio에서 "KRW현금" Asset을 생성 후 추가
  - Asset을 설정 항목
    - Categroy(종류): "Currency"
    - Ticker(항목): "KRW"
    - Name(이름) : "한화" // default 항목명
    - Unit(Value의 단위, 화폐단위): "KRW"
    - Value(갯수): 0 // 최초 갯수 입력
    - Date(날짜): "2025-01-10" // default 현재시각

- Portfolio의 Asset이 변경되는 경우
  - Portfolio에서 Asset을 선택
    - Value : +10 or -10
    - Date: default은 현재시각
    - memo : "월입금" // 필요한 경우 memo항목 추가

- 해당 Asset의 Value(갯수)가 0인 경우만 삭제가능

- Portfolio 조회
  - 모든 Asset의 가격을 해당 Currency 표시.
    - 사용자가 원하는경우 특정 화폐로 변환하여 표시 가능.
  - 특정일의 portfolio를 표시
  - 과거 특정일 데이터도 조회가능
  - 과거 일자별로 조회가능
    - 오늘, 지난 한달, 올해, from ~ to
  - 조회시 출력되는 항목
    - 날짜
    - 총 금액
    - Asset별
      - 개수
      - 가격
      - 총 금액

- 일자별 데이터 생성
  - 일자별 portfolio 조회를 위해서 등록된 모든 Asset의 날짜별 가격을 내부 DB에 저장한다.
    - 저장할 필요가 일을까?

## build & run

    npm install
    npm start

## Test

    npm test
