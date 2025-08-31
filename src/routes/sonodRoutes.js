const router = require("express").Router();
const {
  createSonod,
  updateSonodStatus,
  getMySonodList,
  getAllSonodList,
  getSonod,
} = require("../controllers/sonod.controller");
const userCheck = require("../middleware/userCheck");
const upload = require("../utils/multer");

router.post(
  "/create-sonod",
  userCheck,
  upload.single("sonodimage"),
  createSonod
);
router.put("/updateSonodStatus/:id", userCheck, updateSonodStatus);
router.get("/get-allsonod-list", userCheck, getAllSonodList);
router.get("/get-mysonod-list", userCheck, getMySonodList);

router.get("/get-sonod/:id", userCheck, getSonod);

module.exports = router;
