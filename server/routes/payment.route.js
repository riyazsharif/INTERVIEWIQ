import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { createOrder, verifyPayment} from "../controllers/payment.controller.js"



const PaymentRouter = express.Router()

PaymentRouter.post("/orders", isAuth, createOrder)
PaymentRouter.post("/verify", isAuth, verifyPayment)


export default PaymentRouter
