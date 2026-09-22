const Task = require("../models/Task");
const User = require("../models/User");

const createTask = async (req, res) => {
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
        return res.status(500).json({
            message: "Server error"
        });
    }
};
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate("assignedTo", "name email department")
            .populate("assignedBy", "name email");

        return res.status(200).json({
            count: tasks.length,
            tasks
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};
const getTaskById = async (req, res) => {
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
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }
};
const updateTask = async (req, res) => {
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

        if (req.body.status !== undefined) {
            task.status = req.body.status;
        }

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
        return res.status(400).json({
            message: "Unable to update task"
        });
    }
};
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        await task.deleteOne();

        return res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        return res.status(400).json({
            message: "Unable to delete task"
        });
    }
};
const getMyTasks = async (req, res) => {
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
        return res.status(500).json({
            message: "Server error"
        });
    }
};

const startTask = async (req, res) => {
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
        return res.status(400).json({
            message: "Unable to start task"
        });
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