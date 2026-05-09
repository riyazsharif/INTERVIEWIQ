import jwt from "jsonwebtoken"

const isAuth = async (req,res,next) => {
    try {
        const bearerToken = req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.split(" ")[1]
          : null;
        let { token } = req.cookies;
        token = token || bearerToken;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: token missing" })
        }
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        if (!verifyToken) {
            return res.status(401).json({ message: "Unauthorized: invalid token" })
        }
        req.userId = verifyToken.userId
        next()
    } catch (error) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
          return res.status(401).json({ message: "Unauthorized: token expired or invalid" });
        }
        return res.status(500).json({
          message: `isAuth error ${error.message}`,
        })
    }
}

export default isAuth