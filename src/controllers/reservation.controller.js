const Reservation = require("../models/ReservationModel");
const Table = require("../models/Table");

exports.createReservation = async (req, res, next) => {
  try {
    const { date, timeSlot, guests } = req.body;

    if (!date || !timeSlot || !guests) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 1️⃣ find tables that can fit guests
    const tables = await Table.find({ capacity: { $gte: guests } });

    if (tables.length === 0) {
      return res.status(409).json({ message: "No suitable table available" });
    }

    // 2️⃣ check availability per table
    for (const table of tables) {
      const conflict = await Reservation.findOne({
        tableId: table._id,
        date,
        timeSlot,
        status: "ACTIVE"
      });

      if (!conflict) {
        // 3️⃣ reserve this table
        const reservation = await Reservation.create({
          userId: req.user.userId,
          tableId: table._id,
          date,
          timeSlot,
          guests
        });

        return res.status(201).json(reservation);
      }
    }

    // 4️⃣ no table available
    res.status(409).json({ message: "No table available for this time slot" });
  } catch (err) {
    next(err);
  }
};

exports.myReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({
      userId: req.user.userId
    }).populate("tableId");

    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

exports.cancelReservationByUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // 🔐 Ownership check
    if (reservation.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ❌ Already cancelled
    if (reservation.status === "CANCELLED") {
      return res.status(400).json({ message: "Reservation already cancelled" });
    }

    // ⏱ 3-hour rule
    const now = new Date();
    const startTime = reservation.timeSlot.split(" - ")[0];
    const reservationDateTime = new Date(
      `${reservation.date} ${startTime}`
    );

    const diffHours =
      (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 3) {
      return res.status(403).json({
        message: "You can only cancel up to 3 hours before reservation time",
      });
    }

    reservation.status = "CANCELLED";
    await reservation.save();

    res.json({ message: "Reservation cancelled successfully" });
  } catch (err) {
    next(err);
  }
};
