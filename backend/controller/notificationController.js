const Notification = require("../model/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: { notifications, unreadCount },
    });
  } catch (error) {
    console.error("GetNotifications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    console.error("MarkAsRead error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("MarkAllAsRead error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
