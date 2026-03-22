const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const comparisonSchema = new Schema({
    car1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "car",
        required: true
    },
    car2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "car",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("comparison", comparisonSchema);