const { body } = require("express-validator");

const validateCreateTask = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Title must be between 3 and 100 characters"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ max: 1000 })
        .withMessage("Description cannot exceed 1000 characters"),

    body("assignedTo")
        .notEmpty()
        .withMessage("An intern must be assigned")
        .isMongoId()
        .withMessage("Invalid intern ID"),

    body("deadline")
        .notEmpty()
        .withMessage("Deadline is required")
        .isISO8601()
        .withMessage("Please provide a valid deadline"),

    body("priority")
        .optional()
        .isIn(["low", "medium", "high"])
        .withMessage(
            "Priority must be low, medium, or high"
        )
];
const validateUpdateTask = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Title must be between 3 and 100 characters"),

    body("description")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Description cannot be empty")
        .isLength({ max: 1000 })
        .withMessage("Description cannot exceed 1000 characters"),

    body("assignedTo")
        .optional()
        .isMongoId()
        .withMessage("Invalid intern ID"),

    body("deadline")
        .optional()
        .isISO8601()
        .withMessage("Please provide a valid deadline"),

    body("priority")
        .optional()
        .isIn(["low", "medium", "high"])
        .withMessage(
            "Priority must be low, medium, or high"
        ),

   /* body("status")
        .optional()
        .isIn([
            "pending",
            "in-progress",
            "submitted",
            "completed"
        ])
        .withMessage("Invalid task status")*/
];

module.exports = { validateCreateTask, validateUpdateTask };