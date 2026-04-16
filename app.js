const express = require("express")
const cors = require("cors")
const app = express()
require("dotenv").config()

app.use(cors())
app.use(express.json()) 

const DBConnection = require("./src/utils/DBConnection")
DBConnection()

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

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})