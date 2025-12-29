const Reservation = require("../models/ReservationModel");
const Table = require("../models/Table");

exports.getAllReservations = async (req, res, next) => {
  try {
    const date = req.query.date ? req.query.date.trim() : null;

    console.log("FILTER DATE:", date);

    let reservations;

    if (date) {
      reservations = await Reservation.find({ date })
        .populate("userId", "name email")
        .populate("tableId");
    } else {
      reservations = await Reservation.find()
        .populate("userId", "name email")
        .populate("tableId");
    }

    return res.json(reservations);
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



exports.updateReservation = async (req, res, next) => {
  try {
    const id = req.params.id.trim(); // 👈 FI
    console.log(id)
    const { date, timeSlot, guests } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const newDate = date || reservation.date;
    const newTimeSlot = timeSlot || reservation.timeSlot;
    const newGuests = guests || reservation.guests;

    // find suitable tables
    const tables = await Table.find({ capacity: { $gte: newGuests } });

    for (const table of tables) {
      const conflict = await Reservation.findOne({
        _id: { $ne: reservation._id }, // ignore current reservation
        tableId: table._id,
        date: newDate,
        timeSlot: newTimeSlot,
        status: "ACTIVE"
      });

      if (!conflict) {
        reservation.date = newDate;
        reservation.timeSlot = newTimeSlot;
        reservation.guests = newGuests;
        reservation.tableId = table._id;

        await reservation.save();
        return res.json(reservation);
      }
    }

    res.status(409).json({
      message: "No available table for updated reservation"
    });
  } catch (err) {
    next(err);
  }
};
