const carSchema = require("../models/CarModel")

const addCar = async (req, res) => {
    try {
        const car = await carSchema.create(req.body)
        res.status(201).json({
            message: "Car added successfully",
            car: car
        })
    } catch (err) {
        res.status(500).json({
            message: "error while adding car",
            err: err
        })
    }
}

const getCars = async (req, res) => {
    try {
        const cars = await carSchema.find()
        res.status(200).json(cars)
    } catch (err) {
        res.status(500).json({
            message: "error while fetching cars",
            err: err
        })
    }
}

const getCarById = async (req, res) => {
    try {
        const car = await carSchema.findById(req.params.id)

        res.status(200).json(car)
    } catch (err) {
        res.status(500).json({
            message: "error while fetching car",
            err: err
        })
    }
}


const updateCar = async (req, res) => {
    try {
        const car = await carSchema.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.status(200).json({
            message: "Car updated",
            car: car
        })
    } catch (err) {
        res.status(500).json({
            message: "error while updating car",
            err: err
        })
    }
}

const deleteCar = async (req, res) => {
    try {
        await carSchema.findByIdAndDelete(req.params.id)
        res.status(200).json({
            message: "Car deleted"
        })
    } catch (err) {
        res.status(500).json({
            message: "error while deleting car",
            err: err
        })
    }
}

module.exports = {
    addCar,
    getCars,
    getCarById,
    updateCar,
    deleteCar
}