const Car = require("../models/CarModel");
const fs = require("fs/promises");
const uploadToCloudinary = require("../utils/CloudinaryUtil");

const canManageCar = (requestUser, carOwnerId) =>
    requestUser.role === "admin" || carOwnerId?.toString() === requestUser.id;

const uploadCarImage = async (file) => {
    const cloudinaryResponse = await uploadToCloudinary(file.path);

    if (file.path) {
        await fs.unlink(file.path).catch(() => {});
    }

    return cloudinaryResponse.secure_url || "";
};

const addCar = async (req, res) => {
    try {
        const { name, brand, model, year, price, description, isAvailable } = req.body;

        if (!name || !brand || !model || !year || price === undefined || price === null || price === "") {
            return res.status(400).json({
                message: "Name, brand, model, year and price are required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Car image is required"
            });
        }

        const imageUrl = await uploadCarImage(req.file);

        const car = await Car.create({
            user: req.user.id,
            name: name.trim(),
            brand: brand.trim(),
            model: model.trim(),
            year: Number(year),
            price: Number(price),
            image: imageUrl,
            description,
            isAvailable: isAvailable === undefined ? true : isAvailable === true || isAvailable === "true"
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
            minPrice,
            maxPrice,
            search,
            isAvailable,
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        const query = {};

        if (brand) query.brand = new RegExp(brand, "i");
        if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";
        if (search) {
            query.$or = [
                { name: new RegExp(search, "i") },
                { brand: new RegExp(search, "i") },
                { model: new RegExp(search, "i") }
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

        const updates = { ...req.body };

        if (updates.name !== undefined) updates.name = updates.name.trim();
        if (updates.brand !== undefined) updates.brand = updates.brand.trim();
        if (updates.model !== undefined) updates.model = updates.model.trim();
        if (updates.year !== undefined && updates.year !== "") updates.year = Number(updates.year);
        if (updates.price !== undefined && updates.price !== "") updates.price = Number(updates.price);
        if (updates.description !== undefined) updates.description = updates.description.trim();
        if (updates.isAvailable !== undefined) {
            updates.isAvailable = updates.isAvailable === true || updates.isAvailable === "true";
        }

        if (req.file) {
            updates.image = await uploadCarImage(req.file);
        } else {
            updates.image = existingCar.image;
        }

        const car = await Car.findByIdAndUpdate(
            req.params.id,
            updates,
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
