const express = require("express");

const { createTask, getTasks, getTaskById,updateTask, deleteTask, getMyTasks, startTask } = require("../controllers/taskController");
const {
    submitTask,
    getMySubmission
} = require("../controllers/submissionController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    createTask
);
router.get(
    "/",
    protect,
    authorize("admin"),
    getTasks
);

router.get(
    "/my-tasks",
    protect,
    authorize("intern"),
    getMyTasks
);
router.patch(
    "/:id/start",
    protect,
    authorize("intern"),
    startTask
);
router.post(
    "/:id/submit",
    protect,
    authorize("intern"),
    submitTask
);

router.get(
    "/:id/submission",
    protect,
    authorize("intern"),
    getMySubmission
);

router.get(
    "/:id",
    protect,
    authorize("admin"),
    getTaskById
);
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateTask
);
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteTask
);
module.exports = router;