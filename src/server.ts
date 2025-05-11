import dotenv from "dotenv"
import app from "./app"
import connectDB from "./utils/database"
import setupPortfolioSnapshotCron from "./cron/portfolio-snapshot.cron"

dotenv.config()

const PORT = process.env.PORT || 3000

const startServer = async () => {
  await connectDB()

  app.listen(PORT, () => {
    console.info(`Server is running on http://localhost:${PORT}`)
  })

  if (!process.env.LOCAL) {
    setupPortfolioSnapshotCron()
  } else {
    console.info("cron is not started in local mode")
  }
}

if (require.main === module) {
  startServer()
}
