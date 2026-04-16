const router = require("express").Router()
const controller = require("../controllers/NotificationController")
const auth = require("../middleware/AuthMiddleware")

router.post("/", auth, controller.addNotification)
router.get("/", auth, controller.getNotifications)
router.patch("/:id/read", auth, controller.markNotificationAsRead)
router.delete("/:id", auth, controller.deleteNotification)

module.exports = router
