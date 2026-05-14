import User from "../models/User.model.js"

export  const  getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId).select("-__v")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({
      message: `failed to get current user  error ${error}`,
    })
    }
}