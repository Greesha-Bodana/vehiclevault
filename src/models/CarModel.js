const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    fuelType: String,
    transmission: String,
    mileage: Number,
    engine: String,

    // 🖼️ Image support
    image: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});
module.exports = mongoose.model("car", carSchema);