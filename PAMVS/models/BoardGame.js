const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BoardGame = sequelize.define("BoardGame", {
    id_board_game: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_admin: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nama_games: {
        type: DataTypes.STRING,
        allowNull: false
    },
    stok: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    }
}, {
    tableName: "BOARD_GAMES",
    timestamps: false
});

module.exports = BoardGame;
