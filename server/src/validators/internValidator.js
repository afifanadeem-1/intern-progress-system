const { body } = require("express-validator");

const validateCreateIntern = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number"),

    body("department")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Department cannot exceed 100 characters")
];

const validateUpdateIntern = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("department")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Department cannot exceed 100 characters")
];
module.exports = { validateCreateIntern, validateUpdateIntern };