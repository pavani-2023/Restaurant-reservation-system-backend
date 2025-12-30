const express = require("express");
const { register, login,createAdmin } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");

const router = express.Router();

router.post("/register", register);

router.post("/admin/create-admin", authMiddleware,adminOnly, createAdmin);
router.post("/login", login);

module.exports = router;
