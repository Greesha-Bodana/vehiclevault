const mongoose = require("mongoose")
require("dotenv").config({ override: true })

const DBConnection = async () => {
    const mongoUri = process.env.MONGO_URL || process.env.Mongo_URL

    if (!mongoUri) {
        console.log("MongoDB connection string is missing. Set MONGO_URL in .env")
        return null
    }

    try {
        await mongoose.connect(mongoUri)
        console.log("DB Connected")
        return mongoose
    } catch (e) {
        console.log("MongoDB connection failed:", e.message)
        return null
    }
}
module.exports = DBConnection
