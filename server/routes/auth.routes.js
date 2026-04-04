import express from "express"
import { GoogleAuth, logOut } from "../controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/google", GoogleAuth)


authRouter.get("/logout",logOut)

export default authRouter
