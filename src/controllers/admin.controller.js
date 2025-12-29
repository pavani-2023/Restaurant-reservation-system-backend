const Reservation = require("../models/ReservationModel");

exports.getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate("userId", "name email")
      .populate("tableId");

    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

exports.cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    reservation.status = "CANCELLED";
    await reservation.save();

    res.json({ message: "Reservation cancelled" });
  } catch (err) {
    next(err);
  }
};
