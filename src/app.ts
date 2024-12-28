import express, { Request, Response } from "express"
import cron from "node-cron"
import dotenv from "dotenv"
import mongoose from "mongoose"

import router from "./api/routes"
import { updatePortfolioAll } from "./scheduler"
import { DateTime } from "luxon"

mongoose.connect("mongodb://localhost/finapi")

// configures dotenv to work in your application
dotenv.config()
const app = express()
//app.use(cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3000

app.use("/api", router)

app
  .listen(PORT, () => {
    console.log(`Server running at PORT:${PORT} at`, new Date().toISOString())
  })
  .on("error", (error) => {
    throw new Error(error.message)
  })

// Cron Handler
cron.schedule("0 0 * * *", async () => {
  await updatePortfolioAll(DateTime.now())
})
