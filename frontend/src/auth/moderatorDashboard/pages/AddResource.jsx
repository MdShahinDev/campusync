import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, FileText, File, Image, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/axios";

export default function AddResource() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    course_code: "",
    course_title: "",
    resource_type: "",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const getFileExtension = (filename) => {
    return filename.split(".").pop().toLowerCase();
  };

  const validateFile = (selectedFile, resourceType) => {
    if (!selectedFile) return "Please select a file";

    const ext = getFileExtension(selectedFile.name);
    const validExtensions = {
      PDF: ["pdf"],
      PPTX: ["pptx"],
      Image: ["jpg", "jpeg", "png", "gif", "webp"],
    };

    if (!validExtensions[resourceType]?.includes(ext)) {
      return `Invalid file type. For ${resourceType}, allowed files: ${validExtensions[resourceType]?.join(", ")}`;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.course_code || !formData.course_title || !formData.resource_type) {
      setError("All fields are required");
      return;
    }

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    const fileError = validateFile(file, formData.resource_type);
    if (fileError) {
      setError(fileError);
      return;
    }

    setUploading(true);

    try {
      const submitData = new FormData();
      submitData.append("course_code", formData.course_code);
      submitData.append("course_title", formData.course_title);
      submitData.append("resource_type", formData.resource_type);
      submitData.append("file", file);

      await api.post("/resources", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/moderator/resources");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload resource");
    } finally {
      setUploading(false);
    }
  };

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case "PDF":
        return <FileText size={20} className="text-red-500" />;
      case "PPTX":
        return <File size={20} className="text-orange-500" />;
      case "Image":
        return <Image size={20} className="text-blue-500" />;
      default:
        return <Upload size={20} className="text-text-muted" />;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          to="/moderator/resources"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-orange transition-colors mb-3"
        >
          <ArrowLeft size={16} />
          Back to Resources
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Add Resource
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Upload a new resource file.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-6 space-y-5"
      >
        {/* Course Code */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Course Code *
          </label>
          <input
            type="text"
            name="course_code"
            value={formData.course_code}
            onChange={handleChange}
            placeholder="e.g. CS101"
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
            required
          />
        </div>

        {/* Course Title */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Course Title *
          </label>
          <input
            type="text"
            name="course_title"
            value={formData.course_title}
            onChange={handleChange}
            placeholder="e.g. Introduction to Computer Science"
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
            required
          />
        </div>

        {/* Resource Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Resource Type *
          </label>
          <select
            name="resource_type"
            value={formData.resource_type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
            required
          >
            <option value="">Select type</option>
            <option value="PDF">PDF</option>
            <option value="PPTX">PPTX</option>
            <option value="Image">Image</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Upload File *
          </label>
          {formData.resource_type && (
            <p className="text-xs text-text-muted mb-2">
              Allowed: {formData.resource_type === "PDF" && ".pdf files"}
              {formData.resource_type === "PPTX" && ".pptx files"}
              {formData.resource_type === "Image" && ".jpg, .jpeg, .png, .gif, .webp files"}
            </p>
          )}
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border-color rounded-xl hover:border-accent-orange/50 transition-colors cursor-pointer relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept={
                formData.resource_type === "PDF"
                  ? ".pdf"
                  : formData.resource_type === "PPTX"
                  ? ".pptx"
                  : formData.resource_type === "Image"
                  ? ".jpg,.jpeg,.png,.gif,.webp"
                  : ".pdf,.pptx,.jpg,.jpeg,.png,.gif,.webp"
              }
            />
            <div className="text-center">
              {file ? (
                <div className="flex items-center gap-2">
                  {getResourceTypeIcon(formData.resource_type)}
                  <span className="text-sm text-text-primary">{file.name}</span>
                </div>
              ) : (
                <>
                  <Upload size={24} className="mx-auto text-text-muted mb-1" />
                  <p className="text-xs text-text-muted">
                    Click to upload or drag and drop
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Uploading...
            </span>
          ) : (
            "Upload Resource"
          )}
        </button>
      </motion.form>
    </div>
  );
}
