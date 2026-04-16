const router = require("express").Router()
const carController = require("../controllers/CarController")
const auth = require("../middleware/AuthMiddleware")

router.post("/", auth, carController.addCar)
router.get("/my/listings", auth, carController.getMyCars)
router.get("/", carController.getCars)
router.get("/:id", carController.getCarById)
router.put("/:id", auth, carController.updateCar)
router.delete("/:id", auth, carController.deleteCar)

module.exports = router
