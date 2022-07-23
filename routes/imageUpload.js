const express = require("express");
const router = express.Router();

//validators
const { imageCreateValidator } = require("../validators/imagesValid");
const { runValidation } = require("../validators");
const { requireSignin,authMiddleware } = require("../controllers/auth");

//controller
const { create, list, read, update, remove } = require('../controllers/imageUpload');
// routes
router.post(
  "/image-upload",
  imageCreateValidator,
  runValidation,
  requireSignin,
  create
);
router.put("/image-upload-list",  list);

router.delete("/image-upload/:slug", requireSignin, remove);

module.exports = router;
