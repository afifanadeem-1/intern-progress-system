const User = require("../models/User");

const createIntern = async (req, res) => {
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
        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createIntern
};