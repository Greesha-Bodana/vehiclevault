const router = require("express").Router()
const controller = require("../controllers/AccessoryController")
const auth = require("../middleware/AuthMiddleware")

router.post("/", auth, controller.addAccessory)
router.get("/", controller.getAccessories)
router.get("/:carId", controller.getAccessoriesByCar)
router.put("/:id", auth, controller.updateAccessory)
router.delete("/:id", auth, controller.deleteAccessory)

module.exports = router
