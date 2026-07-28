import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { Link } from "react-router-dom";

const initialData = {
  name: "User Name",
  email: "user@example.com",
  phone: "+880 123 456 789",
  location: "Dhaka, Bangladesh",
  bio: "Passionate about managing resources efficiently and helping teams collaborate better.",
};

export default function EditProfile() {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Profile updated:", formData);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          to="/student/profile"
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
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-2xl font-bold">
              U
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
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <Save size={16} />
            Save Changes
          </button>
          <Link
          to="/student/profile"
            className="px-6 py-3 rounded-xl bg-bg-secondary border border-border-color text-text-primary font-medium text-sm hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
