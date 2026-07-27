import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload } from "lucide-react";
import { Link } from "react-router-dom";

export default function AddResource() {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    capacity: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Resource submitted:", formData);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          to="/dashboard/resource"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-orange transition-colors mb-3"
        >
          <ArrowLeft size={16} />
          Back to Resources
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Add Resource
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Create a new resource entry.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-6 space-y-5"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Resource Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Conference Room A"
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
            required
          >
            <option value="">Select type</option>
            <option value="room">Room</option>
            <option value="laboratory">Laboratory</option>
            <option value="hall">Hall</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Capacity
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="e.g. 20"
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the resource..."
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 resize-none"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Image
          </label>
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border-color rounded-xl hover:border-accent-orange/50 transition-colors cursor-pointer">
            <div className="text-center">
              <Upload size={24} className="mx-auto text-text-muted mb-1" />
              <p className="text-xs text-text-muted">
                Click to upload or drag and drop
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Add Resource
        </button>
      </motion.form>
    </div>
  );
}
