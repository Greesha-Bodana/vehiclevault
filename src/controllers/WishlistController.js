const Wishlist = require("../models/WishlistModel");
const Car = require("../models/CarModel");

exports.addToWishlist = async (req, res) => {
  try {
    const { car } = req.body;

    if (!car) {
      return res.status(400).json({ message: "Car id is required" });
    }

    const existingCar = await Car.findById(car);

    if (!existingCar) {
      return res.status(404).json({ message: "Car not found" });
    }

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

    res.status(201).json({
      message: "Added to wishlist",
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user.id,
    }).populate({
      path: "car",
      populate: {
        path: "user",
        select: "name email"
      }
    });

    res.status(200).json({
      message: "Wishlist fetched successfully",
      count: wishlist.length,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    const wishlistItem = await Wishlist.findById(id);

    if (!wishlistItem) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    if (wishlistItem.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to remove this wishlist item" });
    }

    await Wishlist.findByIdAndDelete(id);

    res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
