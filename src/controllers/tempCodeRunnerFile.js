const Accessory = require("../models/AccessoryModel")

const addAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.create(req.body)

    res.status(201).json({
      message: "Accessory added successfully",
      data: accessory
    })

  } catch (err) {
    res.status(500).json({
      message: "Error adding accessory",
      err
    })
  }
}



const getAccessories = async (req, res) => {
  try {
    const accessories = await Accessory.find().populate("car")

    res.status(200).json({
      message: "Accessories fetched",
      data: accessories
    })

  } catch (err) {
    res.status(500).json({
      message: "Error fetching accessories",
      err
    })
  }
}


const getAccessoriesByCar = async (req, res) => {
  try {
    const accessories = await Accessory.find({
      car: req.params.carId
    })

    res.status(200).json({
      message: "Accessories for car",
      data: accessories
    })

  } catch (err) {
    res.status(500).json({
      message: "Error fetching accessories",
      err
    })
  }
}

const deleteAccessory = async (req, res) => {
  try {
    await Accessory.findByIdAndDelete(req.params.id)

    res.status(200).json({
      message: "Accessory deleted"
    })

  } catch (err) {
    res.status(500).json({
      message: "Error deleting accessory",
      err
    })
  }
}

module.exports = {
  addAccessory,
  getAccessories,
  getAccessoriesByCar,
  deleteAccessory
}