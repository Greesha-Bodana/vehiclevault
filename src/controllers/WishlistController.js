const Wishlist = require("../models/Wishlist");
const mongoose = require("mongoose");

// ADD TO WISHLIST
exports.addToWishlist = async (req, res) => {
  try {
    const { car } = req.body;

    if (!car) {
      return res.status(400).json({
        success: false,
        message: "Car ID is required",
      });
    }

    const exists = await Wishlist.findOne({
      user: req.user.id,
      car,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Already in wishlist",
      });
    }

    const wishlist = await Wishlist.create({
      user: req.user.id,
      car,
    });

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
      data: wishlist,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// GET USER WISHLIST
exports.getWishlist = async (req, res) => {
  try {
    const data = await Wishlist.find({ user: req.user.id })
      .populate("car");

    res.status(200).json({
      success: true,
      data,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// REMOVE FROM WISHLIST
exports.removeFromWishlist = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const item = await Wishlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};