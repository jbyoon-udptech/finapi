import { Router, Request, Response } from "express"
import crypto from "./crypto"
import user from "./user"

const router = Router()

router.use("/crypto", crypto)
router.use("/users", user)

router.get("/hello", (request: Request, response: Response) => {
  response.status(200).send(`Hello World: ${new Date().toISOString()}`)
})

export default router
