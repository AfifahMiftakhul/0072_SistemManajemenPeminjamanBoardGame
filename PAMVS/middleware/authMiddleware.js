const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access Token wajib disertakan"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        if (decoded.type !== "access") {
            return res.status(401).json({
                success: false,
                message: "Jenis token tidak valid"
            });
        }

        req.admin = {
            id_admin: Number(decoded.sub),
            email: decoded.email
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Access Token tidak valid atau kedaluwarsa"
        });
    }
}

module.exports = authMiddleware;
