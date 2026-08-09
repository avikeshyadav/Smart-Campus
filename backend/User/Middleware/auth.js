const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyAccessToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Access Token Missing"
        });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Invalid Authorization Header"
        });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        req.user = decoded;
        next();

    } catch (err) {

        return res.status(403).json({
            success: false,
            message: "Invalid or Expired Token"
        });

    }

};

module.exports = verifyAccessToken;