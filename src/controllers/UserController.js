const userSchema = require("../models/UserModel")
const bcrypt = require("bcrypt")


const registerUser = async (req, res) => {
    try {

        const hashedPassword = await bcrypt.hash(req.body.password,10)

        const saveUser = await userSchema.create({...req.body,password:hashedPassword})
        res.status(201).json({
            message: "User created Successfully",
            saveUser:saveUser
        })

    } catch (err) {
        res.status(500).json({
            message: "error while crating user",
            err: err
        })
    }
}
module.exports={
    registerUser
}