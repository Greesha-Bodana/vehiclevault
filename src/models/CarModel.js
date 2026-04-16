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
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    }
}, { timestamps: true });
module.exports = mongoose.model("car", carSchema);