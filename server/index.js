import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import interviewRouter from "./routes/interview.routes.js";
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter)
app.use("/api/interview",interviewRouter)
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT} !!`);
  });
};

startServer();
