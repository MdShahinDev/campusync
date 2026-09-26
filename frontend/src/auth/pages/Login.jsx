import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Layers,
  UserCog,
  ShieldCheck,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const roles = [
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    iconColor: "text-blue-500",
  },
  {
    id: "moderator",
    label: "Moderator",
    icon: UserCog,
    iconColor: "text-green-500",
  },
  {
    id: "admin",
    label: "Admin",
    icon: ShieldCheck,
    iconColor: "text-purple-500",
  },
];

const dashboardRoutes = {
  student: "/student/dashboard",
  moderator: "/moderator/dashboard",
  admin: "/admin/dashboard",
};

const inputBaseClass =
  "w-full rounded-lg border bg-bg-secondary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:ring-2";

function ErrorText({ field, errors }) {
  if (!errors[field]) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
    >
      <AlertCircle size={12} />
      {errors[field]}
    </motion.p>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      const userRole = response.data.user.role;

      setSuccessMessage("Login successful! Redirecting...");

      setTimeout(() => {
        navigate(dashboardRoutes[userRole] || "/student/dashboard");
      }, 1000);
    } catch (err) {
      const response = err.response?.data;

      if (response?.errors && response.errors.length > 0) {
        const fieldErrors = {};
        response.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        setServerError(response.message || "Please fix the errors below");
      } else {
        setServerError(response?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setFormData({ email: "", password: "" });
    setErrors({});
    setServerError("");
    setSuccessMessage("");
  };

  const getInputClass = (field) =>
    `${inputBaseClass} ${
      errors[field]
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
        : "border-border-color focus:border-accent-orange/60 focus:ring-accent-orange/15"
    }`;

  return (
    <div className="min-h-screen bg-bg-primary font-inter lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative flex flex-col overflow-hidden bg-[#0B1220] px-6 py-7 sm:px-10 lg:min-h-screen lg:border-r lg:border-white/5 lg:px-14 lg:py-12">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark" />

        <div className="relative">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className="relative flex flex-1 flex-col justify-center py-10 lg:py-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF8A00] to-[#FF6B00] text-white">
              <Layers className="h-[18px] w-[18px]" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-accent-orange">
              Campus Sync
            </span>
          </div>

          <h1 className="mt-9 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Welcome Back
          </h1>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/55">
            Sign in to your account
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-8 lg:py-14">
        <div className="w-full max-w-sm">
          {/* Role selection */}
          <div className="mb-7 grid grid-cols-3 gap-1.5 rounded-lg border border-border-color bg-bg-secondary p-1.5">
            {roles.map((role) => {
              const isActive = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleChange(role.id)}
                  disabled={isLoading}
                  aria-pressed={isActive}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[13px] font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-bg-primary text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                  } ${
                    isLoading
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  }`}
                >
                  <role.icon
                    size={15}
                    className={`shrink-0 ${isActive ? role.iconColor : "text-text-muted"}`}
                  />
                  <span className="truncate">{role.label}</span>
                </button>
              );
            })}
          </div>

          {/* Error / Success Messages */}
          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5"
              >
                <p className="flex items-start gap-2 text-sm text-red-500">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {serverError}
                </p>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5"
              >
                <p className="flex items-start gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  {successMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-[13px] font-medium text-text-secondary"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={isLoading}
                autoComplete="email"
                className={getInputClass("email")}
              />
              <AnimatePresence>
                <ErrorText field="email" errors={errors} />
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-[13px] font-medium text-text-secondary"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className={`${getInputClass("password")} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <AnimatePresence>
                <ErrorText field="password" errors={errors} />
              </AnimatePresence>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-accent-orange-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                `Login as ${roles.find((r) => r.id === selectedRole)?.label}`
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-7 border-t border-border-color pt-6 text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-accent-orange transition-colors hover:text-accent-orange-hover"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
