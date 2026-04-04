import genToken from "../config/token.js";
import User from "../models/user.model.js";

export const GoogleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
      });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return the user object directly so the frontend can use it consistently
    return res.status(200).json(user);
  } catch (error) {
    console.error("GoogleAuth error details:", error);
    return res.status(500).json({
      message: `Google auth error: ${error.message}`,
    });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");

    return res.status(200).json({
      message: "Logout successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Logout error ${error}`,
    });
  }
};
