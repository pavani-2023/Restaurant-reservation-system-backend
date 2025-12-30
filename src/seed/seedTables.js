
const mongoose = require("mongoose")
const Table = require("../models/Table")
const tables = [
  { tableNumber: 1, capacity: 2 },
  { tableNumber: 2, capacity: 2 },
  { tableNumber: 3, capacity: 4 },
  { tableNumber: 4, capacity: 4 },
  { tableNumber: 5, capacity: 6 }
];

const uri = process.env.MONGO_URI

async function seedTables() {
  try {
    await mongoose.connect(uri);

    await Table.deleteMany(); 
    await Table.insertMany(tables);

    console.log("✅ Tables seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedTables();
