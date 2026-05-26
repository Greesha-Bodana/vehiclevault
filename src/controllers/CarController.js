const Car = require("../models/CarModel");
const User = require("../models/UserModel");
const fs = require("fs/promises");
const uploadToCloudinary = require("../utils/CloudinaryUtil");

const getServerBaseUrl = () =>
    process.env.BACKEND_URL ||
    process.env.SERVER_URL ||
    `http://localhost:${process.env.PORT || 3000}`;

const getLocalUploadPrefix = () => `${getServerBaseUrl()}/uploads/`;

const normalizeLocalUploadUrl = (imageUrl) => {
    if (typeof imageUrl !== "string") {
        return imageUrl;
    }

    const localUploadPrefix = getLocalUploadPrefix();

    if (!imageUrl.startsWith(localUploadPrefix)) {
        return imageUrl;
    }

    const rawFileName = imageUrl.slice(localUploadPrefix.length);

    try {
        return `${localUploadPrefix}${encodeURIComponent(decodeURIComponent(rawFileName))}`;
    } catch (error) {
        return `${localUploadPrefix}${encodeURIComponent(rawFileName)}`;
    }
};

const canManageCar = (requestUser, carOwnerId) =>
    requestUser.role === "admin" || carOwnerId?.toString() === requestUser.id;

const uploadCarImage = async (file) => {
    if (!file?.path) {
        throw new Error("Image file is missing");
    }

    const localImageUrl = `${getLocalUploadPrefix()}${encodeURIComponent(file.filename)}`;

    try {
        const cloudinaryResponse = await uploadToCloudinary(file.path);
        await fs.unlink(file.path).catch(() => {});
        return cloudinaryResponse.secure_url || localImageUrl;
    } catch (error) {
        console.warn("Cloudinary upload failed, using local image instead:", error.message);
        return localImageUrl;
    }
};

const addCar = async (req, res) => {
    try {
        const { name, brand, model, year, price, description, isAvailable, user } = req.body;
        const adminEmail = (process.env.ADMIN_EMAIL || "admin@vehiclevault.com").toLowerCase().trim();
        let ownerId = req.user?.id || user;

        if (!name || !brand || !model || !year || price === undefined || price === null || price === "") {
            return res.status(400).json({
                message: "Name, brand, model, year and price are required"
            });
        }

        if (!ownerId) {
            const defaultOwner = await User.findOne({ email: adminEmail }).select("_id");
            ownerId = defaultOwner?._id;
        }

        if (!ownerId) {
            return res.status(400).json({
                message: "Unable to determine a default owner for this car"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Car image is required"
            });
        }

        const imageUrl = await uploadCarImage(req.file);

        const car = await Car.create({
            user: ownerId,
            name: name.trim(),
            brand: brand.trim(),
            model: model.trim(),
            year: Number(year),
            price: Number(price),
            image: normalizeLocalUploadUrl(imageUrl),
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
            data: cars.map((car) => ({
                ...car.toObject(),
                image: normalizeLocalUploadUrl(car.image)
            }))
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
            data: cars.map((car) => ({
                ...car.toObject(),
                image: normalizeLocalUploadUrl(car.image)
            }))
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
            data: {
                ...car.toObject(),
                image: normalizeLocalUploadUrl(car.image)
            }
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

        res.status(200).json({
            message: "Car updated successfully",
            data: {
                ...car.toObject(),
                image: normalizeLocalUploadUrl(car.image)
            }
        });
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
