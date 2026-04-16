const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wishlistSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "car",
      required: true,
    },
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1, car: 1 }, { unique: true });

module.exports = mongoose.model("wishlist", wishlistSchema);
