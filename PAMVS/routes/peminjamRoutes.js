const express = require("express");
const router = express.Router();

const peminjamController = require("../controllers/peminjamController");
const authMiddleware = require("../middleware/authMiddleware");

// Semua endpoint wajib menggunakan Access Token
router.use(authMiddleware);

// Lihat daftar peminjam
router.get("/", peminjamController.findAll);

// Tambah peminjam
router.post("/", peminjamController.create);

// Hapus peminjam
router.delete("/:id", peminjamController.remove);

module.exports = router;
