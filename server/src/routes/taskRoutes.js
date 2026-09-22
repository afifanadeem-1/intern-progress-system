const express = require("express");

const { createTask, getTasks, getTaskById,updateTask, deleteTask } = require("../controllers/taskController");

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