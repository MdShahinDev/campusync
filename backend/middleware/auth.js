const jwt = require("jsonwebtoken");
const User = require("../model/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Unverified moderators keep read-only access (GET routes stay open) but are
// blocked from every moderation/write action until an admin verifies them.
// Admins and students are unaffected — admins are always verified and student
// verification is enforced by the existing per-controller checks.
const requireVerifiedModerator = (req, res, next) => {
  if (req.user && req.user.role === "moderator" && !req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message:
        "Your account is not verified yet. You have read-only access until an administrator verifies your account.",
    });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // No valid token — continue as guest
  }
  next();
};

module.exports = { protect, authorize, optionalAuth, requireVerifiedModerator };
