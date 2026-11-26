const sequelize = require("../config/database");
const {
    Peminjaman,
    Peminjam,
    BoardGame
} = require("../models");

function validId(id) {
    return Number.isInteger(Number(id)) && Number(id) > 0;
}

// 1. LIHAT DAFTAR PEMINJAMAN
exports.findAll = async (req, res) => {
    try {
        const peminjaman = await Peminjaman.findAll({
            where: {
                id_admin: req.admin.id_admin
            },
            include: [
                {
                    model: Peminjam,
                    as: "peminjam",
                    attributes: ["id_peminjam", "nama_peminjam", "no_telpon"]
                },
                {
                    model: BoardGame,
                    as: "board_game",
                    attributes: ["id_board_game", "nama_games", "stok"]
                }
            ],
            order: [["id_peminjaman", "DESC"]]
        });

        return res.status(200).json({
            success: true,
            message: "Data peminjaman berhasil ditampilkan",
            data: peminjaman
        });

    } catch (error) {
        console.error("Lihat peminjaman error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data peminjaman"
        });
    }
};

// 2. TAMBAH PEMINJAMAN
exports.create = async (req, res) => {
    try {
        const { id_peminjam, id_board_game, jumlah } = req.body;
        const idAdmin = req.admin.id_admin;

        if (!validId(id_peminjam) || !validId(id_board_game)) {
            return res.status(400).json({
                success: false,
                message: "ID peminjam dan ID board game harus valid"
            });
        }

        if (!Number.isInteger(jumlah) || jumlah <= 0) {
            return res.status(400).json({
                success: false,
                message: "Jumlah peminjaman harus berupa bilangan bulat lebih dari 0"
            });
        }

        const transaksi = await sequelize.transaction(async (transaction) => {
            // Pastikan peminjam milik Admin yang sedang login
            const peminjam = await Peminjam.findOne({
                where: {
                    id_peminjam,
                    id_admin: idAdmin
                },
                transaction
            });

            if (!peminjam) {
                const error = new Error("Peminjam tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Kunci baris Board Game selama pemeriksaan stok
            const boardGame = await BoardGame.findOne({
                where: {
                    id_board_game,
                    id_admin: idAdmin
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!boardGame) {
                const error = new Error("Board game tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Periksa ketersediaan stok
            if (boardGame.stok < jumlah) {
                const error = new Error(
                    `Stok tidak mencukupi. Stok tersedia: ${boardGame.stok}`
                );
                error.statusCode = 400;
                throw error;
            }

            // Kurangi stok
            await boardGame.decrement("stok", {
                by: jumlah,
                transaction
            });

            // Simpan transaksi
            const peminjaman = await Peminjaman.create({
                id_admin: idAdmin,
                id_peminjam,
                id_board_game,
                jumlah,
                tanggal_pinjam: new Date(),
                tanggal_kembali: null,
                status_pengembalian: false
            }, { transaction });

            return peminjaman;
        });

        return res.status(201).json({
            success: true,
            message: "Peminjaman berhasil dicatat dan stok berhasil dikurangi",
            data: transaksi
        });

    } catch (error) {
        console.error("Tambah peminjaman error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Gagal menambahkan peminjaman"
        });
    }
};

// 3. UPDATE PEMINJAMAN (PENGEMBALIAN)
exports.returnBoardGame = async (req, res) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID peminjaman tidak valid"
            });
        }

        const hasil = await sequelize.transaction(async (transaction) => {
            // Cari dan kunci transaksi milik Admin
            const peminjaman = await Peminjaman.findOne({
                where: {
                    id_peminjaman: Number(req.params.id),
                    id_admin: req.admin.id_admin
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!peminjaman) {
                const error = new Error("Data peminjaman tidak ditemukan");
                error.statusCode = 404;
                throw error;
            }

            // Cegah pengembalian lebih dari satu kali
            if (
                peminjaman.status_pengembalian === true ||
                peminjaman.tanggal_kembali !== null
            ) {
                const error = new Error(
                    "Board game sudah pernah dikembalikan"
                );
                error.statusCode = 409;
                throw error;
            }

            // Cari dan kunci Board Game
            const boardGame = await BoardGame.findOne({
                where: {
                    id_board_game: peminjaman.id_board_game,
                    id_admin: req.admin.id_admin
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!boardGame) {
                const error = new Error(
                    "Data board game terkait tidak ditemukan"
                );
                error.statusCode = 404;
                throw error;
            }

            // Tandai transaksi sudah dikembalikan
            await peminjaman.update({
                tanggal_kembali: new Date(),
                status_pengembalian: true
            }, { transaction });

            // Tambahkan stok kembali
            await boardGame.increment("stok", {
                by: peminjaman.jumlah,
                transaction
            });

            return peminjaman;
        });

        return res.status(200).json({
            success: true,
            message: "Pengembalian berhasil dicatat dan stok berhasil ditambahkan",
            data: hasil
        });

    } catch (error) {
        console.error("Pengembalian error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Gagal memproses pengembalian"
        });
    }
};
