import { expect } from "chai"
import sinon from "sinon"

import { fetchExternalData } from "../external-api"
// import * as currencyModule from "./currency"
// import * as upbitModule from "./upbit"
// import * as kospiModule from "./kospi"
// import * as nyseModule from "./nyse"
import { APIError } from "../../utils/error-handler"

describe("fetchExternalData", () => {
  // beforeEach(() => {})
  // afterEach(() => {})

  it('should call fetchCurrencyData for category "currency"', async () => {
    const date = "2025-05-07"
    const result = await fetchExternalData("currency", "USDKRW", date)
    const expectedValue = {
      category: "currency",
      date: "2025-05-07",
      ticker: "USDKRW",
      timestamp: "2025-05-07T00:00:00.000+09:00",
      unit: "KRW",
      value: 1426.6,
    }
    expect(result).to.deep.equal(expectedValue)
  })
  /*
  it('should call fetchUpbitData for category "upbit"', async () => {
    const result = await fetchExternalData("upbit", "BTC", date)
    expect(upbitStub.calledOnceWithExactly("BTC", date)).to.be.true
    expect(result).to.deep.equal(mockResponse)
  })

  it('should call fetchKOSPIData for category "KOSPI"', async () => {
    const result = await fetchExternalData("KOSPI", "005930.KQ", date)
    expect(kospiStub.calledOnceWithExactly("005930.KQ", date)).to.be.true
    expect(result).to.deep.equal(mockResponse)
  })

  it('should call fetchNYSEData for category "NYSE"', async () => {
    const result = await fetchExternalData("NYSE", "AAPL", date)
    expect(nyseStub.calledOnceWithExactly("AAPL", date)).to.be.true
    expect(result).to.deep.equal(mockResponse)
  })
  */
  it("should throw APIError for invalid category", async () => {
    try {
      const date = "2025-05-07"
      await fetchExternalData("invalid", "TICKER", date)
      throw new Error("Expected error was not thrown")
    } catch (err) {
      expect(err).to.be.instanceOf(APIError)
      expect((err as APIError).message).to.equal("Invalid category: invalid")
    }
  })
})
