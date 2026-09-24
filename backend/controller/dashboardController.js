const Resource = require("../model/Resource");
const Component = require("../model/Component");
const University = require("../model/University");
const Course = require("../model/Course");
const Notification = require("../model/Notification");

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalResources,
      totalComponents,
      totalUniversities,
      totalCourses,
      recentResources,
      recentComponents,
      notifications,
      unreadCount,
    ] = await Promise.all([
      Resource.countDocuments(),
      Component.countDocuments({ is_active: true }),
      University.countDocuments(),
      Course.countDocuments(),
      Resource.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("course_title resource_type uploader_name uploader_username createdAt")
        .lean(),
      Component.find({ is_active: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name category owner_name owner_username createdAt")
        .lean(),
      Notification.find({ recipient: req.user._id })
        .populate("sender", "name username avatar")
        .sort({ createdAt: -1, _id: -1 })
        .limit(10)
        .select(
          "recipient type title message isRead relatedEntityType relatedEntityId metadata sender createdAt"
        )
        .lean(),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    const activity = [
      ...recentResources.map((r) => ({
        type: "resource",
        title: r.course_title,
        category: r.resource_type,
        user: r.uploader_name,
        username: r.uploader_username,
        date: r.createdAt,
      })),
      ...recentComponents.map((c) => ({
        type: "component",
        title: c.name,
        category: c.category,
        user: c.owner_name,
        username: c.owner_username,
        date: c.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalResources,
          totalComponents,
          totalUniversities,
          totalCourses,
        },
        activity,
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
