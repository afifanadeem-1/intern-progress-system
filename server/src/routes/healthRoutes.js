const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Intern Progress API is running"
    });
});

module.exports = router;