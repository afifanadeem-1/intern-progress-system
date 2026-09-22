const express = require("express");
const { loginUser } = require("../controllers/authController");
const { protect,authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginUser);

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