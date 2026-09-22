const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../model/User");
const University = require("../model/University");
const Notification = require("../model/Notification");
const Activity = require("../model/Activity");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const { name, username, email, password, role, studentId, department, university } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
        errors: [{ field: "email", message: "Email already in use" }],
      });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "This username is already taken",
        errors: [{ field: "username", message: "Username already in use" }],
      });
    }

    const universityExists = await University.findById(university);
    if (!universityExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid university selection",
        errors: [{ field: "university", message: "Please select a valid university" }],
      });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name is required and must be at least 2 characters",
        errors: [{ field: "name", message: "Name must be at least 2 characters" }],
      });
    }

    if (role === "student") {
      if (!studentId || !department) {
        return res.status(400).json({
          success: false,
          message: "Student ID and department are required for students",
          errors: [
            ...(!studentId
              ? [{ field: "studentId", message: "Student ID is required" }]
              : []),
            ...(!department
              ? [{ field: "department", message: "Department is required" }]
              : []),
          ],
        });
      }
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
      role: role || "student",
      studentId: studentId || "",
      department: department || "",
      university,
    });

    await user.populate("university");

    const token = generateToken(user._id);

    if (user.role === "student" || user.role === "moderator") {
      await Notification.create({
        userId: user._id,
        title: "Welcome to CampusSync",
        message: "Your account has created",
        type: "info",
      });
    }

    await Activity.create({
      type: "USER_REGISTERED",
      actor: { userId: user._id, name: user.name, role: user.role },
      target: { id: user._id, name: user.name, model: "User" },
      description: `${user.name} registered as a ${user.role}`,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      if (duplicateField === "username") {
        return res.status(409).json({
          success: false,
          message: "This username is already taken",
          errors: [{ field: "username", message: "Username already in use" }],
        });
      }
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
        errors: [{ field: "email", message: "Email already in use" }],
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password").populate("university");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errors: [{ field: "email", message: "Invalid credentials" }],
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errors: [{ field: "password", message: "Invalid credentials" }],
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("university");
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, studentId } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (studentId !== undefined) user.studentId = studentId;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("UpdateProfile error:", error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      if (duplicateField === "username") {
        return res.status(409).json({
          success: false,
          message: "This username is already taken",
          errors: [{ field: "username", message: "Username already in use" }],
        });
      }
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
        errors: [{ field: "email", message: "Email already in use" }],
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};

    if (req.query.verified === "true") filter.isVerified = true;
    if (req.query.verified === "false") filter.isVerified = false;
    if (req.query.role) filter.role = req.query.role;

    if (req.query.excludeSelf === "true") {
      filter._id = { $ne: req.user._id };
    }

    if (req.user.role === "moderator") {
      filter.university = req.user.university;
    }

    const users = await User.find(filter)
      .select("-password")
      .populate("university")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error("GetAllUsers error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("university");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("GetUserById error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, rejectionReason: "" },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      data: { user },
    });
  } catch (error) {
    console.error("ApproveUser error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const { feedback } = req.body;

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (feedback && feedback.trim()) {
      await Notification.create({
        userId: user._id,
        title: "Account Rejected",
        message: feedback.trim(),
        type: "warning",
      });

      await User.findByIdAndUpdate(user._id, { feedbackSent: true, rejectionReason: feedback.trim() });

      await Notification.create({
        userId: req.user._id,
        title: "Feedback Sent",
        message: `You rejected ${user.name}'s account and sent feedback.`,
        type: "info",
      });
    }

    res.status(200).json({
      success: true,
      message: "User rejected successfully.",
      data: { user },
    });
  } catch (error) {
    console.error("RejectUser error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: { user: { _id: user._id } },
    });
  } catch (error) {
    console.error("DeleteUser error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .select("name username email phone avatar bio location university role createdAt")
      .populate("university", "name");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("GetUserByUsername error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.adminSignup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
        errors: [{ field: "email", message: "Email already in use" }],
      });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name is required and must be at least 2 characters",
        errors: [{ field: "name", message: "Name must be at least 2 characters" }],
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Admin signup error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
        errors: [{ field: "email", message: "Email already in use" }],
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
