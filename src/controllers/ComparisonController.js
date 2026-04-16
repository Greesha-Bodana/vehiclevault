const Comparison = require("../models/ComparisonModel")
const Car = require("../models/CarModel")

const createComparison = async (req, res) => {
    try {
        const { car1, car2 } = req.body

        if (!car1 || !car2) {
            return res.status(400).json({
                message: "Both car IDs required"
            })
        }

        if (car1 === car2) {
            return res.status(400).json({
                message: "Please choose two different cars for comparison"
            })
        }

        const [firstCar, secondCar] = await Promise.all([
            Car.findById(car1),
            Car.findById(car2)
        ])

        if (!firstCar || !secondCar) {
            return res.status(404).json({
                message: "One or both cars were not found"
            })
        }

        const comparison = await Comparison.create({
            user: req.user.id,
            car1,
            car2
        })

        res.status(201).json({
            message: "Comparison created",
            data: comparison
        })

    } catch (err) {
        res.status(500).json({
            message: "Error creating comparison",
            err
        })
    }
}


const getComparison = async (req, res) => {
    try {
        const comparison = await Comparison.findById(req.params.id)
            .populate("user", "name email")
            .populate("car1")
            .populate("car2")

        if (!comparison) {
            return res.status(404).json({
                message: "Comparison not found"
            })
        }

        if (
            req.user.role !== "admin" &&
            comparison.user._id.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not allowed to view this comparison"
            })
        }

        res.status(200).json({
            message: "Comparison fetched",
            data: comparison
        })

    } catch (err) {
        res.status(500).json({
            message: "Error fetching comparison",
            err
        })
    }
}

const getMyComparisons = async (req, res) => {
    try {
        const comparisons = await Comparison.find({ user: req.user.id })
            .populate("car1")
            .populate("car2")
            .sort({ createdAt: -1 })

        res.status(200).json({
            message: "Comparisons fetched successfully",
            count: comparisons.length,
            data: comparisons
        })
    } catch (err) {
        res.status(500).json({
            message: "Error fetching comparisons",
            error: err.message
        })
    }
}

const deleteComparison = async (req, res) => {
    try {
        const comparison = await Comparison.findById(req.params.id)

        if (!comparison) {
            return res.status(404).json({
                message: "Comparison not found"
            })
        }

        if (
            req.user.role !== "admin" &&
            comparison.user.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not allowed to delete this comparison"
            })
        }

        await Comparison.findByIdAndDelete(req.params.id)

        res.status(200).json({
            message: "Comparison deleted successfully"
        })
    } catch (err) {
        res.status(500).json({
            message: "Error deleting comparison",
            error: err.message
        })
    }
}

module.exports = {
    createComparison,
    getComparison,
    getMyComparisons,
    deleteComparison
}
