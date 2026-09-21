import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";
import api from "../../../services/axios";

const CATEGORIES = [
  "Books",
  "Electronics",
  "Laboratory",
  "Rooms",
  "Cameras",
  "IoT Kits",
  "Projectors",
  "Creative Tools",
];

const CONDITIONS = ["New", "Excellent", "Good", "Fair", "Poor"];

export default function EditComponent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    quantity: 1,
    condition: "Good",
    location: "",
  });
  const [existingImage, setExistingImage] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchComponent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/components/${id}`);
      const comp = res.data.data.component;
      setForm({
        name: comp.name || "",
        description: comp.description || "",
        category: comp.category || "",
        quantity: comp.quantity || 1,
        condition: comp.condition || "Good",
        location: comp.location || "",
      });
      setExistingImage(comp.image_url || "");
    } catch {
      setError("Failed to load component");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Math.max(1, parseInt(value) || 1) : value,
    }));
    setError("");
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(selected.type)) {
      setError("Only JPG, PNG, GIF, and WebP images are allowed");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setFile(selected);
    setExistingImage("");
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    setExistingImage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Component name is required");
      return;
    }
    if (!form.category) {
      setError("Category is required");
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("name", form.name.trim());
      submitData.append("description", form.description.trim());
      submitData.append("category", form.category);
      submitData.append("quantity", form.quantity);
      submitData.append("condition", form.condition);
      submitData.append("location", form.location.trim());
      if (file) {
        submitData.append("image", file);
      }

      await api.put(`/components/${id}`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/student/my-components");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update component");
    } finally {
      setSubmitting(false);
    }
  };

  const currentImage = preview || (existingImage ? `${import.meta.env.VITE_API_URL}/components/${id}/image` : "");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={32} className="animate-spin text-accent-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link
          to="/student/my-components"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-orange transition-colors mb-3"
        >
          <ArrowLeft size={16} />
          Back to My Components
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Edit Component
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Update your component details.
        </p>
      </div>

      {/* Success */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
        >
          <CheckCircle size={20} className="text-green-500 shrink-0" />
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Component updated successfully!
          </p>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-6 space-y-5"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Component Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Raspberry Pi 5 Kit"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description of the component..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 resize-none"
          />
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Category *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Condition
            </label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            min={1}
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Image
          </label>
          <p className="text-xs text-text-muted mb-2">
            JPG, PNG, GIF, or WebP. Max 10MB.
          </p>

          {currentImage ? (
            <div className="relative inline-block">
              <img
                src={currentImage}
                alt="Preview"
                className="w-32 h-32 rounded-xl object-cover border border-border-color"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border-color rounded-xl hover:border-accent-orange/50 transition-colors cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.webp"
                className="hidden"
              />
              <Upload size={24} className="text-text-muted mb-1" />
              <span className="text-xs text-text-muted">
                Click to upload an image
              </span>
            </label>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Engineering Lab 2, Shelf B3"
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || success}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Updating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Package size={16} />
              Update Component
            </span>
          )}
        </button>
      </motion.form>
    </div>
  );
}
