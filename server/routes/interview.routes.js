import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { analyzeResume, finishInterview, generateQuestion, sumbitAnswer } from "../controllers/interview.controller.js"


const interviewRouter = express.Router()
interviewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume)
interviewRouter.post("/generate-questions", isAuth, generateQuestion)
interviewRouter.post("/sumbit-answer", isAuth, sumbitAnswer)
interviewRouter.post("/finish", isAuth, finishInterview)
export default interviewRouter
