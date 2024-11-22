import express, { Request, Response } from "express"
import dotenv from "dotenv"
import router from "./api/routes"

// configures dotenv to work in your application
dotenv.config()
const app = express()
//app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000

app.use("/api", router)

app
  .listen(PORT, () => {
    console.log(`Server running at PORT:${PORT} at`, new Date().toISOString())
  })
  .on("error", (error) => {
    // gracefully handle error
    throw new Error(error.message)
  })
