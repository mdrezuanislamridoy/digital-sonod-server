const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "chairman"],
      required: true,
      default: "user",
    },
    profilePic: {
      type: String,
    },
    age: Number,
    birthDate: { type: Date },
    gender: { type: String },
    address: {
      division: String,
      district: String,
      upazila: String,
      union: String,
      village: String,
    },
    phone: Number,
    status: {
      type: String,
      enum: ["pending", "chairman", "rejected"],
      default: "pending",
    },
  },
  { timeStamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
