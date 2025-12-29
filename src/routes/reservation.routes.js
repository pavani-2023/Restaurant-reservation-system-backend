const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const {
  createReservation,
  myReservations
} = require("../controllers/reservation.controller");

const router = express.Router();

router.post("/", authMiddleware, createReservation);
router.get("/my", authMiddleware, myReservations);

module.exports = router;
