const express = require("express");
const { loginUser, registerIntern } = require("../controllers/authController");
const { protect,authorize } = require("../middleware/authMiddleware");
const {
    validateLogin, validateRegister
} = require("../validators/authValidator");

const {
    validateRequest
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
    "/login",
    validateLogin,
    validateRequest,
    loginUser
);
router.post(
    "/register",
    validateRegister,
    validateRequest,
    registerIntern
);

router.get("/me", protect, (req, res) => {
    return res.status(200).json({
        user: req.user
    });
});
router.get(
    "/admin-test",
    protect,
    authorize("admin"),
    (req, res) => {
        return res.status(200).json({
            message: "Admin access granted"
        });
    }
);

module.exports = router;