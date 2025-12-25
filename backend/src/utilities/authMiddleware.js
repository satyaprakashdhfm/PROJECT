const jwt = require("jsonwebtoken")

const protect = (req, res, next) => {
    // Read token from cookie instead of Authorization header
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = {id: decoded.id};
            next();
        } catch (error) {
            res.status(401).json({error: "Not authorized, token invalid"});
        }
    } else {
        res.status(401).json({error: "Not authorized, no token"});
    }
};

module.exports = protect;