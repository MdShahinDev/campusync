import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  { id: "student", label: "Student", icon: GraduationCap },
  { id: "moderator", label: "Moderator", icon: ShieldCheck },
];

const departments = [
  "Computer Science",
  "Engineering",
  "Business",
  "Arts",
  "Science",
];

export default function NewUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New user created:", formData);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          to="/admin/all-users"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-orange transition-colors mb-3"
        >
          <ArrowLeft size={16} />
          Back to Users
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Add New User
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Create a new user account.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-6 space-y-5"
      >
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-2xl font-bold">
            <User size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Profile Photo
            </p>
            <p className="text-xs text-text-muted">
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </div>

        {/* Full Name */}
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
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
              required
            />
          </div>
        </div>

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
              placeholder="john@university.edu"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
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
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
              required
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setFormData({ ...formData, role: role.id })}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                  formData.role === role.id
                    ? "border-accent-orange bg-accent-orange/10 text-accent-orange"
                    : "border-border-color text-text-secondary hover:border-text-muted/30"
                }`}
              >
                <role.icon size={18} />
                <span className="text-sm font-medium">{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Department
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
            required
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Create User
          </button>
          <Link
            to="/admin/all-users"
            className="px-6 py-3 rounded-xl bg-bg-secondary border border-border-color text-text-primary font-medium text-sm hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
