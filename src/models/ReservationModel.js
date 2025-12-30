const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    timeSlot: {
      type: String, // e.g. "18:00-20:00"
      required: true
    },
    guests: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED"],
      default: "ACTIVE"
    },
    editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    },
    editedAt: {
      type: Date,
    }

    },
  { timestamps: true }
);

// Prevent double booking of same table at same date & time
reservationSchema.index(
  { tableId: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: "ACTIVE" } }
);

module.exports = mongoose.model("Reservation", reservationSchema);
