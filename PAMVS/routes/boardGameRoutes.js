const express = require("express");
const router = express.Router();

const boardGameController = require("../controllers/boardGameController");
const authMiddleware = require("../middleware/authMiddleware");

// Semua endpoint Board Game wajib menggunakan Access Token
router.use(authMiddleware);

// Cari board game
router.get("/search", boardGameController.search);

// Lihat semua board game
router.get("/", boardGameController.findAll);

// Tambah board game
router.post("/", boardGameController.create);

// Lihat detail board game
router.get("/:id", boardGameController.findById);

// Update board game
router.put("/:id", boardGameController.update);

// Hapus board game
router.delete("/:id", boardGameController.remove);

module.exports = router;
