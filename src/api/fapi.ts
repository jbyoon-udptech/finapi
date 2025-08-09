import { requestCryptoData } from "./crypto"
//import { requestStockData } from "./stock"
import { requestCurrencyData } from "./currency"
import { requestYFApi } from "./yf"

/**
 * request asset price from external Financial API
 * @param category - asset category for requesting data (e.g., "yf, "crypto", "KOSPI")
 * @param symbol - asset symbol (e.g., "ETH", "042660")
 * @param date - date string formatted by 8 digit format("YYYYMMDD")
 */
export const requestFData = async (category: string, symbol: string, date: string) => {
  if (category === "crypto") {
    return await requestCryptoData(symbol, date)
  } else if (category === "currency") {
    return await requestCurrencyData(symbol, date)
  } else if (category === "yf") {
    return await requestYFApi(symbol, date)
  } else {
    throw { code: `Invalid Category[${category}]` }
  }
}
