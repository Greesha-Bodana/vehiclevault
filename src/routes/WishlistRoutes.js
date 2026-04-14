const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/WishlistController");

const auth = require(".../middleware/AuthMiddleware");

router.post("/add", auth, addToWishlist);
router.get("/", auth, getWishlist);
router.delete("/:id", auth, removeFromWishlist);

module.exports = router;