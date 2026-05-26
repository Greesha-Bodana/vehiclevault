const router = require("express").Router()
const carController = require("../controllers/CarController")
const validateToken = require("../middleware/AuthMiddleware")
const upload = require("../middleware/UploadMiddleware")

router.get("/", validateToken, carController.getCars)
router.get("/myCars", validateToken, carController.getMyCars)
router.get("/:id", validateToken, carController.getCarById)
router.post("/", upload.single("image"), carController.addCar)
router.put("/:id", validateToken, upload.single("image"), carController.updateCar)
router.delete("/:id", validateToken, carController.deleteCar)

module.exports = router
