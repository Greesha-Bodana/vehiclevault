const router = require("express").Router()
const controller = require("../controllers/AccessoryController")

router.post("/", controller.addAccessory)
router.get("/", controller.getAccessories)
router.get("/:carId", controller.getAccessoriesByCar)
router.delete("/:id", controller.deleteAccessory)

module.exports = router