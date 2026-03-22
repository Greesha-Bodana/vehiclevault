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
    fuelType: {
        type: String
    },
    transmission: {
        type: String
    },
    mileage: {
        type: Number
    },
    engine: {
        type: String
    },
    // image: {
    //     type: String
    // }

})
module.exports = mongoose.model("car", carSchema);