const jwt = require("jsonwebtoken");
const db = require("../config/database");
require("dotenv").config();

const verifyAccessToken = async (req, res, next) => {
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
    try {
        // 4. Check token in database
        const [rows] = await db.promise().query(
            `SELECT current_access_token
             FROM refresh_tokens
             WHERE current_access_token = ?
             AND is_revoked = FALSE
             AND expires_at > NOW()`,
            [token]
        );
        // 5. Token DB mein nahi mila
        if (rows.length === 0) {
           await db.promise().query(
                 'UPDATE refresh_tokens SET is_revoked = TRUE WHERE is_revoked = ?',
                 [false]
      );
            return res.status(403).json({
                success: false,
                message: "Invalid Session. Please Login Again."
            });
        }

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
        console.error("Auth Error:", error);

        // JWT expired/invalid
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid or Expired Token"
            });
        }

        // Database/server error
        return res.status(500).json({
            success: false,
            message: "Server Error. Please try again later."
        });
    }
};

module.exports = verifyAccessToken;