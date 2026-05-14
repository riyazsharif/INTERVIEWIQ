import React, { useState } from "react";
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";
import api from "../utils/api.js";
import { useNavigate } from "react-router-dom";

function Auth({isModel=false}) {
 const dispatch=useDispatch()
 const navigate = useNavigate();
 const [isSigningIn, setIsSigningIn] = useState(false);
 const [authError, setAuthError] = useState("");

  const handleGoogleAuth = async () => {
    if (isSigningIn) return;

    try {
      setIsSigningIn(true);
      setAuthError("");
      provider.setCustomParameters({ prompt: "select_account" });

      const response = await signInWithPopup(auth, provider);

      const user = response.user;

      const name = user.displayName;
      const email = user.email;

      const result = await api.post("/api/auth/google", { name, email });
      const token = result?.data?.token;
      const currentUser = result?.data?.user;

      if (token) {
        localStorage.setItem("token", token);
      }
      dispatch(setUserData(currentUser || null))
      navigate("/");

    } catch (error) {
      console.error("Google login failed:", error.code || error.message, error);
      setAuthError(
        error.code === "auth/invalid-continue-uri"
          ? "Firebase rejected this app URL. Add localhost, without a port, in Firebase Authentication authorized domains and confirm your Firebase project ID/auth domain match your .env."
          : error.message || "Google login failed. Please try again."
      );
      dispatch(setUserData(null))
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className={`
    w-full
    ${isModel ? "py-4":"min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20 "}
    `}>

      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05 }}
        className={`
w-full
${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"}
bg-white shadow-2xl border border-gray-200
`}
      >

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h2 className="font-semibold text-lg">InterviewIQ.Ai</h2>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-center leading-snug mb-4">
          Continue with{" "}
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2">
            <IoSparkles size={16} />
            AI Smart Interview
          </span>
        </h1>

        <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8">
          Sign in to start AI-powered mock interviews, track your progress, and unlock detailed performance insights.
        </p>

        <motion.button
          onClick={handleGoogleAuth}
          disabled={isSigningIn}
          whileHover={{ opacity: 0.9, scale: 1.03 }}
          whileTap={{ opacity: 1, scale: 0.9 }}
          className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FcGoogle size={20} />
          {isSigningIn ? "Signing in..." : "Continue with Google"}
        </motion.button>

        {authError && (
          <p className="mt-4 text-center text-sm leading-relaxed text-red-600">
            {authError}
          </p>
        )}

      </motion.div>

    </div>
  );
}

export default Auth;
