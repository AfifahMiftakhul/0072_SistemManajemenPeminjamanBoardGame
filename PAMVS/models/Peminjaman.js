const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Peminjaman = sequelize.define("Peminjaman", {
    id_peminjaman: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_admin: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_peminjam: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_board_game: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    tanggal_pinjam: {
        type: DataTypes.DATE,
        allowNull: false
    },
    tanggal_kembali: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    status_pengembalian: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: "PEMINJAMAN",
    timestamps: false
});

module.exports = Peminjaman;
