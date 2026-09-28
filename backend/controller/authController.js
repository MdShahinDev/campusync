const jwt = require("jsonwebtoken");
const path = require("path");
const { validationResult } = require("express-validator");
const { put, del } = require("@vercel/blob");
const User = require("../model/User");
const University = require("../model/University");
const Activity = require("../model/Activity");
const {
  notifyAccountCreated,
  notifyAccountApproved,
  notifyAccountRejected,
  notifyNewUserRegistered,
  notifyUniversityNewStudent,
} = require("../services/notificationService");

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

    // The account exists → only now are notifications created.
    // Self-signed users get their own welcome/approval notification, admins
    // learn about every new account, and moderators of the student's
    // university are notified (never moderators of another university).
    await notifyAccountCreated(user);
    await notifyNewUserRegistered(user);
    await notifyUniversityNewStudent(user);

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
    await user.populate("university");

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

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
      });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({
        success: false,
        message: "File storage not configured. Please set BLOB_READ_WRITE_TOKEN.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ext = path.extname(req.file.originalname).toLowerCase() || ".jpg";
    const blobName = `avatars/${user._id}-${Date.now()}${ext}`;

    const blob = await put(blobName, req.file.buffer, {
      contentType: req.file.mimetype,
      // Same private-blob convention as components/resources in this project;
      // images are served back through the authenticated app proxy below.
      access: "private",
    });

    // Remove the previous avatar blob — only ever our own avatars/ objects.
    if (
      user.avatar &&
      user.avatar.includes(".blob.vercel-storage.com") &&
      user.avatar.includes("/avatars/")
    ) {
      try {
        await del(user.avatar);
      } catch (blobError) {
        console.error("Avatar blob delete error:", blobError);
      }
    }

    user.avatar = blob.url;
    await user.save();
    await user.populate("university");

    res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("UpdateAvatar error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Removes the caller's own profile photo (session-derived identity only).
exports.removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const previousAvatar = user.avatar;
    user.avatar = "";
    await user.save();

    // The new state is already persisted — the old blob is only a leftover
    // copy, so a delete failure never breaks the response.
    if (
      previousAvatar &&
      previousAvatar.includes(".blob.vercel-storage.com") &&
      previousAvatar.includes("/avatars/")
    ) {
      try {
        await del(previousAvatar);
      } catch (blobError) {
        console.error("Avatar blob delete error:", blobError);
      }
    }

    await user.populate("university");

    res.status(200).json({
      success: true,
      message: "Profile photo removed successfully",
      data: { user },
    });
  } catch (error) {
    console.error("RemoveAvatar error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/*
 * Streams a user's profile photo.
 *
 * Avatars live in the project's private Vercel Blob store (same store used by
 * components/resources), so <img> tags cannot load the raw blob URL directly.
 * This endpoint mirrors the existing GET /components/:id/image proxy: it looks
 * the user up from the database and streams the stored blob with the server
 * token. No identity is taken from the client beyond the user id to display.
 */
exports.getUserAvatar = async (req, res) => {
  try {
    let user;
    try {
      user = await User.findById(req.params.id).select("avatar");
    } catch (castError) {
      if (castError.name === "CastError") {
        return res.status(404).json({ success: false, message: "Avatar not found" });
      }
      throw castError;
    }

    if (
      !user ||
      !user.avatar ||
      !user.avatar.includes(".blob.vercel-storage.com") ||
      !user.avatar.includes("/avatars/")
    ) {
      return res.status(404).json({ success: false, message: "Avatar not found" });
    }

    const blobResponse = await fetch(user.avatar, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });

    if (!blobResponse.ok) {
      return res.status(404).json({ success: false, message: "Avatar not found" });
    }

    const ext = (user.avatar.split("?")[0].split(".").pop() || "").toLowerCase();
    const contentType =
      {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
      }[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    // The user id URL is stable across uploads, so never let browsers cache it.
    res.setHeader("Cache-Control", "no-cache");

    const reader = blobResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error) {
    console.error("GetUserAvatar error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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

    await notifyAccountApproved({ user, actor: req.user._id });

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
      await User.findByIdAndUpdate(user._id, { feedbackSent: true, rejectionReason: feedback.trim() });
    }

    // Rejection already persisted → inform the student about it (with the
    // feedback when one was given, gracefully handled when it was not).
    await notifyAccountRejected({ user, feedback, actor: req.user._id });

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
      isVerified: true,
    });

    // Account exists → let the other admins know about the new account.
    await notifyNewUserRegistered(user);

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
