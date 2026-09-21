const User = require("../model/User");
const Resource = require("../model/Resource");
const Component = require("../model/Component");
const Activity = require("../model/Activity");

exports.getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalModerators,
      totalResources,
      totalComponents,
      pendingUsers,
      recentActivities,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "moderator" }),
      Resource.countDocuments(),
      Component.countDocuments(),
      User.countDocuments({ isVerified: false }),
      Activity.find().sort({ createdAt: -1 }).limit(8),
    ]);

    const totalUsers = totalStudents + totalModerators;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalModerators,
        totalResources,
        totalComponents,
        pendingUsers,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Get admin dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
