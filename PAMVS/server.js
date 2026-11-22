const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server BoardGameKu berjalan di port ${PORT}`);
});