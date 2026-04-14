const Notification = require("../models/NotificationModel")


const addNotification = async (req, res) => {
  try {
    const { title, message } = req.body

    const notification = await Notification.create({
      title,
      message
    })

    res.status(201).json({
      message: "Notification added",
      data: notification
    })

  } catch (err) {
    res.status(500).json({
      message: "Error adding notification",
      err
    })
  }
}



const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ date: -1 })

    res.status(200).json({
      message: "Notifications fetched",
      data: notifications
    })

  } catch (err) {
    res.status(500).json({
      message: "Error fetching notifications",
      err
    })
  }
}


const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id)

    res.status(200).json({
      message: "Notification deleted"
    })

  } catch (err) {
    res.status(500).json({
      message: "Error deleting notification",
      err
    })
  }
}

module.exports = {
  addNotification,
  getNotifications,
  deleteNotification
}