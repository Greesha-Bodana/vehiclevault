const Accessory = require("../models/AccessoryModel")
const Car = require("../models/CarModel")

const canManageCar = (requestUser, carOwnerId) =>
  requestUser.role === "admin" || carOwnerId.toString() === requestUser.id

const addAccessory = async (req, res) => {
  try {
    const car = await Car.findById(req.body.car)

    if (!car) {
      return res.status(404).json({
        message: "Car not found"
      })
    }

    if (!canManageCar(req.user, car.user)) {
      return res.status(403).json({
        message: "You are not allowed to add accessories to this car"
      })
    }

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
    const car = await Car.findById(req.params.carId)

    if (!car) {
      return res.status(404).json({
        message: "Car not found"
      })
    }

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

const updateAccessory = async (req, res) => {
  try {
    const existingAccessory = await Accessory.findById(req.params.id).populate("car")

    if (!existingAccessory) {
      return res.status(404).json({
        message: "Accessory not found"
      })
    }

    if (!canManageCar(req.user, existingAccessory.car.user)) {
      return res.status(403).json({
        message: "You are not allowed to update this accessory"
      })
    }

    const accessory = await Accessory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.status(200).json({
      message: "Accessory updated successfully",
      data: accessory
    })
  } catch (err) {
    res.status(500).json({
      message: "Error updating accessory",
      err
    })
  }
}

const deleteAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id).populate("car")

    if (!accessory) {
      return res.status(404).json({
        message: "Accessory not found"
      })
    }

    if (!canManageCar(req.user, accessory.car.user)) {
      return res.status(403).json({
        message: "You are not allowed to delete this accessory"
      })
    }

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
  updateAccessory,
  deleteAccessory
}
