// controllers/table.controller.js
const Table = require("../models/Table");

exports.getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (err) {
    next(err);
  }
};

exports.createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const table = await Table.create({ tableNumber, capacity });
    res.status(201).json(table);
  } catch (err) {
    next(err);
  }
};

exports.updateTable = async (req, res, next) => {
  try {
    const { capacity, isActive } = req.body;

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    if (capacity !== undefined) table.capacity = capacity;
    if (isActive !== undefined) table.isActive = isActive;

    await table.save();
    res.json(table);
  } catch (err) {
    next(err);
  }
};
