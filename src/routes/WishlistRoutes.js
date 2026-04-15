const express = require("express");
const router = express.Router();

const WishlistController = require("../controllers/WishlistController");
const auth = require("../middleware/AuthMiddleware");

// ADD
router.post("/add", auth, WishlistController.addToWishlist);

// GET
router.get("/", auth, WishlistController.getWishlist);

// DELETE
router.delete("/:id", auth, WishlistController.removeFromWishlist);

module.exports = router;