const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    // if (!name || !email || !password) {
    //     throw new BadRequestError("Please provide name, email and password");
    // }
    // this we are handling with our data base so not needed for now
    const user = await User.create(req.body);
    const token = user.createJwt();
    res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError("Please provide email and password");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new UnauthenticatedError("Invalid Credentials");
    }
    const isMatched = await user.comparePassword(password);
    if (!isMatched) {
        throw new UnauthenticatedError("Invalid Password");
    }

    const token = user.createJwt();
    res.status(StatusCodes.OK).send({ user: { name: user.name }, token });
};

module.exports = { register, login };
