const express = require("express");

const { 
    createIntern,
    getInterns,
    getInternById,
    updateIntern,
    deleteIntern
} = require("../controllers/internController");
const { 
    protect, 
    authorize 
} = require("../middleware/authMiddleware");


const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    createIntern
);
router.get(
    "/",
    protect,
    authorize("admin"),
    getInterns
);

router.get(
    "/:id",
    protect,
    authorize("admin"),
    getInternById
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateIntern
);
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteIntern
);

module.exports = router;