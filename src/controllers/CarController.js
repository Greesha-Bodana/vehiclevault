const Car = require("../models/CarModel");

const canManageCar = (requestUser, carOwnerId) =>
    requestUser.role === "admin" || carOwnerId.toString() === requestUser.id;

const addCar = async (req, res) => {
    try {
        const car = await Car.create({
            ...req.body,
            user: req.user.id
        });

        res.status(201).json({
            message: "Car added successfully",
            data: car
        });
    } catch (err) {
        res.status(500).json({ message: "Error creating car", error: err.message });
    }
};

const getCars = async (req, res) => {
    try {
        const {
            brand,
            fuelType,
            transmission,
            condition,
            location,
            minPrice,
            maxPrice,
            search,
            isAvailable,
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        const query = {};

        if (brand) query.brand = new RegExp(brand, "i");
        if (fuelType) query.fuelType = fuelType;
        if (transmission) query.transmission = transmission;
        if (condition) query.condition = condition;
        if (location) query.location = new RegExp(location, "i");
        if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";
        if (search) {
            query.$or = [
                { name: new RegExp(search, "i") },
                { brand: new RegExp(search, "i") },
                { model: new RegExp(search, "i") },
                { bodyType: new RegExp(search, "i") }
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const allowedSortFields = ["createdAt", "price", "year", "brand"];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
        const sortOrder = order === "asc" ? 1 : -1;

        const cars = await Car.find(query)
            .populate("user", "name email role")
            .sort({ [sortField]: sortOrder });

        res.status(200).json({
            message: "Cars fetched successfully",
            count: cars.length,
            data: cars
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching cars", error: err.message });
    }
};

const getMyCars = async (req, res) => {
    try {
        const cars = await Car.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Your cars fetched successfully",
            count: cars.length,
            data: cars
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching your cars", error: err.message });
    }
};

const getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id).populate("user", "name email role");
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }
        res.status(200).json({
            message: "Car fetched successfully",
            data: car
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching car", error: err.message });
    }
};

const updateCar = async (req, res) => {
    try {
        const existingCar = await Car.findById(req.params.id);

        if (!existingCar) {
            return res.status(404).json({ message: "Car not found" });
        }

        if (!canManageCar(req.user, existingCar.user)) {
            return res.status(403).json({ message: "You are not allowed to update this car" });
        }

        const car = await Car.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }

        res.status(200).json({ message: "Car updated successfully", data: car });
    } catch (err) {
        res.status(500).json({ message: "Error updating car", error: err.message });
    }
};

const deleteCar = async (req, res) => {
    try {
        const existingCar = await Car.findById(req.params.id);

        if (!existingCar) {
            return res.status(404).json({ message: "Car not found" });
        }

        if (!canManageCar(req.user, existingCar.user)) {
            return res.status(403).json({ message: "You are not allowed to delete this car" });
        }

        await Car.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Car deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting car", error: err.message });
    }
};

module.exports = { addCar, getCars, getMyCars, getCarById, updateCar, deleteCar };
