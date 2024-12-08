const mongoose = require("mongoose");

const { MONGO_URI } = require("./envConfig");

const connectDB = async () => {
  await mongoose.connect(MONGO_URI);
  console.log(`DB Connected on Host ${mongoose.connection.host}`);
};

module.exports = connectDB;
