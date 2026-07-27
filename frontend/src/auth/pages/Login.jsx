import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Layers,
  Lock,
  Mail,
  UserCog,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    color: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-500",
    border: "border-blue-500/30",
  },
  {
    id: "moderator",
    label: "Moderator",
    icon: UserCog,
    color: "from-green-500/20 to-green-600/20",
    iconColor: "text-green-500",
    border: "border-green-500/30",
  },
  {
    id: "admin",
    label: "Admin",
    icon: ShieldCheck,
    color: "from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-500",
    border: "border-purple-500/30",
  },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login:", { ...formData, role: selectedRole });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* Back to Home */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-10"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-accent-orange transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A00] to-[#FF6B00] text-white shadow-md shadow-orange-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-accent-orange">
            Resora
          </span>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome Back
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Sign in to your account
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map((role) => (
              <motion.button
                key={role.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === role.id
                    ? `${role.border} bg-bg-secondary`
                    : "border-border-color hover:border-text-muted/30"
                }`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${role.color}`}>
                  <role.icon size={18} className={role.iconColor} />
                </div>
                <span className="text-xs font-semibold text-text-primary">
                  {role.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-border-color"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-border-color"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forget Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-border-color text-accent-orange focus:ring-accent-orange/30 bg-bg-secondary"
                />
                <span className="text-sm text-text-secondary">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-accent-orange hover:text-accent-orange-hover transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              Login as {roles.find((r) => r.id === selectedRole)?.label}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-text-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-accent-orange hover:text-accent-orange-hover transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
