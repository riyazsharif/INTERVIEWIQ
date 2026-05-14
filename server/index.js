import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import paymentRouter from "./routes/payment.routes.js";
dotenv.config();
const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked: origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/payment", paymentRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter)
app.use("/api/interview",interviewRouter)
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in server environment");
  }
  if (!process.env.MONGODB_URL) {
    throw new Error("Missing MONGODB_URL in server environment");
  }
  await connectDb();
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT} !!`);
  });
};

startServer();


