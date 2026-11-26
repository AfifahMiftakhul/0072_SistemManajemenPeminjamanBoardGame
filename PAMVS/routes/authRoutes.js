const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Registrasi Admin
router.post("/register", authController.register);

// Login Admin
router.post("/login", authController.login);

// Memperbarui token
router.post("/refresh", authController.refresh);

// Logout Admin
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
