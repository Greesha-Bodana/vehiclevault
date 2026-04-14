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
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("accessory", accessorySchema);