const router = require("express").Router();
const auth = require("../middleware/AuthMiddleware");
const controller = require("../controllers/PaymentController");

router.post("/order", auth, controller.createOrder);
router.post("/verify", auth, controller.verifyPayment);

module.exports = router;
