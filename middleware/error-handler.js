const { StatusCodes } = require("http-status-codes");
const { CustomAPIError } = require("../errors");
const errorHandlerMiddleware = (err, req, res, next) => {
    const customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong, Please try again later",
    };
    // if (err instanceof CustomAPIError) {
    //     return res.status(err.statusCode).json({ msg: err.message });
    // }
    if (err.code && err.code === 11000) {
        customError.statusCode = 400;
        customError.msg = `Duplicate value entered from ${Object.keys(
            err.keyValue
        )}, Please choose another value`;
    }
    if (err.name === "ValidationError") {
        customError.msg = Object.values(err.errors)
            .map((item) => item.message)
            .join(", ");
        customError.statusCode = 400;
    }
    if (err.name === "CastError") {
        customError.msg = "Please provide correct id format";
        customError.statusCode = 404;
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
