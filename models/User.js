const { mongoose, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        minLength: 3,
        maxLength: 30,
    },
    email: {
        type: String,
        required: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email",
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a name"],
        minLength: 6,
    },
});

UserSchema.pre("save", async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.methods.createJwt = function () {
    return jwt.sign(
        { userId: this._id, name: this.name },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME,
        }
    );
};
UserSchema.methods.comparePassword = async function (userPassword) {
    const isMatched = await bcrypt.compare(userPassword, this.password);
    return isMatched;
};

module.exports = mongoose.model("User", UserSchema);
