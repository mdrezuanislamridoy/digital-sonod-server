const Sonod = require("../models/sonod.model");
const User = require("../models/user.model");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const sendEmail = require("../utils/sendEmail");
require("dotenv").config();

const createSonod = async (req, res, next) => {
  try {
    const photo = req.file;
    if (!photo) throw new Error("Photo is missing");

    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const personalInfo = JSON.parse(req.body.personalInfo);
    const presentAddress = JSON.parse(req.body.presentAddress);
    const permanentAddress = JSON.parse(req.body.permanentAddress);
    const { email, type } = req.body;

    if (
      !personalInfo.fullName ||
      !personalInfo.fatherName ||
      !personalInfo.motherName
    ) {
      throw new Error("Full Name, Father Name, and Mother Name are required");
    }

    // Upload photo
    const result = await cloudinary.uploader.upload(photo.path, {
      folder: "sonod/appliedPhoto",
    });
    fs.unlinkSync(photo.path);

    const sonod = new Sonod({
      user: userId,
      photo: result.secure_url,
      type,
      personalInfo,
      presentAddress,
      permanentAddress,
    });
    await sonod.save();

    // ✅ Prepare email HTML
    const html = `
      <h2>আপনার নাগরিক সনদ আবেদন সফল হয়েছে</h2>
      <p>নিচে আপনার আবেদন তথ্য:</p>
      <h3>ব্যক্তিগত তথ্য:</h3>
      <ul>
        <li>পুরো নাম: ${personalInfo.fullName}</li>
        <li>পিতার নাম: ${personalInfo.fatherName}</li>
        <li>মাতার নাম: ${personalInfo.motherName}</li>
        <li>লিঙ্গ: ${personalInfo.gender || "N/A"}</li>
        <li>জন্ম তারিখ: ${personalInfo.dateOfBirth || "N/A"}</li>
        <li>এনআইডি নম্বর: ${personalInfo.nidNumber || "N/A"}</li>
        <li>ফোন: ${personalInfo.phoneNumber || "N/A"}</li>
        <li>ইমেইল: ${personalInfo.email}</li>
        <li>photo: ${result.secure_url}</li>
      </ul>
      <h3>বর্তমান ঠিকানা:</h3>
      <ul>
        <li>বিভাগ: ${presentAddress.division}</li>
        <li>জেলা: ${presentAddress.district}</li>
        <li>উপজেলা: ${presentAddress.upazila}</li>
        <li>ইউনিয়ন: ${presentAddress.union}</li>
        <li>গ্রাম: ${presentAddress.village}</li>
        <li>হোল্ডিং নং: ${presentAddress.holdingNumber}</li>
        <li>ডাকঘর: ${presentAddress.postOffice}</li>
        <li>ওয়ার্ড নং: ${presentAddress.wardNo}</li>
      </ul>
      <h3>স্থায়ী ঠিকানা:</h3>
      <ul>
        <li>বিভাগ: ${permanentAddress.division}</li>
        <li>জেলা: ${permanentAddress.district}</li>
        <li>উপজেলা: ${permanentAddress.upazila}</li>
        <li>ইউনিয়ন: ${permanentAddress.union}</li>
        <li>গ্রাম: ${permanentAddress.village}</li>
        <li>হোল্ডিং নং: ${permanentAddress.holdingNumber}</li>
        <li>ডাকঘর: ${permanentAddress.postOffice}</li>
        <li>ওয়ার্ড নং: ${permanentAddress.wardNo}</li>
      </ul>
      <p>আবেদন প্রক্রিয়াধীন।</p>
    `;

    // Send email to user
    await sendEmail(
      process.env.GMAIL_USER,
      "নতুন নাগরিক সনদ আবেদন এসেছে",
      html
    );
    await sendEmail(personalInfo.email, "নাগরিক সনদ আবেদন সফল হয়েছে", html);

    res.status(201).json({
      message: "Applied Successfully. Wait for our email",
      sonod,
    });
  } catch (error) {
    next(error);
  }
};

const updateSonodStatus = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { status } = req.body;

    const user = await User.findById(userId).select("-password");

    if (!user.role === "admin") {
      throw new Error("Unauthorized");
    }

    const updatedSonod = await Sonod.findOneAndUpdate(
      { user: userId },
      {
        status,
      },
      { new: true }
    );

    res.status(200).json({ message: "Updated Successfully", updatedSonod });
  } catch (error) {
    next(error);
  }
};

const getSonodList = async (req, res, next) => {
  try {
    const userId = req.userId;

    const mySonods = await Sonod.find({ user: userId });

    if (!mySonods) {
      throw new Error("You Didn't Applied For any sonod");
    }

    res.status(200).json({ message: "Fetched Your All Sonod", mySonods });
  } catch (error) {
    next(error);
  }
};

const getSonod = async (req, res, next) => {
  try {
    const sonodId = req.params.id;
    const singleSonod = await Sonod.findById(sonodId);

    if (!singleSonod) {
      throw new Error("Didn't matching with any sonod id");
    }

    res.status(200).json({ message: "Fetched Your All Sonod", sindleSonod });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSonod,
  updateSonodStatus,
  getSonodList,
  getSonod,
};
