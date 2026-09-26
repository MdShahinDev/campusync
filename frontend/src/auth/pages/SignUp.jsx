import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Layers,
  UserCog,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/axios";

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
];

const departments = [
  "Computer Science",
  "Electrical and Electronics Engineering",
  "Business",
  "Bachelor of Business Administration",
  "Economics",
];

const steps = [
  { id: 1, label: "Personal", description: "Tell us a little about yourself" },
  { id: 2, label: "Education", description: "Add your university and academic details" },
  { id: 3, label: "Security", description: "Create a secure password for your account" },
];

const initialFormState = {
  name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  studentId: "",
  department: "",
  university: "",
};

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

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("student");
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await api.get("/universities");
        setUniversities(response.data.data.universities);
      } catch {
        setUniversities([]);
      }
    };
    fetchUniversities();
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "username":
        if (!value.trim()) return "Username is required";
        if (value.trim().length < 3) return "Username must be at least 3 characters";
        if (value.trim().length > 30) return "Username cannot exceed 30 characters";
        if (!/^[a-zA-Z0-9_]+$/.test(value.trim()))
          return "Username can only contain letters, numbers, and underscores";
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
      case "university":
        if (!value) return "University is required";
        return "";
      default:
        return "";
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Full name is required";
      else if (formData.name.trim().length < 2)
        newErrors.name = "Name must be at least 2 characters";

      if (!formData.username.trim()) newErrors.username = "Username is required";
      else if (formData.username.trim().length < 3)
        newErrors.username = "Username must be at least 3 characters";
      else if (formData.username.trim().length > 30)
        newErrors.username = "Username cannot exceed 30 characters";
      else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim()))
        newErrors.username = "Username can only contain letters, numbers, and underscores";

      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(formData.email))
        newErrors.email = "Please enter a valid email";
    }

    if (step === 2) {
      if (!formData.university) newErrors.university = "University is required";

      if (selectedRole === "student") {
        if (!formData.studentId.trim())
          newErrors.studentId = "Student ID is required";
        if (!formData.department) newErrors.department = "Department is required";
      }
    }

    if (step === 3) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";

      if (!formData.confirmPassword)
        newErrors.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => prev + 1);
      setServerError("");
    }
  };

  const handlePrevious = () => {
    setServerError("");
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (currentStep !== 3) return;
    setServerError("");
    setSuccessMessage("");

    if (!validateStep(3)) return;

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        username: formData.username.trim(),
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        university: formData.university,
      };

      if (selectedRole === "student") {
        payload.studentId = formData.studentId;
        payload.department = formData.department;
      }

      await signup(payload);
      setSuccessMessage("Account created successfully! Redirecting...");

      setTimeout(() => {
        if (selectedRole === "moderator") {
          navigate("/moderator/dashboard");
        } else {
          navigate("/student/dashboard");
        }
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

        // Navigate to the step containing the first error
        const step1Fields = ["name", "username", "email"];
        const step2Fields = ["university", "studentId", "department"];
        const errorFields = Object.keys(fieldErrors);

        if (errorFields.some((f) => step3Fields.includes(f))) {
          setCurrentStep(3);
        } else if (errorFields.some((f) => step2Fields.includes(f))) {
          setCurrentStep(2);
        } else if (errorFields.some((f) => step1Fields.includes(f))) {
          setCurrentStep(1);
        }
      } else {
        setServerError(response?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const step3Fields = ["password", "confirmPassword"];

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setFormData(initialFormState);
    setErrors({});
    setServerError("");
    setSuccessMessage("");
    setCurrentStep(1);
    setCompletedSteps(new Set());
  };

  const inputBaseClass =
    "w-full rounded-lg border bg-bg-secondary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:ring-2";

  const getInputClass = (field) =>
    `${inputBaseClass} ${
      errors[field]
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
        : "border-border-color focus:border-accent-orange/60 focus:ring-accent-orange/15"
    }`;

  const getSelectClass = (field) => `appearance-none pr-9 ${getInputClass(field)}`;

  const getStepTitle = () => {
    const step = steps.find((s) => s.id === currentStep);
    return step ? step.description : "";
  };

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
            Create Account
          </h1>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/55">
            Sign up for a new account
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-8 lg:py-14">
        <div className="w-full max-w-sm">
          {/* Role Selection */}
          <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-lg border border-border-color bg-bg-secondary p-1.5">
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

          {/* Step Indicator */}
          <div className="mb-6">
            <ol className="grid grid-cols-3 gap-2">
              {steps.map((step) => {
                const isCompleted =
                  completedSteps.has(step.id) && currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const isReached = isCompleted || isCurrent;

                return (
                  <li
                    key={step.id}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <div
                      className={`h-1 rounded-full transition-colors duration-300 ${
                        isReached ? "bg-accent-orange" : "bg-border-color"
                      }`}
                    />
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums transition-colors duration-300 ${
                          isReached
                            ? "bg-accent-orange text-white"
                            : "border border-border-color text-text-muted"
                        }`}
                      >
                        {isCompleted ? (
                          <Check size={11} strokeWidth={3} />
                        ) : (
                          step.id
                        )}
                      </span>
                      <span
                        className={`truncate text-xs font-medium transition-colors duration-300 ${
                          isCurrent ? "text-text-primary" : "text-text-muted"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Step Header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="mb-5"
            >
              <h2 className="text-lg font-semibold text-text-primary">
                {steps.find((s) => s.id === currentStep)?.label === "Personal"
                  ? "Personal Information"
                  : steps.find((s) => s.id === currentStep)?.label === "Education"
                  ? "Educational Information"
                  : "Security"}
              </h2>
              <p className="mt-0.5 text-sm text-text-muted">{getStepTitle()}</p>
            </motion.div>
          </AnimatePresence>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {/* Step 1 - Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="signup-name"
                      className="mb-1.5 block text-[13px] font-medium text-text-secondary"
                    >
                      Full Name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                      disabled={isLoading}
                      autoComplete="name"
                      className={getInputClass("name")}
                    />
                    <AnimatePresence>
                      <ErrorText field="name" errors={errors} />
                    </AnimatePresence>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-username"
                      className="mb-1.5 block text-[13px] font-medium text-text-secondary"
                    >
                      Username
                    </label>
                    <input
                      id="signup-username"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="johndoe"
                      disabled={isLoading}
                      autoComplete="username"
                      className={getInputClass("username")}
                    />
                    <AnimatePresence>
                      <ErrorText field="username" errors={errors} />
                    </AnimatePresence>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-email"
                      className="mb-1.5 block text-[13px] font-medium text-text-secondary"
                    >
                      Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="you@university.edu"
                      disabled={isLoading}
                      autoComplete="email"
                      className={getInputClass("email")}
                    />
                    <AnimatePresence>
                      <ErrorText field="email" errors={errors} />
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Step 2 - Educational Information */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="signup-university"
                      className="mb-1.5 block text-[13px] font-medium text-text-secondary"
                    >
                      University
                    </label>
                    <div className="relative">
                      <select
                        id="signup-university"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isLoading}
                        className={getSelectClass("university")}
                      >
                        <option value="">Select university</option>
                        {universities.map((uni) => (
                          <option key={uni._id} value={uni._id}>
                            {uni.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                      />
                    </div>
                    <AnimatePresence>
                      <ErrorText field="university" errors={errors} />
                    </AnimatePresence>
                  </div>

                  {selectedRole === "student" && (
                    <>
                      <div>
                        <label
                          htmlFor="signup-student-id"
                          className="mb-1.5 block text-[13px] font-medium text-text-secondary"
                        >
                          Student ID
                        </label>
                        <input
                          id="signup-student-id"
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g. 2024-001"
                          disabled={isLoading}
                          className={getInputClass("studentId")}
                        />
                        <AnimatePresence>
                          <ErrorText field="studentId" errors={errors} />
                        </AnimatePresence>
                      </div>

                      <div>
                        <label
                          htmlFor="signup-department"
                          className="mb-1.5 block text-[13px] font-medium text-text-secondary"
                        >
                          Department
                        </label>
                        <div className="relative">
                          <select
                            id="signup-department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isLoading}
                            className={getSelectClass("department")}
                          >
                            <option value="">Select department</option>
                            {departments.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                          />
                        </div>
                        <AnimatePresence>
                          <ErrorText field="department" errors={errors} />
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Step 3 - Security */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="signup-password"
                      className="mb-1.5 block text-[13px] font-medium text-text-secondary"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Create a password"
                        disabled={isLoading}
                        autoComplete="new-password"
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

                  <div>
                    <label
                      htmlFor="signup-confirm-password"
                      className="mb-1.5 block text-[13px] font-medium text-text-secondary"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Confirm your password"
                        disabled={isLoading}
                        autoComplete="new-password"
                        className={`${getInputClass("confirmPassword")} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading}
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                    <AnimatePresence>
                      <ErrorText field="confirmPassword" errors={errors} />
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={isLoading}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border-color bg-bg-primary px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors duration-150 hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
              )}

              <button
                type="button"
                onClick={currentStep < 3 ? handleNext : handleSubmit}
                disabled={isLoading}
                className="flex flex-[2] cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-accent-orange-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Creating Account...
                  </>
                ) : currentStep < 3 ? (
                  <>
                    Next
                    <ChevronRight size={16} />
                  </>
                ) : (
                  `Sign up as ${roles.find((r) => r.id === selectedRole)?.label}`
                )}
              </button>
            </div>
          </form>

          <p className="mt-7 border-t border-border-color pt-6 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-accent-orange transition-colors hover:text-accent-orange-hover"
            >
              Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
