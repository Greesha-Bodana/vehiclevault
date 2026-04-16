const router = require("express").Router();
const auth = require("../middleware/AuthMiddleware");
const upload = require("../middleware/UploadMiddleware");
const controller = require("../controllers/UploadController");

router.post("/image", auth, upload.single("image"), controller.uploadImage);

module.exports = router;
