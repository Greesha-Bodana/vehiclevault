const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accessorySchema = new Schema({
    car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "car",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model("accessory", accessorySchema);