import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Layers,
  Lock,
  Mail,
  User,
  UserCog,
  ShieldCheck,
  GraduationCap,
  BookOpen,
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

const departments = [
  "Computer Science",
  "Engineering",
  "Business",
  "Arts",
  "Science",
];

const initialFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  studentId: "",
  department: "",
};

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Please enter a valid email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      case "studentId":
        if (selectedRole === "student" && !value.trim()) return "Student ID is required";
        return "";
      case "department":
        if (selectedRole === "student" && !value) return "Department is required";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedRole === "student") {
      if (!formData.name.trim()) newErrors.name = "Full name is required";
      else if (formData.name.trim().length < 2)
        newErrors.name = "Name must be at least 2 characters";

      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(formData.email))
        newErrors.email = "Please enter a valid email";

      if (!formData.studentId.trim())
        newErrors.studentId = "Student ID is required";

      if (!formData.department) newErrors.department = "Department is required";
    } else {
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(formData.email))
        newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

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
      const payload = {
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      };

      if (selectedRole === "student") {
        payload.name = formData.name;
        payload.studentId = formData.studentId;
        payload.department = formData.department;
      }

      await signup(payload);
      setSuccessMessage("Account created successfully! Redirecting...");

      setTimeout(() => {
        navigate("/student/dashboard");
      }, 1500);
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
    setFormData(initialFormState);
    setErrors({});
    setServerError("");
    setSuccessMessage("");
  };

  const ErrorText = ({ field }) => {
    if (!errors[field]) return null;
    return (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="flex items-center gap-1 mt-1.5 text-xs text-red-500"
      >
        <AlertCircle size={12} />
        {errors[field]}
      </motion.p>
    );
  };

  const inputBaseClass =
    "w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border text-text-primary text-sm focus:outline-none focus:ring-1 transition-colors duration-200";

  const getInputClass = (field) =>
    `${inputBaseClass} ${
      errors[field]
        ? "border-red-500 focus:ring-red-500/30"
        : "border-border-color focus:ring-border-color"
    }`;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A00] to-[#FF6B00] text-white shadow-md shadow-orange-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-accent-orange">
            Resora
          </span>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text-primary">
              Create Account
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Sign up for a new account
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map((role) => (
              <motion.button
                key={role.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleChange(role.id)}
                disabled={isLoading}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  selectedRole === role.id
                    ? `${role.border} bg-bg-secondary`
                    : "border-border-color hover:border-text-muted/30"
                } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
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

          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30"
              >
                <p className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle size={16} />
                  {serverError}
                </p>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30"
              >
                <p className="flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle2 size={16} />
                  {successMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {selectedRole === "student" && (
                <motion.div
                  key="student-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                      />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="John Doe"
                        disabled={isLoading}
                        className={getInputClass("name")}
                      />
                    </div>
                    <AnimatePresence>
                      <ErrorText field="name" />
                    </AnimatePresence>
                  </div>

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
                        onBlur={handleBlur}
                        placeholder="you@university.edu"
                        disabled={isLoading}
                        className={getInputClass("email")}
                      />
                    </div>
                    <AnimatePresence>
                      <ErrorText field="email" />
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Student ID
                    </label>
                    <div className="relative">
                      <BookOpen
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                      />
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 2024-001"
                        disabled={isLoading}
                        className={getInputClass("studentId")}
                      />
                    </div>
                    <AnimatePresence>
                      <ErrorText field="studentId" />
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isLoading}
                      className={`w-full px-4 py-2.5 rounded-xl bg-bg-secondary border text-text-primary text-sm focus:outline-none focus:ring-1 transition-colors duration-200 ${
                        errors.department
                          ? "border-red-500 focus:ring-red-500/30"
                          : "border-border-color focus:ring-border-color"
                      }`}
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <AnimatePresence>
                      <ErrorText field="department" />
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {(selectedRole === "moderator" || selectedRole === "admin") && (
                <motion.div
                  key="mod-admin-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 overflow-hidden"
                >
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
                        onBlur={handleBlur}
                        placeholder="you@example.com"
                        disabled={isLoading}
                        className={getInputClass("email")}
                      />
                    </div>
                    <AnimatePresence>
                      <ErrorText field="email" />
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  onBlur={handleBlur}
                  placeholder="Create a password"
                  disabled={isLoading}
                  className={`${getInputClass("password")} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <AnimatePresence>
                <ErrorText field="password" />
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  className={`${getInputClass("confirmPassword")} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              <AnimatePresence>
                <ErrorText field="confirmPassword" />
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                `Sign up as ${roles.find((r) => r.id === selectedRole)?.label}`
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-accent-orange hover:text-accent-orange-hover transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
