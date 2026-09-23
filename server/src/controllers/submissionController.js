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
const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find()
            .populate("task", "title description deadline status priority")
            .populate("intern", "name email department")
            .populate("reviewedBy", "name email")
            .sort({ submittedAt: -1 });

        return res.status(200).json({
            count: submissions.length,
            submissions
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};
const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate("task", "title description deadline status priority")
            .populate("intern", "name email department")
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
            message: "Invalid submission ID"
        });
    }
};
const reviewSubmission = async (req, res) => {
    try {
        const { reviewStatus, feedback } = req.body;

        if (!["approved", "revision-required"].includes(reviewStatus)) {
            return res.status(400).json({
                message: "Review status must be approved or revision-required"
            });
        }

        if (!feedback) {
            return res.status(400).json({
                message: "Feedback is required"
            });
        }

        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({
                message: "Submission not found"
            });
        }

        if (submission.reviewStatus !== "pending") {
            return res.status(400).json({
                message: "Submission has already been reviewed"
            });
        }

        const task = await Task.findById(submission.task);

        if (!task) {
            return res.status(404).json({
                message: "Associated task not found"
            });
        }

        submission.reviewStatus = reviewStatus;
        submission.feedback = feedback;
        submission.reviewedBy = req.user._id;

        if (reviewStatus === "approved") {
            task.status = "completed";
        } else {
            task.status = "in-progress";
        }

        await submission.save();
        await task.save();

        return res.status(200).json({
            message: "Submission reviewed successfully",
            submission,
            task
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    submitTask,
    getMySubmission,
    getSubmissions,
    getSubmissionById,
    reviewSubmission
};