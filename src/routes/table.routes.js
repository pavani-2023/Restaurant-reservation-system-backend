// routes/admin.table.routes.js
const express = require("express");
const adminAuth = require("../middleware/auth.middleware");
const {
  getTables,
  createTable,
  updateTable
} = require("../controllers/table.controller");

const router = express.Router();

router.get("/tables", adminAuth, getTables);
router.post("/tables", adminAuth, createTable);
router.patch("/tables/:id", adminAuth, updateTable);

module.exports = router;
