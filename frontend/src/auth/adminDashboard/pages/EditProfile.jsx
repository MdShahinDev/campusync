import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/axios";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put("/auth/profile", formData);
      updateUser(response.data.data.user);
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        navigate("/admin/profile");
      }, 1000);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update profile";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          to="/admin/profile"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-orange transition-colors mb-3"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Edit Profile
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Update your profile information.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-6 space-y-5"
      >
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
            {success}
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-bg-primary border border-border-color text-text-muted hover:text-accent-orange transition-colors"
            >
              <Camera size={14} />
            </button>
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

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter your location"
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            to="/admin/profile"
            className="px-6 py-3 rounded-xl bg-bg-secondary border border-border-color text-text-primary font-medium text-sm hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
