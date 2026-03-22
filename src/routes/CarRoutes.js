const router = require("express").Router()
const carController = require("../controllers/CarController")
router.post("/", carController.addCar)
router.get("/", carController.getCars)
router.get("/:id", carController.getCarById)
router.put("/:id", carController.updateCar)
router.delete("/:id", carController.deleteCar)

module.exports = router