const User = require("../model/User");
const Resource = require("../model/Resource");
const Component = require("../model/Component");
const Activity = require("../model/Activity");
const Notification = require("../model/Notification");

exports.getModeratorDashboardStats = async (req, res) => {
  try {
    const moderator = await User.findById(req.user._id).select("university");
    if (!moderator || !moderator.university) {
      return res.status(400).json({
        success: false,
        message: "Moderator is not associated with any university",
      });
    }

    const universityId = moderator.university;

    const [
      totalStudents,
      pendingUsers,
      totalResources,
      totalComponents,
      recentActivities,
    ] = await Promise.all([
      User.countDocuments({ role: "student", university: universityId }),
      User.countDocuments({ role: "student", university: universityId, isVerified: false }),
      Resource.countDocuments({ university_id: universityId }),
      Component.countDocuments({ owner_id: { $in: await User.find({ university: universityId }).distinct("_id") } }),
      Activity.find({
        $or: [
          { "target.model": "User", "target.id": { $in: await User.find({ university: universityId }).distinct("_id") } },
          { "target.model": "Resource", "target.id": { $in: await Resource.find({ university_id: universityId }).distinct("_id") } },
          { "target.model": "Component", "target.id": { $in: await Component.find({ owner_id: { $in: await User.find({ university: universityId }).distinct("_id") } }).distinct("_id") } },
          { type: "USER_REGISTERED", "actor.role": "student", "actor.userId": { $in: await User.find({ university: universityId }).distinct("_id") } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        pendingUsers,
        totalResources,
        totalComponents,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Get moderator dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getModeratorPendingUsers = async (req, res) => {
  try {
    const moderator = await User.findById(req.user._id).select("university");
    if (!moderator || !moderator.university) {
      return res.status(400).json({
        success: false,
        message: "Moderator is not associated with any university",
      });
    }

    const users = await User.find({
      role: "student",
      university: moderator.university,
      isVerified: false,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error("Get moderator pending users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.moderatorApproveUser = async (req, res) => {
  try {
    const moderator = await User.findById(req.user._id).select("university");
    if (!moderator || !moderator.university) {
      return res.status(400).json({
        success: false,
        message: "Moderator is not associated with any university",
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (targetUser.role !== "student") {
      return res.status(400).json({
        success: false,
        message: "Only students can be approved through this endpoint",
      });
    }

    if (String(targetUser.university) !== String(moderator.university)) {
      return res.status(403).json({
        success: false,
        message: "You can only approve students from your own university",
      });
    }

    if (targetUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true, runValidators: true }
    ).select("-password");

    await Notification.create({
      userId: user._id,
      senderId: req.user._id,
      title: "Account Approved",
      message: "Your account has been approved. You can now access all features.",
      type: "success",
    });

    await Activity.create({
      type: "USER_APPROVED",
      actor: { userId: req.user._id, name: req.user.name, role: req.user.role },
      target: { id: user._id, name: user.name, model: "User" },
      description: `${req.user.name} approved ${user.name}'s account`,
    });

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Moderator approve user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.moderatorRejectUser = async (req, res) => {
  try {
    const moderator = await User.findById(req.user._id).select("university");
    if (!moderator || !moderator.university) {
      return res.status(400).json({
        success: false,
        message: "Moderator is not associated with any university",
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (targetUser.role !== "student") {
      return res.status(400).json({
        success: false,
        message: "Only students can be rejected through this endpoint",
      });
    }

    if (String(targetUser.university) !== String(moderator.university)) {
      return res.status(403).json({
        success: false,
        message: "You can only reject students from your own university",
      });
    }

    if (targetUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified and cannot be rejected",
      });
    }

    const { feedback } = req.body;

    if (feedback && feedback.trim()) {
      await Notification.create({
        userId: targetUser._id,
        senderId: req.user._id,
        title: "Account Rejected",
        message: feedback.trim(),
        type: "warning",
      });

      await User.findByIdAndUpdate(targetUser._id, { feedbackSent: true });
    }

    await Activity.create({
      type: "USER_REJECTED",
      actor: { userId: req.user._id, name: req.user.name, role: req.user.role },
      target: { id: targetUser._id, name: targetUser.name, model: "User" },
      description: `${req.user.name} rejected ${targetUser.name}'s account`,
    });

    const user = await User.findById(req.params.id).select("-password");

    res.status(200).json({
      success: true,
      message: "User rejected successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Moderator reject user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
