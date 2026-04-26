const router = require("express").Router()
const carController = require("../controllers/CarController")
const auth = require("../middleware/AuthMiddleware")
const upload = require("../middleware/UploadMiddleware")

router.post("/", auth, upload.single("image"), carController.addCar)
router.get("/", carController.getCars)
router.get("/:id", carController.getCarById)
router.put("/:id", auth, upload.single("image"), carController.updateCar)
router.delete("/:id", auth, carController.deleteCar)

module.exports = router
