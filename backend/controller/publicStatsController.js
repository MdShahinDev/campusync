const University = require("../model/University");
const Course = require("../model/Course");
const User = require("../model/User");
const Resource = require("../model/Resource");
const Component = require("../model/Component");

const countDistinctDepartments = async () => {
  const departments = await User.distinct("department", {
    department: { $nin: [null, ""] },
  });

  const unique = new Set();
  for (const department of departments) {
    const normalized = String(department).trim().toLowerCase();
    if (normalized) unique.add(normalized);
  }
  return unique.size;
};

exports.getPublicStats = async (req, res) => {
  try {
    const [totalUniversities, totalCourses, totalUsers, totalResources, totalComponents, totalDepartments] =
      await Promise.all([
        University.countDocuments(),
        Course.countDocuments(),
        User.countDocuments(),
        Resource.countDocuments(),
        Component.countDocuments({ is_active: true }),
        countDistinctDepartments(),
      ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          universities: totalUniversities,
          courses: totalCourses,
          users: totalUsers,
          resources: totalResources,
          components: totalComponents,
          departments: totalDepartments,
        },
      },
    });
  } catch (error) {
    console.error("Get public stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
