const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RefreshToken = sequelize.define("RefreshToken", {
    id_refresh_token: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_admin: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    token_hash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    revoked_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "REFRESH_TOKENS",
    timestamps: false
});

module.exports = RefreshToken;
