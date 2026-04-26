const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true,
        min: 1900
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
    description: {
        type: String,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

carSchema.index({ brand: 1, model: 1 });
carSchema.index({ price: 1 });
carSchema.index({ year: -1 });
carSchema.index({ user: 1 });

module.exports = mongoose.model("car", carSchema);
