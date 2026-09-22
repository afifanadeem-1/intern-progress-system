const express = require("express");

const { createIntern } = require("../controllers/internController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    createIntern
);

module.exports = router;