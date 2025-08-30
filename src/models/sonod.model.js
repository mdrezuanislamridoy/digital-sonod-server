const mongoose = require("mongoose");
const SonodModel = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    personalInfo: {
      fullName: { type: String, required: true },
      fatherName: { type: String, required: true },
      motherName: { type: String, required: true },
      gender: { type: String },
      dateOfBirth: { type: Date },
      nidNumber: { type: String },
      birthCertNumber: { type: String },
      phoneNumber: { type: String },
      email: { type: String },
    },

    presentAddress: {
      division: String,
      district: String,
      upazila: String,
      union: String,
      village: String,
      holdingNumber: String,
      postOffice: String,
      wardNo: String,
    },

    permanentAddress: {
      division: String,
      district: String,
      upazila: String,
      union: String,
      village: String,
      holdingNumber: String,
      postOffice: String,
      wardNo: String,
    },
  },
  { timestamps: true }
);

const Sonod = mongoose.model("Sonod", SonodModel);

module.exports = Sonod;
