import "reflect-metadata"
import express, { Request, Response } from "express"
import morgan from "morgan"
import cron from "node-cron"
import dotenv from "dotenv"
import mongoose from "mongoose"

import router from "./api/routes"
import { schedulerHandler } from "./scheduler"

mongoose.connect("mongodb://localhost/finapi")

dotenv.config()
const app = express()

app.use(morgan("dev"))
//app.use(cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3313

app.use("/api", router)

app
  .listen(PORT, () => {
    console.log(`Server running at PORT:${PORT} at`, new Date().toISOString())
  })
  .on("error", (error) => {
    throw new Error(error.message)
  })

// Cron Handler called every hour at minute 0
//cron.schedule("0 * * * *", async () => {
// This will update all portfolios at midnight every day
cron.schedule("0 0 * * *", async () => schedulerHandler)
