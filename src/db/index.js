const mongoose = require("mongoose");
require("dotenv").config();

const database = async () => {
  await mongoose.connect(process.env.DB_URL);

  console.log("DB Connected");
};

module.exports = database;
