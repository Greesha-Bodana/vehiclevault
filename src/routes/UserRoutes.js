const router = require("express").Router()
const userController = require("../controllers/UserController")
router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)
router.get("/", userController.getUsers)
router.get("/:id", userController.getUserById)
router.put("/:id", userController.updateUser)
router.delete("/:id", userController.deleteUser)
module.exports = router