const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");
const User = require("../models/User");

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthenticatedError("Invalid Authorization");
    }
    const token = authHeader.split(" ")[1];

    try {
        const payload = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: payload.userId, name: payload.name };
        next();
    } catch (error) {
        throw new UnauthenticatedError("Invalid Authorization");
    }
};
module.exports = auth;
