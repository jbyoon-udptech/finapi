import { Router, Request, Response } from "express"

const router = Router()

// 사용자 데이터의 예제 타입
interface User {
  id: number
  name: string
  email: string
}

// Mock 데이터
const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
]

// GET /users - 모든 사용자 가져오기
router.get("/", (req: Request, res: Response) => {
  res.json(users)
})

// GET /users/:id - 특정 사용자 가져오기
router.get("/:id", (req: Request<{ id: string }>, res: Response) => {
  const userId = parseInt(req.params.id, 10)
  const user = users.find((u) => u.id === userId)

  if (user) {
    res.json(user)
  } else {
    res.status(404).json({ message: "User not found" })
  }
})

router.post("/", (req: Request, res: Response) => {
  const { name, email } = req.body

  if (!name || !email) {
    res.status(400).json({ message: "Name and email are required" })
    return
  }

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
  }

  users.push(newUser)
  res.status(201).json(newUser)
})

export default router
