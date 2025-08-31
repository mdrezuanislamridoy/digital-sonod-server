const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");

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
        "Chairman creation request successfull. please wait for approval in your email",
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

    const chairmanId = req.params.id;

    const chairman = await User.findByIdAndUpdate(
      chairmanId,
      { status: "chairman" },
      { new: true }
    );

    console.log(chairman);

    if (!chairman) {
      throw new Error("Chairman updation failed");
    }

    const html = `
      <h2>Your request for chairman account is successful</h2>
      <h4>You can now login to your chairman account</h4>
      <br/>
      <a href='https://digital-sonod.netlify.app'>Go To Website Login Page</a>
      <br>
      <P>Good Wishes to You. Thanks for joining us 😊</P>
    `;

    await sendEmail(chairman.email, "Chairman Request Approved", html);

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

    const chairmanId = req.params.id;

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

    const html = `
      <h2>Your request for chairman account is Rejected</h2>
      <h4>You can'n login to this chairman account</h4>
      <br/>
      <a href='https://digital-sonod.netlify.app'>Go To Website</a>
      <br>
      <P>Use Leagal Information to use this site </P>
    `;

    await sendEmail(chairman.email, "Chairman Request Rejected", html);

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
