const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new Error("Something is missing");
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPass,
      role: "admin",
    });

    await user.save();

    res.status(201).json({
      message: "Admin Created Successfull. Go to login page for login",
    });
  } catch (error) {
    next(error);
  }
};

const createChairman = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new Error("Something is missing");
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPass,
      role: "chairman",
      status: "pending",
    });

    res.status(201).json({
      message:
        "Chairman created Successfully. please go to login page to login",
    });
  } catch (error) {
    next(error);
  }
};

const approveChairman = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (user.role !== "admin") {
      throw new Error("You're not allowed to do this");
    }

    const { chairmanId } = req.params;

    const chairman = await User.findByIdAndUpdate(
      chairmanId,
      { status: "chairman" },
      { new: true }
    );

    if (!chairman) {
      throw new Error("Chairman updation failed");
    }

    res.status(200).json({ message: "Chairman Status Updated" });
  } catch (error) {
    next(error);
  }
};

const rejectChairman = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (user.role !== "admin") {
      throw new Error("You're not allowed to do this");
    }

    const { chairmanId } = req.params;

    const chairman = await User.findByIdAndUpdate(
      chairmanId,
      {
        status: "rejected",
      },
      { new: true }
    );

    if (!chairman) {
      throw new Error("Chairman rejection failed");
    }

    res.status(200).json({
      message: "Chairman request rejected. Try with leagal information",
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createAdmin,
  createChairman,
  approveChairman,
  rejectChairman,
};
