const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  title: {
    type: String
  },
  message: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("notification", notificationSchema);