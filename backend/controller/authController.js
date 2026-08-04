const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../model/User");

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

    const { name, email, password, role, studentId, department } = req.body;

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
      email,
      password,
      role: role || "student",
      studentId: studentId || "",
      department: department || "",
    });

    const token = generateToken(user._id);

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

    const user = await User.findOne({ email }).select("+password");
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
    const user = await User.findById(req.user.id);
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
    const { name, email, phone, location, bio, department, studentId } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
          errors: [{ field: "email", message: "Email already in use" }],
        });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (department !== undefined) user.department = department;
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
      return res.status(409).json({
        success: false,
        message: "Email already in use",
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
    const users = await User.find().select("-password").sort({ createdAt: -1 });
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
