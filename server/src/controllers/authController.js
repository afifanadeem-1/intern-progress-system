const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

       /* if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }*/

        const user = await User.findOne({
            email: email.toLowerCase()
            }
        );

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        return res.status(200).json({
            message: "Login successful",
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};
const registerIntern = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            department
        } = req.body;

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            department,
            role: "intern"
        });

        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                department: user.department,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    loginUser, 
    registerIntern
};