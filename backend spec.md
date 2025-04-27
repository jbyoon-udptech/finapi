# Backend API 구현

제시해주신 구조를 기반으로 하는 금융 API 백엔드 구현 방향을 제시합니다. 각 기능별 API 엔드포인트, 요청/응답 형태, 그리고 고려해야 할 사항들을 포함합니다.

## 1. EF (External Finance) API

외부 금융 데이터를 가져오는 API입니다.

- **엔드포인트:** `/ef/{category}/{ticker}/{date}`
- **메서드:** `GET`
- **요청 변수:**
  - `category`: 카테코리 (e.g., `currency`, `upbit`, `KOSPI`)
  - `ticker`: 티커 (e.g., `KRWUSD`)
  - `date`: 조회 날짜 (YYYY-MM-DD)
- **응답 (JSON):**

  ```json
  {
    "category": "currency",
    "ticker": "KRWUSD",
    "date": "2025-04-27",
    "value": 1350.5,
    "unit": "KRW",
    "timestamp": "2025-04-27T13:30:00+09:00"
  }
  ```

  ```json
  {
    "category": "upbit",
    "ticker": "KRWBTC",
    "date": "2025-04-27",
    "value": 60000000.0,
    "unit": "KRW",
    "timestamp": "2025-04-27T13:30:00+09:00"
  }
  ```

  ```json
  {
    "category": "KOSPI",
    "ticker": "042660",
    "name": "한화오션",
    "date": "2025-04-27",
    "value": 35000.0,
    "unit": "KRW",
    "timestamp": "2025-04-27T16:00:00+09:00"
  }
  ```

  ```json
  {
    "category": "NYSE",
    "ticker": "ETN",
    "name": "Eaton",
    "date": "2025-04-27",
    "value": 200.0,
    "unit": "USD",
    "timestamp": "2025-04-27T16:00:00+09:00"
  }
  ```

## 2. Asset API

개별 자산에 대한 정보를 관리하고 조회하는 API입니다.

### 2.1. 자산 생성

- **엔드포인트:** `/assets`
- **메서드:** `POST`
- **요청 (JSON):**

  ```json
  {
    "name": "한화오션",
    "category": "KOSPI",
    "ticker": "042660"
  }
  ```

- **응답 (JSON):**

  ```json
  {
    "id": "asset-uuid-123",
    "name": "한화오션",
    "category": "KOSPI",
    "ticker": "042660"
  }
  ```

- **설명:** 새로운 자산을 등록합니다. `category`는 EF API의 category를 나타냅니다.

### 2.2. 특정 일자 자산 데이터 조회

- **엔드포인트:** `/assets/{asset_id}/data/{date}`
- **메서드:** `GET`
- **요청 변수:**
  - `asset_id`: 자산 ID
  - `date`: 조회 날짜 (YYYY-MM-DD)
- **응답 (JSON):**

  ```json
  {
    "asset_id": "asset-uuid-123",
    "name": "한화오션",
    "date": "2024-10-25",
    "value": 32500.0,
    "currency": "KRW",
    "timestamp": "2024-10-25T16:00:00+09:00"
  }
  ```

- **설명:** 특정 자산의 특정 날짜 데이터를 조회합니다. 내부 DB에 데이터가 없으면 EF API를 호출하여 데이터를 가져온 후 저장하고 반환합니다.

## 3. Portfolio API

포트폴리오를 관리하고 조회하는 API입니다.

### 3.1. 포트폴리오 생성

- **엔드포인트:** `/portfolios`
- **메서드:** `POST`
- **요청 (JSON):**

  ```json
  {
    "name": "JB's Asset"
  }
  ```

- **응답 (JSON):**

  ```json
  {
    "id": "portfolio-uuid-456",
    "name": "JB's Asset",
    "created_at": "2025-04-27T13:40:00+09:00"
  }
  ```

- **설명:** 새로운 포트폴리오를 생성합니다.

### 3.2. 포트폴리오 자산 등록 및 변경

- **엔드포인트:** `/portfolios/{portfolio_id}/assets`
- **메서드:** `POST`
- **요청 (JSON):**

  ```json
  {
    "asset_id": "asset-uuid-123",
    "date": "2024-10-25",
    "quantity": 100,
    "value": 32500,
    "unit": "KRW"
  }
  ```

  또는 자산 수량 변경 시:

  ```json
  {
    "asset_id": "asset-uuid-123",
    "date": "2025-01-10",
    "change": 10, // +10
    "value": 33000,
    "unit": "KRW"
  }
  ```

- **응답 (JSON):**

  ```json
  {
    "portfolio_id": "portfolio-uuid-456",
    "message": "Portfolio updated successfully."
  }
  ```

- **설명:** 특정 포트폴리오에 자산을 등록하거나, 특정 날짜에 자산 수량을 변경합니다. 현금도 하나의 자산으로 관리할 수 있습니다.

### 3.3. 특정 일자 포트폴리오 현황 조회

- **엔드포인트:** `/portfolios/{portfolio_id}/snapshot/{date}`
- **메서드:** `GET`
- **요청 변수:**
  - `portfolio_id`: 포트폴리오 ID
  - `date`: 조회 날짜 (YYYY-MM-DD)
- **응답 (JSON):**

  ```json
  {
    "portfolio_id": "portfolio-uuid-456",
    "name": "JB's Asset",
    "date": "2025-04-27",
    "assets": [
      {
        "asset_id": "asset-uuid-123",
        "name": "한화오션",
        "ticker": "042660",
        "quantity": 110,
        "value": 35000.0,
        "unit": "KRW"
      },
      {
        "asset_id": "asset-uuid-456",
        "name": "Eaton",
        "ticker": "ETN",
        "quantity": 20,
        "value": 200.5,
        "unit": "USD"
      },
      {
        "asset_id": "asset-uuid-789",
        "name": "KRW",
        "quantity": 4000000.0,
        "value": 1.0,
        "unit": "KRW"
      }
    ],
    "total_portfolio_value": 13263500.0,
    "total_portfolio_unit": "KRW",
    "timestamp": "2025-04-27T13:50:00+09:00"
  }
  ```

- **설명:** 특정 포트폴리오의 특정 날짜 현재 자산 구성 및 총 가치를 조회합니다. 외화 자산의 경우 원화 환산 가치를 포함합니다.

### 3.4. 포트폴리오 스냅샷 목록 조회

- **엔드포인트:** `/portfolios/{portfolio_id}/snapshots`
- **메서드:** `GET`
- **응답 (JSON):**

  ```json
  [
    {
      "date": "2025-04-20",
      "total_portfolio_value": 13263500.0,
      "total_portfolio_unit": "KRW"
    },
    {
      "date": "2025-04-27",
      "total_portfolio_value": 13270000.0,
      "total_portfolio_unit": "KRW"
    }
  ]
  ```

- **설명:** 특정 포트폴리오의 저장된 스냅샷 날짜 및 총 가치 목록을 조회합니다.

## 4. Cron Handler

- 매일 특정 시간에 실행되어 Portfolio DB를 업데이트하는 데몬입니다.
- **주요 기능:**
  - 모든 활성 포트폴리오를 순회합니다.
  - 각 포트폴리오에 속한 자산들의 최신 가격 정보를 Asset DB에서 조회합니다.
  - 필요한 경우 EF API를 호출하여 최신 가격 정보를 업데이트합니다.
  - 오늘 날짜의 포트폴리오 스냅샷을 생성하여 Portfolio DB에 저장합니다.

## 5. 고려사항

- **타임존 처리:** 모든 데이터 저장 및 조회 시 타임존을 명확하게 관리해야 합니다. 일반적으로 UTC를 기준으로 저장하고, 사용자에게 보여줄 때는 해당 지역의 타임존으로 변환하는 방식을 고려할 수 있습니다.
- **데이터 정확성 및 신뢰성:** 외부 API의 데이터 품질을 보장하기 어렵기 때문에, 데이터 수집 시 에러 처리 및 재시도 로직을 robust하게 구현해야 합니다.
- **API Rate Limiting:** 외부 API 호출 시 API 제공 업체의 Rate Limiting 정책을 준수해야 합니다.
- **보안:** API 엔드포인트에 대한 접근 제어 및 데이터 보안에 유의해야 합니다.
- **확장성:** 향후 더 많은 자산 클래스나 외부 API가 추가될 수 있으므로, 유연하고 확장 가능한 구조로 설계해야 합니다.
- **에러 처리:** API 요청 실패 시 적절한 에러 코드와 메시지를 반환해야 합니다.
- **캐싱:** 자주 조회되는 데이터에 대한 캐싱 전략을 적용하여 API 성능을 향상시킬 수 있습니다.
