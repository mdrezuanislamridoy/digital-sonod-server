const Sonod = require("../models/sonod.model");
const User = require("../models/user.model");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

const createSonod = async (req, res, next) => {
  try {
    const photo = req.file;
    if (!photo) {
      throw new Error("Photo Is Missing");
    }

    const result = await cloudinary.uploader.upload(photo.path, {
      folder: "sonod/appliedPhoto",
    });

    fs.unlinkSync(photo.path);
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const { email, type, personalInfo, presentAddress, permanentAddress } =
      req.body;

    if (
      !email ||
      !type ||
      !personalInfo ||
      !presentAddress ||
      !permanentAddress
    ) {
      throw new Error("All fields are required");
    }

    const sonod = new Sonod({
      user: userId,
      photo: result?.secure_url,
      personalInfo: {
        fullName: personalInfo.fullName,
        fatherName: personalInfo.fatherName,
        motherName: personalInfo.motherName,
        gender: personalInfo.gender,
        dateOfBirth: personalInfo.dateOfBirth,
        nidNumber: personalInfo.nidNumber,
        phoneNumber: personalInfo.phoneNumber,
        email,
      },
      presentAddress: {
        division: presentAddress.division,
        district: presentAddress.district,
        upazila: presentAddress.upazila,
        union: presentAddress.union,
        village: presentAddress.village,
        holdingNumber: presentAddress.holdingNumber,
        postOffice: presentAddress.postOffice,
        wardNo: presentAddress.wardNo,
      },
      permanentAddress: {
        division: permanentAddress.division,
        district: permanentAddress.district,
        upazila: permanentAddress.upazila,
        union: permanentAddress.union,
        village: permanentAddress.village,
        holdingNumber: permanentAddress.holdingNumber,
        postOffice: permanentAddress.postOffice,
        wardNo: permanentAddress.wardNo,
      },
    });

    await sonod.save();

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
