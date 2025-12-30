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



// exports.updateReservation = async (req, res, next) => {
//   try {
//     const id = req.params.id.trim();
//     const { date, timeSlot, guests, tableId } = req.body;

//     // 1️⃣ Fetch reservation first
//     const reservation = await Reservation.findById(id);
//     if (!reservation) {
//       return res.status(404).json({ message: "Reservation not found" });
//     }

//     // 2️⃣ Enforce 3-hour lock
//     const now = new Date();
//     const startTime = reservation.timeSlot.split(" - ")[0];
//     const reservationDateTime = new Date(`${reservation.date} ${startTime}`);

//     const diffHours =
//       (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

//     if (diffHours < 3) {
//       return res.status(403).json({
//         message: "Reservations cannot be modified within 3 hours of start time",
//       });
//     }

//     // 3️⃣ Resolve new values
//     const newDate = date || reservation.date;
//     const newTimeSlot = timeSlot || reservation.timeSlot;
//     const newGuests = guests || reservation.guests;
//     const newTableId = tableId || reservation.tableId;

//     // 4️⃣ Validate table availability
//     const conflict = await Reservation.findOne({
//       _id: { $ne: reservation._id },
//       tableId: newTableId,
//       date: newDate,
//       timeSlot: newTimeSlot,
//       status: "ACTIVE",
//     });

//     if (conflict) {
//       return res.status(409).json({
//         message: "Selected table is not available for this time slot",
//       });
//     }

//     // 5️⃣ Apply updates
//     reservation.date = newDate;
//     reservation.timeSlot = newTimeSlot;
//     reservation.guests = newGuests;
//     reservation.tableId = newTableId;

//     // 6️⃣ Audit log
//     reservation.editedBy = req.user.id;
//     reservation.editedAt = new Date();

//     await reservation.save();

//     res.json(reservation);
//   } catch (err) {
//     next(err);
//   }
// };

exports.updateReservation = async (req, res, next) => {
  try {
    const id = req.params.id.trim();
    const { date, timeSlot, guests, tableId, status } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // 🔴 HANDLE CANCEL FIRST 
    if (status === "CANCELLED") {
      reservation.status = "CANCELLED";
      reservation.editedBy = req.user.id;
      reservation.editedAt = new Date();
      await reservation.save();
      return res.json(reservation);
    }

    // 🔒 3-hour lock ONLY for edits
    const now = new Date();
    const startTime = reservation.timeSlot.split(" - ")[0];
    const reservationDateTime = new Date(
      `${reservation.date} ${startTime}`
    );

    const diffHours =
      (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 3) {
      return res.status(403).json({
        message: "Reservations cannot be modified within 3 hours of start time",
      });
    }

    // 🔁 Resolve new values
    const newDate = date ?? reservation.date;
    const newTimeSlot = timeSlot ?? reservation.timeSlot;
    const newGuests = guests ?? reservation.guests;
    const newTableId = tableId ?? reservation.tableId;

    // 🔍 Conflict check
    const conflict = await Reservation.findOne({
      _id: { $ne: reservation._id },
      tableId: newTableId,
      date: newDate,
      timeSlot: newTimeSlot,
      status: "ACTIVE",
    });

    if (conflict) {
      return res.status(409).json({
        message: "Selected table is not available for this time slot",
      });
    }

    // ✅ Apply edits
    reservation.date = newDate;
    reservation.timeSlot = newTimeSlot;
    reservation.guests = newGuests;
    reservation.tableId = newTableId;
    reservation.editedBy = req.user.id;
    reservation.editedAt = new Date();

    await reservation.save();

    res.json(reservation);
  } catch (err) {
    next(err);
  }
};


exports.getTablesWithAvailability = async (req, res, next) => {
  try {
    const { date, timeSlot, currentTableId } = req.query;

    const tables = await Table.find();

    if (!date || !timeSlot) {
      return res.json(
        tables.map(t => ({
          ...t.toObject(),
          isAvailable: true,
        }))
      );
    }

    const reservations = await Reservation.find({
      date,
      timeSlot,
      status: "ACTIVE",
    });

    const reservedTableIds = reservations.map(r =>
      r.tableId.toString()
    );

    const result = tables.map(table => {
      const isReserved = reservedTableIds.includes(table._id.toString());

      return {
        ...table.toObject(),
        isAvailable:
          !isReserved || table._id.toString() === currentTableId,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};


// controllers/admin.controller.js
exports.getAvailableTables = async (req, res) => {
  const { date, timeSlot, currentTableId } = req.query;

  if (!date || !timeSlot) {
    return res.status(400).json({ message: "Date and timeSlot required" });
  }

  const [reqStart, reqEnd] = timeSlot.split(" - ");

  // 1️⃣ Get all tables
  const tables = await Table.find();

  // 2️⃣ Get active reservations for that date
  const reservations = await Reservation.find({
    date,
    status: "ACTIVE",
  });

  // 3️⃣ Compute availability
  const result = tables.map((table) => {
    const hasConflict = reservations.some((r) => {
      if (String(r.tableId) !== String(table._id)) return false;
      if (String(r._id) === currentTableId) return false;

      const [resStart, resEnd] = r.timeSlot.split(" - ");

      // ⛔ overlap check
      return !(reqEnd <= resStart || reqStart >= resEnd);
    });

    return {
      _id: table._id,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      isAvailable: !hasConflict,
    };
  });

  res.json(result);
};


