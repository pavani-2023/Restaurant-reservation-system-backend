require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./src/config/db")
const app = express();
const PORT = process.env.PORT || 5000;
const authRoutes = require("./src/routes/auth.routes")


app.use(express.json());

// MongoDB Connection
connectDB()

// Login and regeister routes
app.use("/auth", authRoutes);

// testing
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});


// Table booking route for user
const reservationRoutes = require("./src/routes/reservation.routes");
app.use("/reservations", reservationRoutes);


// Admin routes
const adminRoutes = require("./src/routes/admin.routes");
app.use("/admin", adminRoutes);



app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})