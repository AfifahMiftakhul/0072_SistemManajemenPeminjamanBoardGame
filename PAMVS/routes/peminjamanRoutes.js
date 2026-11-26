const express = require("express");
const router = express.Router();

const peminjamanController = require("../controllers/peminjamanController");
const authMiddleware = require("../middleware/authMiddleware");

// Semua endpoint wajib menggunakan Access Token
router.use(authMiddleware);

// Lihat daftar peminjaman
router.get("/", peminjamanController.findAll);

// Tambah peminjaman
router.post("/", peminjamanController.create);

// Proses pengembalian board game
router.put("/:id/kembali", peminjamanController.returnBoardGame);

module.exports = router;
