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
    // No valid token �?" continue as guest
  }
  next();
};

// Exact wording used by the API and the dashboard warning.
const SUSPENDED_MESSAGE =
  "Your account is suspended please contact with administration";

// Account-level access restriction. Runs after authentication (and after the
// route's role/verification middleware wherever they are chained), so the
// order is: authentication -> role -> verification/scope -> suspension.
// Suspended accounts keep read access (dashboard, profile, notifications)
// but every state-changing request is rejected with 403.
const requireActiveUser = (req, res, next) => {
  if (req.user && req.user.isSuspended) {
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
    const isActionGet =
      req.method === "GET" && /\/download(\?|$)/.test(req.originalUrl || "");
    if (isMutation || isActionGet) {
      return res.status(403).json({
        success: false,
        message: SUSPENDED_MESSAGE,
      });
    }
  }
  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  requireVerifiedModerator,
  requireActiveUser,
  SUSPENDED_MESSAGE,
};
