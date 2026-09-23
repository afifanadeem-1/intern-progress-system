const express = require("express");

const { 
    getInterns,
    getInternById,
    updateIntern,
    deleteIntern
} = require("../controllers/internController");
const {
    getInternProgress,
    getMyProgress
} = require("../controllers/progressController");
const { 
    protect, 
    authorize 
} = require("../middleware/authMiddleware");
const {
    validateUpdateIntern
} = require("../validators/internValidator");

const {
    validateRequest
} = require("../middleware/validationMiddleware");


const router = express.Router();

/* router.post(
    "/",
    protect,
    authorize("admin"),
    validateCreateIntern,
    validateRequest,
    createIntern
); */
router.get(
    "/",
    protect,
    authorize("admin"),
    getInterns
);
router.get(
    "/me/progress",
    protect,
    authorize("intern"),
    getMyProgress
);
router.get(
    "/:id/progress",
    protect,
    authorize("admin"),
    getInternProgress
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
    validateUpdateIntern,
    validateRequest,
    updateIntern
);
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteIntern
);

module.exports = router;