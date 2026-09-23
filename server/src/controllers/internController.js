const User = require("../models/User");
const Task = require("../models/Task");
const Submission = require("../models/Submission");

const createIntern = async (req, res, next) => {
    try {
        const { name, email, password, department } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        const intern = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            department,
            role: "intern"
        });

        return res.status(201).json({
            message: "Intern created successfully",
            intern: {
                id: intern._id,
                name: intern.name,
                email: intern.email,
                department: intern.department,
                role: intern.role
            }
        });

    } catch (error) {
        next(error);
    }
};
const getInterns = async (req, res,next) => {
    try {
        const interns = await User.find({
            role: "intern"
        }).select("-password");

        return res.status(200).json({
            count: interns.length,
            interns
        });

    } catch (error) {
        next(error);
    }
};
const getInternById = async (req, res,next) => {
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

        return res.status(200).json({
            intern
        });

    } catch (error) {
        next(error);
    }
};
const updateIntern = async (req, res, next) => {
    try {
        const intern = await User.findOne({
            _id: req.params.id,
            role: "intern"
        });

        if (!intern) {
            return res.status(404).json({
                message: "Intern not found"
            });
        }

        if (req.body.name !== undefined) {
            intern.name = req.body.name;
        }

        if (req.body.email !== undefined) {
            intern.email = req.body.email.toLowerCase();
        }

        if (req.body.department !== undefined) {
            intern.department = req.body.department;
        }

        const updatedIntern = await intern.save();

        return res.status(200).json({
            message: "Intern updated successfully",
            intern: {
                id: updatedIntern._id,
                name: updatedIntern.name,
                email: updatedIntern.email,
                department: updatedIntern.department,
                role: updatedIntern.role
            }
        });

    } catch (error) {
        next(error);
    }
};
const deleteIntern = async (req, res, next) => {
    try {
        const intern = await User.findOne({
            _id: req.params.id,
            role: "intern"
        });

        if (!intern) {
            return res.status(404).json({
                message: "Intern not found"
            });
        }

        const taskCount = await Task.countDocuments({
            assignedTo: intern._id
        });

        const submissionCount = await Submission.countDocuments({
            intern: intern._id
        });

        if (taskCount > 0 || submissionCount > 0) {
            return res.status(409).json({
                message:
                    "Cannot delete intern with existing tasks or submissions"
            });
        }

        await intern.deleteOne();

        return res.status(200).json({
            message: "Intern deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createIntern,
    getInterns,
    getInternById,
    updateIntern,
    deleteIntern
};