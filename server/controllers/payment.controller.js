import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.model.js";

// ✅ Lazily initialize — function ke andar banao
const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};
export const createOrder = async (req, res) => {
  try {
    const { amount, credits, planName } = req.body;
    
    const razorpay = getRazorpay(); // ← yahan banao
    
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { credits, planName },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      credits,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.credits += Number(credits);
    await user.save();

    res.json({
      success: true,
      message: `${credits} credits added successfully`,
      credits: user.credits,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return res.status(500).json({ message: error.message });
  }
};