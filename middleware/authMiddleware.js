const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Ambil token dari header
    if (!token) return res.status(401).json({ error: 'Access Denied' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });

        req.user = user;
        console.log("Decoded Token:", req.user); // Cek apakah ID user ada
        next();
    });
};

module.exports = { authenticateToken };
