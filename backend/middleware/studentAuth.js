const jwt = require("jsonwebtoken");
const db = require("../config/database");
require("dotenv").config();

const verifyAccessTokenStudent = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1. Authorization header check
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "You Don't Have Permission To Access This Content."
        });
    }

    // 2. Bearer check
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Invalid Authorization Header"
        });
    }

    // 3. Token extract
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access Token Missing"
        });
    }

    try {
        // 6. Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        // 7. User information save
        req.user = decoded;
        req.token = token;
        // 8. Continue
        next();

    } catch (error) {

        // JWT expired
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access token expired.",
                code: "TOKEN_EXPIRED"
            });
        }

        // JWT invalid
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid access token.",
                code: "INVALID_TOKEN"
            });
        }

        // JWT not active
        if (error.name === "NotBeforeError") {
            return res.status(401).json({
                success: false,
                message: "Token is not active yet.",
                code: "TOKEN_NOT_ACTIVE"
            });
        }

        // Only unexpected server/database errors log karo
        console.error("Unexpected Auth Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error. Please try again later."
        });
    }
};

module.exports = verifyAccessTokenStudent;