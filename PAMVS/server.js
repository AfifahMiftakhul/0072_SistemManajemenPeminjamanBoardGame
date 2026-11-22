const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Halaman utama API
app.get("/", (req, res) => {
    res.json({
        message: "Selamat datang di Backend BoardGameKu"
    });
});

// Pemeriksaan kondisi server
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server BoardGameKu berjalan dengan baik"
    });
});

// Koneksi database dan menjalankan server
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
