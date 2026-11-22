const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Peminjam = sequelize.define("Peminjam", {
    id_peminjam: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_admin: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nama_peminjam: {
        type: DataTypes.STRING,
        allowNull: false
    },
    no_telpon: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "PEMINJAM",
    timestamps: false
});

module.exports = Peminjam;
