import { getCryptoData } from "./crypto"
import { getStockData } from "./stock"

export const getFData = async (type: string, ticker: string, date: string) => {
  if (type === "crypto") {
    return await getCryptoData(ticker, date)
  } else if (type === "stock") {
    return await getStockData(ticker, date)
  } else {
    throw { code: "Invalid Type" }
  }
}
