const Comparison = require("../models/ComparisonModel")
const Car = require("../models/CarModel")
const Accessory = require("../models/AccessoryModel")

const normalizeStrings = (values) =>
    (values || []).filter(Boolean).map((value) => value.toString().trim().toLowerCase())

const getCommonItems = (first, second) =>
    first.filter((item) => second.includes(item))

const getUniqueItems = (first, second) =>
    first.filter((item) => !second.includes(item))

const buildComparisonReport = (firstCar, secondCar) => {
    const report = {
        similarities: [],

        differences: [],
        benefits: {
            car1: [],
            car2: []
        },
        defects: {
            car1: [],
            car2: []
        }
    }

    const fields = [
        "brand",
        "model",
        "year",
        "price",
        "mileage",
        "fuelType",
        "transmission",
        "condition",
        "color",
        "bodyType",
        "location"
    ]

    fields.forEach((field) => {
        const firstValue = firstCar[field]
        const secondValue = secondCar[field]

        if (firstValue === undefined || secondValue === undefined || firstValue === null || secondValue === null) {
            return
        }

        if (firstValue === secondValue) {
            report.similarities.push(`Both cars have the same ${field}: ${firstValue}`)
        } else if (field === "price") {
            const difference = Math.abs(firstValue - secondValue)
            if (firstValue < secondValue) {
                report.differences.push(`Car 1 is cheaper by ${difference}`)
                report.benefits.car1.push(`Lower price by ${difference}`)
                report.defects.car2.push(`Higher price by ${difference}`)
            } else {
                report.differences.push(`Car 2 is cheaper by ${difference}`)
                report.benefits.car2.push(`Lower price by ${difference}`)
                report.defects.car1.push(`Higher price by ${difference}`)
            }
        } else if (field === "year") {
            if (firstValue > secondValue) {
                report.differences.push(`Car 1 is newer by ${firstValue - secondValue} year(s)`)
                report.benefits.car1.push(`Newer model year`)
                report.defects.car2.push(`Older model year`)
            } else {
                report.differences.push(`Car 2 is newer by ${secondValue - firstValue} year(s)`)
                report.benefits.car2.push(`Newer model year`)
                report.defects.car1.push(`Older model year`)
            }
        } else if (field === "mileage") {
            if (firstValue < secondValue) {
                report.differences.push(`Car 1 has lower mileage by ${secondValue - firstValue}`)
                report.benefits.car1.push(`Lower mileage`)
                report.defects.car2.push(`Higher mileage`)
            } else {
                report.differences.push(`Car 2 has lower mileage by ${firstValue - secondValue}`)
                report.benefits.car2.push(`Lower mileage`)
                report.defects.car1.push(`Higher mileage`)
            }
        } else {
            report.differences.push(`Car 1 ${field}: ${firstValue} vs Car 2 ${field}: ${secondValue}`)
        }
    })

    const firstFeatures = normalizeStrings(firstCar.features)
    const secondFeatures = normalizeStrings(secondCar.features)
    const sharedFeatures = getCommonItems(firstFeatures, secondFeatures)
    const firstOnly = getUniqueItems(firstFeatures, secondFeatures)
    const secondOnly = getUniqueItems(secondFeatures, firstFeatures)

    if (sharedFeatures.length) {
        report.similarities.push(`Shared features: ${sharedFeatures.join(", ")}`)
    }
    if (firstOnly.length) {
        report.benefits.car1.push(`Includes additional features: ${firstOnly.join(", ")}`)
        report.defects.car2.push(`Missing features compared to Car 1: ${firstOnly.join(", ")}`)
    }
    if (secondOnly.length) {
        report.benefits.car2.push(`Includes additional features: ${secondOnly.join(", ")}`)
        report.defects.car1.push(`Missing features compared to Car 2: ${secondOnly.join(", ")}`)
    }

    return report
}

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

        const report = buildComparisonReport(comparison.car1, comparison.car2)
        const [car1Accessories, car2Accessories] = await Promise.all([
            Accessory.find({ car: comparison.car1._id, inStock: true }).limit(4),
            Accessory.find({ car: comparison.car2._id, inStock: true }).limit(4)
        ])

        res.status(200).json({
            message: "Comparison fetched",
            data: comparison,
            report,
            suggestedAccessories: {
                car1: car1Accessories,
                car2: car2Accessories
            }
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

const compareCars = async (req, res) => {
    try {
        const { car1, car2, save } = req.body

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

        const report = buildComparisonReport(firstCar, secondCar)
        const [car1Accessories, car2Accessories] = await Promise.all([
            Accessory.find({ car: firstCar._id, inStock: true }).limit(4),
            Accessory.find({ car: secondCar._id, inStock: true }).limit(4)
        ])

        let comparison = null
        if (save) {
            comparison = await Comparison.create({
                user: req.user.id,
                car1,
                car2
            })
        }

        res.status(200).json({
            message: "Comparison report generated",
            report,
            suggestedAccessories: {
                car1: car1Accessories,
                car2: car2Accessories
            },
            comparison
        })
    } catch (err) {
        res.status(500).json({
            message: "Error generating comparison report",
            err
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
    compareCars,
    deleteComparison
}
