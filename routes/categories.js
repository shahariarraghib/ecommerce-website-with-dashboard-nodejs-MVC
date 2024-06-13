const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categories");
const multer = require("multer");
const { loginCheck } = require("../middleware/auth");
const upload = multer({ dest: "uploads/" });

router.get("/all-category", categoryController.getAllCategory);
router.post("/add-category", upload.none(), categoryController.postAddCategory);
router.post("/edit-category", loginCheck, categoryController.postEditCategory);
router.post(
  "/delete-category",
  loginCheck,
  categoryController.getDeleteCategory
);

module.exports = router;
