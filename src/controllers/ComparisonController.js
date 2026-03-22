const Comparison = require("../models/ComparisonModel")

const createComparison = async (req, res) => {
    try {
        const { car1, car2 } = req.body

        if (!car1 || !car2) {
            return res.status(400).json({
                message: "Both car IDs required"
            })
        }

        const comparison = await Comparison.create({
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
            .populate("car1")
            .populate("car2")

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

module.exports = {
    createComparison,
    getComparison
}