const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accessorySchema = new Schema({
  car: {
    type: Schema.Types.ObjectId,
    ref: "car",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    trim: true
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

accessorySchema.index({ car: 1 });

module.exports = mongoose.model("accessory", accessorySchema);
