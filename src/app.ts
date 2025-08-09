import dotenv from "dotenv"
import express from "express"
import mongoose from "mongoose"
import morgan from "morgan"
import cron from "node-cron"
import "reflect-metadata"

import router from "./routes"
import { schedulerHandler } from "./scheduler"
import { setupSwagger } from "./swagger"

mongoose.connect("mongodb://localhost/finapi")

dotenv.config()
// console.info("Environment variables loaded from .env file", process.env)
const app = express()

app.use(morgan("dev"))
//app.use(cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3313

// Setup Swagger documentation
setupSwagger(app)

app.use("/", router)

app
  .listen(PORT, () => {
    console.info(`Server running at PORT:${PORT} at`, new Date().toISOString())
  })
  .on("error", error => {
    throw new Error(error.message)
  })

// Export app for testing
export { app }

// Cron Handler called every hour at minute 0
//cron.schedule("0 * * * *", async () => {
// This will update all portfolios at midnight every day
cron.schedule("0 0 * * *", async () => schedulerHandler)
