const router = require("express").Router()
const controller = require("../controllers/ComparisonController")

router.post("/", controller.createComparison)
router.get("/:id", controller.getComparison)

module.exports = router