const express = require("express");

const {
    getSubmissions,
    getSubmissionById,
    reviewSubmission
} = require("../controllers/submissionController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    authorize("admin"),
    getSubmissions
);

router.get(
    "/:id",
    protect,
    authorize("admin"),
    getSubmissionById
);
router.patch(
    "/:id/review",
    protect,
    authorize("admin"),
    reviewSubmission
);

module.exports = router;