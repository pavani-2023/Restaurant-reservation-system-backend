const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");
const {
  getAllReservations,
  cancelReservation,
  updateReservation,
  getTablesWithAvailability,
  getAvailableTables
} = require("../controllers/admin.controller");

const router = express.Router();

router.get("/reservations", authMiddleware, adminOnly, getAllReservations);
router.get(
  "/available-tables",
  authMiddleware,
  adminOnly,
  getAvailableTables
);



router.patch(
  "/reservations/:id",
  authMiddleware,
  adminOnly,
  updateReservation
);

router.patch(
  "/Cancelreservations/:id",
  authMiddleware,
  adminOnly,
  cancelReservation
);

module.exports = router;
