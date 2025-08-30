const router = require("express").Router();
const {
  createSonod,
  updateSonodStatus,
  getSonodList,
  getSonod,
} = require("../controllers/sonod.controller");
const userCheck = require("../middleware/userCheck");
const upload = require("../utils/multer");

router.post("/create-sonod", userCheck, upload.single(""), createSonod);
router.post("/updateSonodStatus", userCheck, updateSonodStatus);
router.get("/get-sonod-list", userCheck, getSonodList);
router.get("/get-sonod/:id", userCheck, getSonod);

module.exports = router;
