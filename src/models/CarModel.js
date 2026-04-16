const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    mileage: {
        type: Number
    },
    fuelType: {
        type: String,
        enum: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "LPG", "Other"]
    },
    transmission: {
        type: String,
        enum: ["Manual", "Automatic", "Semi-Automatic", "CVT", "Other"]
    },
    condition: {
        type: String,
        enum: ["New", "Used", "Certified Pre-Owned", "Salvage", "Other"],
        default: "Used"
    },
    color: {
        type: String
    },
    bodyType: {
        type: String
    },
    location: {
        type: String
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    features: [String],
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
module.exports = mongoose.model("car", carSchema);