const router = require("express").Router()
const userController = require("../controllers/UserController")
const auth = require("../middleware/AuthMiddleware")

router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)
router.get("/", auth, userController.getUsers)
router.get("/:id", auth, userController.getUserById)
router.put("/:id", auth, userController.updateUser)
router.delete("/:id", auth, userController.deleteUser)

module.exports = router
