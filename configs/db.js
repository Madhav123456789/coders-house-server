const mongoose = require("mongoose");

// connecting mongo
const connectDB = async (Uri) => {
  try {
    const connect = await mongoose.connect(Uri);
    if (connect) {
      console.log("\x1b[32m", "Connected to Database");
    }
  } catch (err) {
    console.log("\x1b[31m", err.message);
  }
};

module.exports = connectDB;