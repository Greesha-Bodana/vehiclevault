const router = require("express").Router()
const controller = require("../controllers/ComparisonController")
const auth = require("../middleware/AuthMiddleware")

router.post("/", auth, controller.createComparison)
router.get("/", auth, controller.getMyComparisons)
router.get("/:id", auth, controller.getComparison)
router.delete("/:id", auth, controller.deleteComparison)

module.exports = router
