import { getCryptoData } from "./crypto"
import { getStockData } from "./stock"

export const queryFData = async (atype: string, ticker: string, date: string) => {
  if (atype === "crypto") {
    return await getCryptoData(ticker, date)
  } else if (atype === "stock") {
    return await getStockData(ticker, date)
  } else {
    throw { code: "Invalid Type" }
  }
}
