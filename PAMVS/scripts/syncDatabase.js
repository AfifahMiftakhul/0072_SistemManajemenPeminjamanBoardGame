require("dotenv").config();

const sequelize = require("../config/database");
require("../models");

async function syncDatabase() {
    try {
        await sequelize.authenticate();
        console.log("Koneksi Supabase berhasil!");

        await sequelize.sync();

        console.log("Semua tabel BoardGameKu berhasil dibuat!");
    } catch (error) {
        console.error("Gagal membuat tabel:", error.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

syncDatabase();
