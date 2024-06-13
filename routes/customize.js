const express = require("express");
const router = express.Router();
const customizeController = require("../controller/customize");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/get-slide-image", customizeController.getImages);
router.post("/delete-slide-image", customizeController.deleteSlideImage);
router.post(
  "/upload-slide-image",
  upload.none(),
  customizeController.uploadSlideImage
);
router.post("/dashboard-data", customizeController.getAllData);

module.exports = router;
