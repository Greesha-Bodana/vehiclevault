const Notification = require("../models/NotificationModel")

const addNotification = async (req, res) => {
  try {
    const { title, message, user, type, link } = req.body
    const targetUser = req.user.role === "admin" && user ? user : req.user.id

    const notification = await Notification.create({
      user: targetUser,
      type,
      title,
      message,
      link
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
    const query = req.user.role === "admin" && req.query.user
      ? { user: req.query.user }
      : { user: req.user.id }

    const notifications = await Notification.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: "Notifications fetched",
      count: notifications.length,
      data: notifications
    })

  } catch (err) {
    res.status(500).json({
      message: "Error fetching notifications",
      err
    })
  }
}

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      })
    }

    if (
      req.user.role !== "admin" &&
      notification.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not allowed to update this notification"
      })
    }

    notification.isRead = true
    await notification.save()

    res.status(200).json({
      message: "Notification marked as read",
      data: notification
    })
  } catch (err) {
    res.status(500).json({
      message: "Error updating notification",
      err
    })
  }
}

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      })
    }

    if (
      req.user.role !== "admin" &&
      notification.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not allowed to delete this notification"
      })
    }

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
  markNotificationAsRead,
  deleteNotification
}
