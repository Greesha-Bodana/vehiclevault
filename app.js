const express = require("express")
const cors = require("cors")
const app = express()
require("dotenv").config()

if (!process.env.JWT_SECRET) {
    console.warn("JWT_SECRET is missing in .env. Login will not work without it.")
}

app.use(cors())
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))

const DBConnection = require("./src/utils/DBConnection")
DBConnection()

app.get("/", (req, res) => {
    res.status(200).json({
        message: "VehicleVault backend is running"
    })
})

const userRoutes = require("./src/routes/UserRoutes")
app.use("/user", userRoutes)

const carRoutes = require("./src/routes/CarRoutes")
app.use("/car",carRoutes)

const comparisonRoutes =require("./src/routes/ComparisonRoutes")
app.use("/comparison",comparisonRoutes)

const accessoryRoutes= require("./src/routes/AccessoryRoutes")
app.use("/accessory",accessoryRoutes)

const notificationRoutes = require("./src/routes/NotificationRoutes")
app.use("/notification", notificationRoutes)

const wishlistRoutes = require("./src/routes/WishlistRoutes");
app.use("/wishlist", wishlistRoutes)

const uploadRoutes = require("./src/routes/UploadRoutes")
app.use("/upload", uploadRoutes)

const paymentRoutes = require("./src/routes/PaymentRoutes")
app.use("/payment", paymentRoutes)

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})
