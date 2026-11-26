const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const boardGameRoutes = require("./routes/boardGameRoutes");
const peminjamRoutes = require("./routes/peminjamRoutes");
const peminjamanRoutes = require("./routes/peminjamanRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware utama
app.use(cors());
app.use(express.json());

// Halaman utama API
app.get("/", (req, res) => {
    res.json({
        message: "Selamat datang di Backend BoardGameKu"
    });
});

// Pemeriksaan server
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server BoardGameKu berjalan dengan baik"
    });
});

// Routes aplikasi
app.use("/api/auth", authRoutes);
app.use("/api/board-games", boardGameRoutes);
app.use("/api/peminjam", peminjamRoutes);
app.use("/api/peminjaman", peminjamanRoutes);

// Jalankan server
async function startServer() {
    try {
        await sequelize.authenticate();

        console.log("Koneksi Supabase berhasil!");

        app.listen(PORT, () => {
            console.log(`Server BoardGameKu berjalan di port ${PORT}`);
        });
    } catch (error) {
        console.error("Koneksi database gagal:", error.message);
        process.exit(1);
    }
}

startServer();
