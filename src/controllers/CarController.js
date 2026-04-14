const Car = require("../models/CarModel");

// CREATE
const addCar = async (req, res) => {
    try {
        const car = await Car.create(req.body);
        res.status(201).json({ message: "Car added", data: car });
    } catch (err) {
        res.status(500).json({ message: "Error", err });
    }
};

// READ ALL
const getCars = async (req, res) => {
    const cars = await Car.find();
    res.status(200).json(cars);
};

// READ ONE
const getCarById = async (req, res) => {
    const car = await Car.findById(req.params.id);
    res.status(200).json(car);
};

// UPDATE
const updateCar = async (req, res) => {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Updated", data: car });
};

// DELETE
const deleteCar = async (req, res) => {
    await Car.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
};

module.exports = { addCar, getCars, getCarById, updateCar, deleteCar };