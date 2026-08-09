const express = require("express");
const router = express.Router();
const { register, login, refresh, logout } = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middleware/auth");

// Only an existing admin can create new users (bootstrap the first admin directly in DB)
router.post("/register", authenticate, authorize("admin"), register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authenticate, logout);

module.exports = router;
