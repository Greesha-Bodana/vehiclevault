const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const comparisonSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    car1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "car",
        required: true
    },
    car2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "car",
        required: true
    }
}, { timestamps: true });

comparisonSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("comparison", comparisonSchema);
