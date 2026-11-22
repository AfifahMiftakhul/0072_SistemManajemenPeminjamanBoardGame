const Admin = require("./Admin");
const BoardGame = require("./BoardGame");
const Peminjam = require("./Peminjam");
const Peminjaman = require("./Peminjaman");
const RefreshToken = require("./RefreshToken");

// Admin dengan Board Game
Admin.hasMany(BoardGame, {
    foreignKey: "id_admin",
    as: "board_games"
});
BoardGame.belongsTo(Admin, {
    foreignKey: "id_admin",
    as: "admin",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
});

// Admin dengan Peminjam
Admin.hasMany(Peminjam, {
    foreignKey: "id_admin",
    as: "peminjam"
});
Peminjam.belongsTo(Admin, {
    foreignKey: "id_admin",
    as: "admin",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
});

// Admin dengan Peminjaman
Admin.hasMany(Peminjaman, {
    foreignKey: "id_admin",
    as: "peminjaman"
});
Peminjaman.belongsTo(Admin, {
    foreignKey: "id_admin",
    as: "admin",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
});

// Admin dengan Refresh Token
Admin.hasMany(RefreshToken, {
    foreignKey: "id_admin",
    as: "refresh_tokens",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
RefreshToken.belongsTo(Admin, {
    foreignKey: "id_admin",
    as: "admin",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// Peminjam dengan Peminjaman
Peminjam.hasMany(Peminjaman, {
    foreignKey: "id_peminjam",
    as: "daftar_peminjaman"
});
Peminjaman.belongsTo(Peminjam, {
    foreignKey: "id_peminjam",
    as: "peminjam",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
});

// Board Game dengan Peminjaman
BoardGame.hasMany(Peminjaman, {
    foreignKey: "id_board_game",
    as: "daftar_peminjaman"
});
Peminjaman.belongsTo(BoardGame, {
    foreignKey: "id_board_game",
    as: "board_game",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
});

module.exports = {
    Admin,
    BoardGame,
    Peminjam,
    Peminjaman,
    RefreshToken
};
