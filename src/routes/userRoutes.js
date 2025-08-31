const {
  createAdmin,
  approveChairman,
  rejectChairman,
} = require("../controllers/admin.controller");
const {
  sendCode,
  createUser,
  login,
  profile,
  updateProfile,
  updateProfilePicture,
  forgetPasswordCode,
  forgetPassword,
  updatePassword,
  logout,
} = require("../controllers/user.controller");
const userCheck = require("../middleware/userCheck");
const upload = require("../utils/multer");
const router = require("express").Router();

router.post("/sendCode", sendCode);
router.post("/register", createUser);
router.post("/login", login);
router.get("/profile", userCheck, profile);
router.put("/updateProfile", userCheck, updateProfile);
router.put("/updatePassword", userCheck, updatePassword);
router.put(
  "/updateProfilePicture",
  userCheck,
  upload.single("profilePic"),
  updateProfilePicture
);
router.post("/sendForgetPassCode", forgetPasswordCode);
router.post("/forgetPassword", forgetPassword);
router.post("/logout", userCheck, logout);

router.post("/admin/rr/rsc-create-bro-admin", createAdmin);
router.put("/chairman/approve/:id", userCheck, approveChairman);
router.put("/chairman/reject/:id", userCheck, rejectChairman);

module.exports = router;
