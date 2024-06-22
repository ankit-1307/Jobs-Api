const { StatusCodes } = require("http-status-codes");
const Job = require("../models/Job");
const { NotFoundError, BadRequestError } = require("../errors");
const getAllJobs = async (req, res) => {
    const user = await Job.find({ createdBy: req.user.userId }).sort(
        "-createdAt"
    );
    res.status(StatusCodes.OK).json(user);
};
const getJob = async (req, res) => {
    const { id: jobId } = req.params;
    const job = await Job.findOne({ _id: jobId, createdBy: req.user.userId });
    if (!job) {
        throw new NotFoundError(`no job found for job id ${jobId}`);
    }
    res.status(StatusCodes.OK).json(job);
};
const createJob = async (req, res) => {
    req.body.createdBy = req.user.userId;
    const user = await Job.create(req.body);
    res.status(StatusCodes.CREATED).json(user);
};
const updateJob = async (req, res) => {
    const { id: jobId } = req.params;
    const { company, position } = req.body;
    if (!company || !position) {
        throw new BadRequestError(`Company or position can not by empty`);
    }
    const job = await Job.findOneAndUpdate(
        { _id: jobId, createdBy: req.user.userId },
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );
    if (!job) {
        throw new NotFoundError(`no job found for job id ${jobId}`);
    }
    res.status(StatusCodes.OK).json(job);
};
const deleteJob = async (req, res) => {
    const { id: jobId } = req.params;
    const job = await Job.findOneAndDelete({
        _id: jobId,
        createdBy: req.user.userId,
    });
    if (!job) {
        throw new NotFoundError(`no job found for job id ${jobId}`);
    }
    res.status(StatusCodes.OK).json({ msg: "job removed" });
};

module.exports = { getAllJobs, getJob, createJob, updateJob, deleteJob };
