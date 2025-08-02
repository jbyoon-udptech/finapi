import { DateTime } from "luxon"
import { updatePortfolioAll } from "./db/portfolio.ctrl"

export const schedulerHandler = async () => {
  const now = DateTime.now().setZone("Asia/Seoul")
  try {
    console.log(`Cron job executed at ${now.toISO()} skipping updatePortfolioAll`)
    //await updatePortfolioAll(now, true)
  } catch (error) {
    console.error("Error executing cron job", error)
  }
}
