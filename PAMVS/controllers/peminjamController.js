const { Peminjam, Peminjaman } = require("../models");

function validId(id) {
    return Number.isInteger(Number(id)) && Number(id) > 0;
}

// 1. TAMBAH PEMINJAM
exports.create = async (req, res) => {
    try {
        const { nama_peminjam, no_telpon } = req.body;

        if (
            typeof nama_peminjam !== "string" ||
            !nama_peminjam.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Nama peminjam wajib diisi"
            });
        }

        if (
            typeof no_telpon !== "string" ||
            !no_telpon.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Nomor telepon wajib diisi"
            });
        }

        const peminjam = await Peminjam.create({
            id_admin: req.admin.id_admin,
            nama_peminjam: nama_peminjam.trim(),
            no_telpon: no_telpon.trim()
        });

        return res.status(201).json({
            success: true,
            message: "Peminjam berhasil ditambahkan",
            data: peminjam
        });

    } catch (error) {
        console.error("Tambah peminjam error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Gagal menambahkan peminjam"
        });
    }
};

// 2. LIHAT DAFTAR PEMINJAM
exports.findAll = async (req, res) => {
    try {
        const peminjam = await Peminjam.findAll({
            where: {
                id_admin: req.admin.id_admin
            },
            order: [["id_peminjam", "DESC"]]
        });

        return res.status(200).json({
            success: true,
            message: "Data peminjam berhasil ditampilkan",
            data: peminjam
        });

    } catch (error) {
        console.error("Lihat peminjam error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data peminjam"
        });
    }
};

// 3. HAPUS PEMINJAM
exports.remove = async (req, res) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID peminjam tidak valid"
            });
        }

        const peminjam = await Peminjam.findOne({
            where: {
                id_peminjam: Number(req.params.id),
                id_admin: req.admin.id_admin
            }
        });

        if (!peminjam) {
            return res.status(404).json({
                success: false,
                message: "Peminjam tidak ditemukan"
            });
        }

        const linkedLoan = await Peminjaman.findOne({
            where: {
                id_peminjam: peminjam.id_peminjam,
                id_admin: req.admin.id_admin
            }
        });

        if (linkedLoan) {
            return res.status(409).json({
                success: false,
                message: "Peminjam tidak dapat dihapus karena memiliki riwayat peminjaman"
            });
        }

        await peminjam.destroy();

        return res.status(200).json({
            success: true,
            message: "Peminjam berhasil dihapus"
        });

    } catch (error) {
        console.error("Hapus peminjam error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Gagal menghapus peminjam"
        });
    }
};
