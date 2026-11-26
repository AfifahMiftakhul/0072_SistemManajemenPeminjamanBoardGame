const { Op } = require("sequelize");
const { BoardGame, Peminjaman } = require("../models");

// Memastikan ID valid
function validId(id) {
    return Number.isInteger(Number(id)) && Number(id) > 0;
}

// 1. TAMBAH BOARD GAME
exports.create = async (req, res) => {
    try {
        const { nama_games, stok } = req.body;

        if (!nama_games || typeof nama_games !== "string" || !nama_games.trim()) {
            return res.status(400).json({
                success: false,
                message: "Nama board game wajib diisi"
            });
        }

        if (!Number.isInteger(stok) || stok < 0) {
            return res.status(400).json({
                success: false,
                message: "Stok harus berupa bilangan bulat dan tidak boleh negatif"
            });
        }

        const boardGame = await BoardGame.create({
            id_admin: req.admin.id_admin,
            nama_games: nama_games.trim(),
            stok
        });

        return res.status(201).json({
            success: true,
            message: "Board game berhasil ditambahkan",
            data: boardGame
        });

    } catch (error) {
        console.error("Create board game error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Gagal menambahkan board game"
        });
    }
};

// 2. LIHAT SEMUA BOARD GAME MILIK ADMIN
exports.findAll = async (req, res) => {
    try {
        const boardGames = await BoardGame.findAll({
            where: {
                id_admin: req.admin.id_admin
            },
            order: [["id_board_game", "DESC"]]
        });

        return res.status(200).json({
            success: true,
            message: "Data board game berhasil ditampilkan",
            data: boardGames
        });

    } catch (error) {
        console.error("Find board games error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data board game"
        });
    }
};

// 3. LIHAT DETAIL BOARD GAME
exports.findById = async (req, res) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID board game tidak valid"
            });
        }

        const boardGame = await BoardGame.findOne({
            where: {
                id_board_game: Number(req.params.id),
                id_admin: req.admin.id_admin
            }
        });

        if (!boardGame) {
            return res.status(404).json({
                success: false,
                message: "Board game tidak ditemukan"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Detail board game berhasil ditampilkan",
            data: boardGame
        });

    } catch (error) {
        console.error("Find board game error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil detail board game"
        });
    }
};

// 4. UPDATE BOARD GAME
exports.update = async (req, res) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID board game tidak valid"
            });
        }

        const boardGame = await BoardGame.findOne({
            where: {
                id_board_game: Number(req.params.id),
                id_admin: req.admin.id_admin
            }
        });

        if (!boardGame) {
            return res.status(404).json({
                success: false,
                message: "Board game tidak ditemukan"
            });
        }

        const { nama_games, stok } = req.body;
        const updates = {};

        if (nama_games !== undefined) {
            if (typeof nama_games !== "string" || !nama_games.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Nama board game tidak boleh kosong"
                });
            }

            updates.nama_games = nama_games.trim();
        }

        if (stok !== undefined) {
            if (!Number.isInteger(stok) || stok < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Stok harus berupa bilangan bulat dan tidak boleh negatif"
                });
            }

            updates.stok = stok;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Tidak ada data yang diperbarui"
            });
        }

        await boardGame.update(updates);

        return res.status(200).json({
            success: true,
            message: "Board game berhasil diperbarui",
            data: boardGame
        });

    } catch (error) {
        console.error("Update board game error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui board game"
        });
    }
};

// 5. HAPUS BOARD GAME
exports.remove = async (req, res) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID board game tidak valid"
            });
        }

        const boardGame = await BoardGame.findOne({
            where: {
                id_board_game: Number(req.params.id),
                id_admin: req.admin.id_admin
            }
        });

        if (!boardGame) {
            return res.status(404).json({
                success: false,
                message: "Board game tidak ditemukan"
            });
        }

        const linkedLoan = await Peminjaman.findOne({
            where: {
                id_board_game: boardGame.id_board_game,
                id_admin: req.admin.id_admin
            }
        });

        if (linkedLoan) {
            return res.status(409).json({
                success: false,
                message: "Board game tidak dapat dihapus karena memiliki riwayat peminjaman"
            });
        }

        await boardGame.destroy();

        return res.status(200).json({
            success: true,
            message: "Board game berhasil dihapus"
        });

    } catch (error) {
        console.error("Delete board game error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Gagal menghapus board game"
        });
    }
};

// 6. CARI BOARD GAME BERDASARKAN NAMA
exports.search = async (req, res) => {
    try {
        const keyword = String(req.query.keyword || "").trim();

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: "Kata kunci pencarian wajib diisi"
            });
        }

        const boardGames = await BoardGame.findAll({
            where: {
                id_admin: req.admin.id_admin,
                nama_games: {
                    [Op.iLike]: `%${keyword}%`
                }
            },
            order: [["nama_games", "ASC"]]
        });

        return res.status(200).json({
            success: true,
            message: boardGames.length
                ? "Hasil pencarian board game ditemukan"
                : "Board game tidak ditemukan",
            data: boardGames
        });

    } catch (error) {
        console.error("Search board game error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Gagal mencari board game"
        });
    }
};
