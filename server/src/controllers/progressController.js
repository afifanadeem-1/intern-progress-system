const Task = require("../models/Task");
const User = require("../models/User");

const getInternProgress = async (req, res,next) => {
    try {
        const intern = await User.findOne({
            _id: req.params.id,
            role: "intern"
        }).select("-password");

        if (!intern) {
            return res.status(404).json({
                message: "Intern not found"
            });
        }

        const tasks = await Task.find({
            assignedTo: intern._id
        });

        const totalTasks = tasks.length;

        const completedTasks = tasks.filter(
            task => task.status === "completed"
        ).length;

        const inProgressTasks = tasks.filter(
            task => task.status === "in-progress"
        ).length;

        const pendingTasks = tasks.filter(
            task => task.status === "pending"
        ).length;

        const submittedTasks = tasks.filter(
            task => task.status === "submitted"
        ).length;

        const progressPercentage =
            totalTasks === 0
                ? 0
                : Math.round((completedTasks / totalTasks) * 100);

        return res.status(200).json({
            intern: {
                id: intern._id,
                name: intern.name,
                email: intern.email,
                department: intern.department
            },
            progress: {
                totalTasks,
                completedTasks,
                inProgressTasks,
                pendingTasks,
                submittedTasks,
                progressPercentage
            }
        });

    } catch (error) {
        next(error);
    }
};
const getMyProgress = async (req, res,next) => {
    try {
        const tasks = await Task.find({
            assignedTo: req.user._id
        });

        const totalTasks = tasks.length;

        const completedTasks = tasks.filter(
            task => task.status === "completed"
        ).length;

        const inProgressTasks = tasks.filter(
            task => task.status === "in-progress"
        ).length;

        const pendingTasks = tasks.filter(
            task => task.status === "pending"
        ).length;

        const submittedTasks = tasks.filter(
            task => task.status === "submitted"
        ).length;

        const progressPercentage =
            totalTasks === 0
                ? 0
                : Math.round((completedTasks / totalTasks) * 100);

        return res.status(200).json({
            progress: {
                totalTasks,
                completedTasks,
                inProgressTasks,
                pendingTasks,
                submittedTasks,
                progressPercentage
            }
        });

    } catch (error) {
        next(error);
    }
};
module.exports = {
    getInternProgress,
    getMyProgress
};