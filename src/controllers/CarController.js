const Car = require("../models/CarModel");

// CREATE
const addCar = async (req, res) => {
    try {
        const car = await Car.create(req.body);
        res.status(201).json({ message: "Car added", data: car });
    } catch (err) {
        res.status(500).json({ message: "Error creating car", error: err.message });
    }
};

// READ ALL
const getCars = async (req, res) => {
    try {
        const cars = await Car.find();
        res.status(200).json(cars);
    } catch (err) {
        res.status(500).json({ message: "Error fetching cars", error: err.message });
    }
};

// READ ONE
const getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }
        res.status(200).json(car);
    } catch (err) {
        res.status(500).json({ message: "Error fetching car", error: err.message });
    }
};

// UPDATE
const updateCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }
        res.status(200).json({ message: "Updated", data: car });
    } catch (err) {
        res.status(500).json({ message: "Error updating car", error: err.message });
    }
};

// DELETE
const deleteCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting car", error: err.message });
    }
};

module.exports = { addCar, getCars, getCarById, updateCar, deleteCar };