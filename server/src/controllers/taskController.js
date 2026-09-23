const Task = require("../models/Task");
const User = require("../models/User");
const Submission = require("../models/Submission");

const createTask = async (req, res, next) => {
    try {
        const {
            title,
            description,
            assignedTo,
            deadline,
            priority
        } = req.body;

        if (!title || !description || !assignedTo || !deadline) {
            return res.status(400).json({
                message: "Title, description, assignedTo and deadline are required"
            });
        }

        const intern = await User.findOne({
            _id: assignedTo,
            role: "intern"
        });

        if (!intern) {
            return res.status(404).json({
                message: "Intern not found"
            });
        }

        const task = await Task.create({
            title,
            description,
            assignedTo,
            assignedBy: req.user._id,
            deadline,
            priority
        });

        return res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        next(error);
    }
};
const getTasks = async (req, res,next) => {
    try {
        const tasks = await Task.find()
            .populate("assignedTo", "name email department")
            .populate("assignedBy", "name email");

        return res.status(200).json({
            count: tasks.length,
            tasks
        });

    } catch (error) {
        next(error);
    }
};
const getTaskById = async (req, res,next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate("assignedTo", "name email department")
            .populate("assignedBy", "name email");

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            task
        });

    } catch (error) {
        next(error);
    }
};
const updateTask = async (req, res,next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if (req.body.title !== undefined) {
            task.title = req.body.title;
        }

        if (req.body.description !== undefined) {
            task.description = req.body.description;
        }

        if (req.body.deadline !== undefined) {
            task.deadline = req.body.deadline;
        }

        if (req.body.priority !== undefined) {
            task.priority = req.body.priority;
        }

       // if (req.body.status !== undefined) {
         //   task.status = req.body.status;
        //}

        if (req.body.assignedTo !== undefined) {
            const intern = await User.findOne({
                _id: req.body.assignedTo,
                role: "intern"
            });

            if (!intern) {
                return res.status(404).json({
                    message: "Intern not found"
                });
            }

            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();

        await updatedTask.populate(
            "assignedTo",
            "name email department"
        );

        await updatedTask.populate(
            "assignedBy",
            "name email"
        );

        return res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask
        });

    } catch (error) {
        next(error);
    }
};
const deleteTask = async (req, res,next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const submissionExists = await Submission.exists({
            task: task._id
        });

        if (submissionExists) {
            return res.status(409).json({
                message:
                    "Cannot delete a task that has a submission"
            });
        }

        await task.deleteOne();

        return res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};
const getMyTasks = async (req, res,next) => {
    try {
        const tasks = await Task.find({
            assignedTo: req.user._id
        })
            .populate("assignedBy", "name email")
            .sort({ deadline: 1 });

        return res.status(200).json({
            count: tasks.length,
            tasks
        });

    } catch (error) {
        next(error);
    }
};

const startTask = async (req, res,next) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            assignedTo: req.user._id
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found or not assigned to you"
            });
        }

        if (task.status !== "pending") {
            return res.status(400).json({
                message: "Only pending tasks can be started"
            });
        }

        task.status = "in-progress";

        await task.save();

        return res.status(200).json({
            message: "Task started successfully",
            task
        });

    } catch (error) {
        next(error);
    }
};
module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getMyTasks,
    startTask
};