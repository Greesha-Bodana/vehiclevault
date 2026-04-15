const Wishlist = require("../models/WishlistModel");

// ADD TO WISHLIST
exports.addToWishlist = async (req, res) => {
  try {
    const { car } = req.body;

    // check already exists
    const exists = await Wishlist.findOne({
      user: req.user.id,
      car,
    });

    if (exists) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    const wishlist = await Wishlist.create({
      user: req.user.id,
      car,
    });

    res.status(201).json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET USER WISHLIST
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user.id,
    }).populate("car");

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REMOVE FROM WISHLIST
exports.removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    await Wishlist.findByIdAndDelete(id);

    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};