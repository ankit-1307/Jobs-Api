const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, "Please Provide a Company"],
        maxlength: 50,
    },
    position: {
        type: String,
        required: [true, "Please Provide a Position"],
        maxlength: 100,
    },
    status: {
        type: String,
        enum: ["interview", "declined", "pending"],
        default: "pending",
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "User in required"],
    },
},{timestamps:true});

module.exports = mongoose.model("Job", jobSchema);
