import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../utils/api.js";

const plans = [
  {
    name: "Starter",
    credits: 50,
    price: 49,
    priceId: "plan_starter",
    features: ["10 Interviews", "Basic Analytics", "Email Support"],
    color: "border-gray-200",
    badge: "",
  },
  {
    name: "Pro",
    credits: 150,
    price: 129,
    priceId: "plan_pro",
    features: ["30 Interviews", "Detailed Analytics", "Priority Support", "Resume Analysis"],
    color: "border-emerald-500",
    badge: "Most Popular",
  },
  {
    name: "Elite",
    credits: 500,
    price: 399,
    priceId: "plan_elite",
    features: ["100 Interviews", "Full Analytics", "24/7 Support", "Resume Analysis", "Custom Reports"],
    color: "border-purple-500",
    badge: "Best Value",
  },
];

function Pricing() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleBuy = async (plan) => {
    if (!userData) {
      navigate("/auth");
      return;
    }

    setLoadingPlan(plan.name);

    try {
      // ✅ Backend se Razorpay order create karo
      const result = await api.post("/api/payment/create-order", {
        amount: plan.price,
        credits: plan.credits,
        planName: plan.name,
      });

      const { orderId, amount, currency } = result.data;

      // ✅ Razorpay checkout open karo
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "InterviewIQ.Ai",
        description: `${plan.name} Plan — ${plan.credits} Credits`,
        order_id: orderId,
        handler: async (response) => {
          // ✅ Payment verify karo
          try {
            const verifyResult = await api.post("/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              credits: plan.credits,
            });

            if (verifyResult.data.success) {
              alert(`✅ Payment successful! ${plan.credits} credits added.`);
              navigate("/interview");
            }
          } catch (err) {
            console.error("Verify error:", err);
            alert("Payment verification failed. Contact support.");
          }
        },
        prefill: {
          name: userData?.name || "",
          email: userData?.email || "",
        },
        theme: { color: "#10b981" },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Order error:", err);
      alert("Failed to create order. Try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Buy More <span className="text-emerald-600">Credits</span>
          </h1>
          <p className="text-gray-400 text-base">
            Each interview costs 5 credits. Choose a plan that suits you.
          </p>
          {userData && (
            <div className="mt-4 inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
              Current Credits: {userData.credits ?? 0}
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-3xl shadow-xl border-2 ${plan.color} p-8 flex flex-col relative`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`text-xs font-bold px-4 py-1 rounded-full text-white ${plan.name === "Pro" ? "bg-emerald-500" : "bg-purple-500"}`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{plan.name}</h2>
                <div className="text-4xl font-bold text-gray-900 mt-3">
                  ₹{plan.price}
                </div>
                <p className="text-sm text-gray-400 mt-1">{plan.credits} credits</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-emerald-500 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuy(plan)}
                disabled={loadingPlan === plan.name}
                className={`w-full py-3 rounded-full font-semibold text-sm transition shadow-md
                  ${plan.name === "Pro"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : plan.name === "Elite"
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-gray-900 hover:bg-gray-700 text-white"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingPlan === plan.name ? "Processing..." : `Buy ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Back */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pricing;