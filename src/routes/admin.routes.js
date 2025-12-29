const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");
const {
  getAllReservations,
  cancelReservation,
  updateReservation
} = require("../controllers/admin.controller");

const router = express.Router();

router.get("/reservations", authMiddleware, adminOnly, getAllReservations);

router.patch(
  "/reservations/:id",
  authMiddleware,
  adminOnly,
  updateReservation
);

router.delete(
  "/reservations/:id",
  authMiddleware,
  adminOnly,
  cancelReservation
);

module.exports = router;
