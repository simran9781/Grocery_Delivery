const jwt = require("jsonwebtoken");
const SECRET_KEY = "yahoo"; 

function isLoggedIn(req, res, next) {
    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ message: "Access denied. Please login." });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
}

module.exports = isLoggedIn;
