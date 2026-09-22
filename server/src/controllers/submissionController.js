const Task = require("../models/Task");
const Submission = require("../models/Submission");

const submitTask = async (req, res) => {
    try {
        const { submissionUrl, notes } = req.body;

        if (!submissionUrl && !notes) {
            return res.status(400).json({
                message: "Submission URL or notes are required"
            });
        }

        const task = await Task.findOne({
            _id: req.params.id,
            assignedTo: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found or not assigned to you"
            });
        }

        if (task.status !== "in-progress") {
            return res.status(400).json({
                message: "Only in-progress tasks can be submitted"
            });
        }

        const existingSubmission = await Submission.findOne({
            task: task._id,
            intern: req.user._id
        });

        if (existingSubmission) {
            return res.status(400).json({
                message: "Task has already been submitted"
            });
        }

        const submission = await Submission.create({
            task: task._id,
            intern: req.user._id,
            submissionUrl,
            notes
        });

        task.status = "submitted";
        await task.save();

        return res.status(201).json({
            message: "Task submitted successfully",
            submission
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};
const getMySubmission = async (req, res) => {
    try {
        const submission = await Submission.findOne({
            task: req.params.id,
            intern: req.user._id
        })
            .populate("task", "title description deadline status")
            .populate("reviewedBy", "name email");

        if (!submission) {
            return res.status(404).json({
                message: "Submission not found"
            });
        }

        return res.status(200).json({
            submission
        });

    } catch (error) {
        return res.status(400).json({
            message: "Unable to retrieve submission"
        });
    }
};

module.exports = {
    submitTask,
    getMySubmission
};