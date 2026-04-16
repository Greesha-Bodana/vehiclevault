const mongoose = require("mongoose")
require("dotenv").config()

const DBConnection = () => {
    const mongoUri = process.env.MONGO_URL || process.env.Mongo_URL

    if (!mongoUri) {
        console.log("MongoDB connection string is missing. Set MONGO_URL in .env")
        return
    }

    mongoose.connect(mongoUri).then(()=>{
    console.log("DB Connected")
     }).catch((e)=>{
        console.log("MongoDB connection failed:", e.message)
    })
}
module.exports = DBConnection
