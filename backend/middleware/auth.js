const jwt = require("jsonwebtoken");
const db = require("../config/database");
const {hashToken} = require("./hash");
require("dotenv").config();

const verifyAccessToken = async (req, res, next) => {
    try {
        // 1. Authorization header check
        const authHeader = req.headers.authorization; 

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

        // 4. Verify JWT
        // Expired / invalid token yahin catch hoga
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );
        const hashtoken = hashToken(token);

        // 5. Check token in database
        const [rows] = await db.promise().query(
            `SELECT current_access_token
             FROM refresh_tokens
             WHERE current_access_token = ?
             AND is_revoked = FALSE
             AND expires_at > NOW()`,
            [hashtoken]
        );

        // 6. Token DB mein nahi mila
        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid or Expired Session.",
                code: "SESSION_EXPIRED"
            });
        }

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

        // Database / unexpected error
        console.error("Unexpected Auth Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error. Please try again later."
        });
    }
};

module.exports = verifyAccessToken;