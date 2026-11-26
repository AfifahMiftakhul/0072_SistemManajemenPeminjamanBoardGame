const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const sequelize = require("../config/database");
const { Admin, RefreshToken } = require("../models");

// Mengubah Refresh Token menjadi SHA-256 hash
function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

// Membuat Access Token
function generateAccessToken(admin) {
    return jwt.sign(
        { email: admin.email, type: "access" },
        process.env.JWT_ACCESS_SECRET,
        {
            subject: String(admin.id_admin),
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
        }
    );
}

// Membuat Refresh Token
function generateRefreshToken(admin) {
    return jwt.sign(
        { type: "refresh" },
        process.env.JWT_REFRESH_SECRET,
        {
            subject: String(admin.id_admin),
            jwtid: crypto.randomUUID(),
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
        }
    );
}

// Menyimpan hash Refresh Token ke database
async function saveRefreshToken(adminId, token, transaction) {
    const decoded = jwt.decode(token);

    await RefreshToken.create(
        {
            id_admin: adminId,
            token_hash: hashToken(token),
            expires_at: new Date(decoded.exp * 1000)
        },
        { transaction }
    );
}

// 1. REGISTER ADMIN
exports.register = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email dan password wajib diisi"
            });
        }

        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password minimal 8 karakter"
            });
        }

        if (Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({
                success: false,
                message: "Password maksimal 72 byte"
            });
        }

        const existingAdmin = await Admin.findOne({
            where: { email }
        });

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Email sudah terdaftar"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const admin = await Admin.create({
            email,
            password: passwordHash
        });

        return res.status(201).json({
            success: true,
            message: "Registrasi Admin berhasil",
            data: {
                id_admin: admin.id_admin,
                email: admin.email
            }
        });

    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                success: false,
                message: "Email sudah terdaftar"
            });
        }

        console.error("Register error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server"
        });
    }
};

// 2. LOGIN ADMIN
exports.login = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email dan password wajib diisi"
            });
        }

        const admin = await Admin.findOne({
            where: { email }
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Email atau password salah"
            });
        }

        const passwordValid = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: "Email atau password salah"
            });
        }

        const accessToken = generateAccessToken(admin);
        const refreshToken = generateRefreshToken(admin);

        await saveRefreshToken(admin.id_admin, refreshToken);

        return res.status(200).json({
            success: true,
            message: "Login berhasil",
            data: {
                admin: {
                    id_admin: admin.id_admin,
                    email: admin.email
                },
                accessToken,
                refreshToken,
                tokenType: "Bearer",
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server"
        });
    }
};

// 3. REFRESH ACCESS TOKEN
exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh Token wajib diisi"
            });
        }

        let payload;

        try {
            payload = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Refresh Token tidak valid atau sudah kedaluwarsa"
            });
        }

        if (payload.type !== "refresh" || !payload.sub) {
            return res.status(401).json({
                success: false,
                message: "Jenis token tidak valid"
            });
        }

        const result = await sequelize.transaction(async (transaction) => {
            const storedToken = await RefreshToken.findOne({
                where: {
                    id_admin: Number(payload.sub),
                    token_hash: hashToken(refreshToken),
                    revoked_at: null
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!storedToken || new Date(storedToken.expires_at) <= new Date()) {
                const error = new Error("Refresh Token sudah digunakan atau dicabut");
                error.statusCode = 401;
                throw error;
            }

            const admin = await Admin.findByPk(payload.sub, {
                transaction
            });

            if (!admin) {
                const error = new Error("Akun Admin tidak ditemukan");
                error.statusCode = 401;
                throw error;
            }

            // Cabut Refresh Token lama
            await storedToken.update(
                { revoked_at: new Date() },
                { transaction }
            );

            // Buat pasangan token baru
            const accessToken = generateAccessToken(admin);
            const newRefreshToken = generateRefreshToken(admin);

            await saveRefreshToken(
                admin.id_admin,
                newRefreshToken,
                transaction
            );

            return { accessToken, refreshToken: newRefreshToken };
        });

        return res.status(200).json({
            success: true,
            message: "Token berhasil diperbarui",
            data: {
                ...result,
                tokenType: "Bearer",
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
            }
        });

    } catch (error) {
        console.error("Refresh error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Terjadi kesalahan pada server"
        });
    }
};

// 4. LOGOUT ADMIN
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh Token wajib diisi"
            });
        }

        await RefreshToken.update(
            { revoked_at: new Date() },
            {
                where: {
                    id_admin: req.admin.id_admin,
                    token_hash: hashToken(refreshToken),
                    revoked_at: null
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Logout berhasil"
        });

    } catch (error) {
        console.error("Logout error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server"
        });
    }
};
