const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/generateToken");
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");
const verifyCodeModel = require("../models/verificationCode.model");

const sendCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Email is required");

    const existing = await User.findOne({ email });
    if (existing) throw new Error("User already exists");

    const code = Math.floor(100000 + Math.random() * 900000);

    await sendEmail(
      email,
      "Sonod Account Verification Code",
      `<h2>Your verification code: ${code}</h2>
      `
    );

    await verifyCodeModel.create({
      email,
      verificationCode: code.toString(),
      expiresIn: new Date(Date.now() + 15 * 60 * 1000),
    });

    res.status(200).json({ message: "A 6 digit code sent to your email" });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, verificationCode, role } = req.body;

    console.log(req.body);

    const storedCode = await verifyCodeModel.findOne({
      email,
      verificationCode: verificationCode.toString(),
    });

    if (!storedCode) {
      throw new Error("Invalid or expired code");
    }

    if (storedCode.expiresAt < new Date()) {
      await verifyCodeModel.deleteOne({ _id: storedCode._id });
      throw new Error("Code expired");
    }

    if (verificationCode != storedCode.verificationCode) {
      throw new Error("Invalid verification code");
    }

    if (!name || !password || !role) throw new Error("Something is missing");

    const hashedPass = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPass,
      role,
      status: "pending",
    });

    await verifyCodeModel.deleteOne({ _id: storedCode._id });

    if (role !== "chairman") {
      const authToken = generateToken({
        id: user._id,
        email: user.email,
        name: user.name,
      });

      const safeUser = await User.findById(user._id).select("-password");

      res
        .status(201)
        .cookie("token", authToken, {
          httpOnly: true,
          secure: true,
        })
        .json({
          message: "User created successfully",
          user: safeUser,
          token: authToken,
        });
    }

    res.status(201).json({ message: "Chairman creation request submitted" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Complete all feilds");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User Not Found. Please Register First!");
    }

    if (user.role === "chairman" && user.status === "rejected") {
      throw new Error("Your Account Creation request is rejected");
    }

    if (user.role === "chairman" && user.status !== "chairman") {
      throw new Error("You're not allowed to login yet");
    }

    const pass = await bcrypt.compare(password, user.password);

    if (!pass) {
      throw new Error("Password Didn't matched");
    }

    const userData = user.toObject();
    delete userData.password;

    const token = generateToken({
      id: userData._id,
      email: userData.email,
    });

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
      })
      .json({
        user: userData,
        token: token,
        message: "LoggedIn Successfully",
      });
  } catch (error) {
    next(error);
  }
};

const profile = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new Error("Please login first");
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new Error("User Not Found");
    }

    res.status(200).json({ message: "User Data Fetched", user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, birthDate, age, gender, address, phone } = req.body;

    if (!name) {
      throw new Error("Your Name is missing");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        birthDate,
        age,
        gender,
        phone,
        address: {
          division: address.division,
          district: address.district,
          upazila: address.upazila,
          union: address.union,
          village: address.village,
        },
      },
      { new: true }
    );

    if (!user) {
      throw new Error("Something is fishy");
    }

    res.status(201).json({ message: "User updated successfully", user });
  } catch (error) {
    next(error);
  }
};

const updateProfilePicture = async (req, res, next) => {
  try {
    const userId = req.userId;
    const photo = req.file;

    const result = await cloudinary.uploader.upload(photo.path, {
      folder: "sonod/userPhoto",
    });

    fs.unlinkSync(photo.path);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: result?.secure_url,
      },
      { new: true }
    );

    res.status(203).json({
      message: "Profile Photo Updated Successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { oldPass, newPass } = req.body;

    const user = await User.findById(userId);

    const isPassMatched = await bcrypt.compare(oldPass, user.password);
    if (!isPassMatched) {
      throw new Error("Enter Correct Old Password");
    }

    const hashedPass = await bcrypt.hash(newPass, 10);

    await User.findByIdAndUpdate(
      userId,
      {
        password: hashedPass,
      },
      { new: true }
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

const forgetPasswordCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("No User Found With This Email Id");
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    await sendEmail(
      email,
      "code for update password",
      `
      <h2>Your password update verification code is : <span style="background:blue;color:white">${verificationCode}</span></h2>
      `
    );

    await verifyCodeModel.create({
      email,
      verificationCode: verificationCode.toString(),
      expiresIn: new Date(Date.now() + 15 * 60 * 1000),
    });

    res.status(200).json({ message: "A 6 digit code sent to your email" });
  } catch (error) {
    next(error);
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const { email, verificationCode, newPassword } = req.body;

    if (!email || !verificationCode || !newPassword) {
      throw new Error("Something is missing");
    }

    const storedCode = await verifyCodeModel.findOne({
      email,
      verificationCode: verificationCode.toString(),
    });

    if (!storedCode) {
      throw new Error("Invalid or expired code");
    }

    if (storedCode.expiresIn < new Date()) {
      await verifyCodeModel.deleteOne({ _id: storedCode._id });
      throw new Error("Code expired");
    }

    const hashedPass = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { email },
      { password: hashedPass },
      { new: true }
    );

    await verifyCodeModel.deleteOne({ _id: storedCode._id });

    res.status(201).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("🔥 Internal Error:", error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendCode,
  createUser,
  login,
  profile,
  updateProfile,
  updateProfilePicture,
  updatePassword,
  forgetPasswordCode,
  forgetPassword,
  logout,
};
