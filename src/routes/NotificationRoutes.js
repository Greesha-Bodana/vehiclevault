const router = require("express").Router()
const controller = require("../controllers/NotificationController")

router.post("/", controller.addNotification)
router.get("/", controller.getNotifications)
router.delete("/:id", controller.deleteNotification)

module.exports = router